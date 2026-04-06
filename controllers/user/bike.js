import { prisma } from "../../lib/prisma.js";

export const bike = async (req, res) => {
  const { stationId } = req.params;

  try {
    if (!stationId) {
      return res.status(400).json({
        message: "Station ID is required",
      });
    }

    const docks = await prisma.dock.findMany({
      where: {
        station_id: Number(stationId),

        // 🔥 only docks that actually have AVAILABLE bikes
        bike: {
          is: {
            status: "AVAILABLE",
          },
        },
      },
      select: {
        dock_id: true,
        dock_number: true,

        bike: {
          select: {
            bike_id: true,
            status: true,
            battery_level: true,
          },
        },
      },
    });

    // flatten response (frontend friendly)
    const bikes = docks.map((dock) => ({
      dock_id: dock.dock_id,
      dock_number: dock.dock_number,
      ...dock.bike,
    }));

    return res.status(200).json(bikes);
  } catch (error) {
    console.error("Error fetching bikes:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getBikeById = async (req, res) => {
  const { id } = req.params;

  try {
    const bike = await prisma.bike.findUnique({
      where: {
        bike_id: Number(id),
      },
    });

    if (!bike) {
      return res.status(404).json({
        message: "Bike not found",
      });
    }

    res.json(bike);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const unlockBike = async (req, res) => {
  const { dock_code , user , bike_id} = req.body;

  try {
    // 🔍 1. Find bike by QR
    console.log(dock_code ,user , bike_id);
    const isAlredyInRide = await prisma.ride.findFirst({
      where: {
        user_id: user,
        status: "ONGOING",
      },
    });
    if (isAlredyInRide) {
      return res.status(400).json({
        message: "Finish current ride first",
      });
    }


     const bike = await prisma.bike.findUnique({
  where: {
    qr_code_identifier: dock_code,
  },
  include: {
    dock: {
      include: {
        station: true,
      },
    },
  },
});

if (!bike || !bike.dock || !bike.dock.station) {
  return res.status(404).json({
    error: "Bike, dock, or station not found",
  });
}
const start_lat = bike.dock.station.latitude;
const start_lng = bike.dock.station.longitude;

    if (!bike) {
      return res.status(404).json({
        message: "Invalid QR code",
      });
    }

    // ❌ 2. Check status
    if (bike.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Bike not available",
      });
    }

    // ❌ 3. Must be in a dock
    if (!bike.dock) {
      return res.status(400).json({
        message: "Bike is not docked",
      });
    }

    const dock = bike.dock;

    // 🔓 4. Transaction: unlock system
    const result = await prisma.$transaction(async (tx) => {
      // 1. update bike
      const updatedBike = await tx.bike.update({
        where: { bike_id: bike.bike_id },
        data: {
          status: "IN_USE",
        },
      });

      // 2. free dock
      await tx.dock.update({
        where: { dock_id: dock.dock_id },
        data: {
          bike_id: null,
          is_occupied: false,
          lock_status: "UNLOCKED",
          last_used_at: new Date(),
        },
      });

      // 3. start ride
      const ride = await tx.ride.create({
        data: {
          bike_id: bike.bike_id,
          start_time: new Date(),
          status: "ONGOING",
          start_lat: start_lat,
          start_lng: start_lng,
          user_id: user,
        },
      });

      return { updatedBike, ride };
    });

    return res.status(200).json({
      message: "Bike unlocked successfully ",
      ride: result.ride,
    });
  } catch (error) {
    console.log("Unlock error:", error);
    return res.status(500).json({
      message: "Internal server error",
     
      
    });
  }
};

export const lockbike = async (req, res) => {
  const { dock_code, user, bike_id } = req.body;

  console.log("Locking bike with:", { dock_code, user, bike_id });

  if (!dock_code || !user || !bike_id) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    // 1️⃣ Find bike
    const bike = await prisma.bike.findUnique({
      where: {
        bike_id: Number(bike_id),
      },
    });

    // 2️⃣ Find dock
    const dock = await prisma.dock.findUnique({
      where: {
        qr_code_identifier: dock_code,
      },
      include: {
        station: true,
      },
    });

    if (!bike) {
      return res.status(404).json({
        message: "Bike not found",
      });
    }

    if (!dock) {
      return res.status(404).json({
        message: "Dock not found",
      });
    }

    // ❗ Optional safety checks (VERY IMPORTANT)
    if (dock.is_occupied) {
      return res.status(400).json({
        message: "Dock already occupied",
      });
    }

    // 🚀 TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      const updatedBike = await tx.bike.update({
        where: { bike_id: bike.bike_id },
        data: {
          status: "AVAILABLE",
        },
      });

      const updatedDock = await tx.dock.update({
        where: { dock_id: dock.dock_id },
        data: {
          bike_id: bike.bike_id,
          is_occupied: true,
          lock_status: "LOCKED",
        },
      });

      const ride = await tx.ride.updateMany({
        where: {
          bike_id: bike.bike_id,
          user_id: Number(user),
          status: "ONGOING",
        },
        data: {
          end_time: new Date(),
          status: "COMPLETED",
          end_lat: dock.station?.latitude || null,
          end_lng: dock.station?.longitude || null,
        },
      });

      return { updatedBike, updatedDock, ride };
    });

    return res.status(200).json({
      message: "Bike locked successfully",
      data: result,
    });

  } catch (error) {
    console.error("Lock error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};