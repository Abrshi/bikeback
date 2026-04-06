import { prisma } from "../../lib/prisma.js";

export const allRides = async (req, res) => {
  const { user_id } = req.query;
console.log("Fetching all rides for user_id:", user_id);
    try {
        if (!user_id) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }   
        const rides = await prisma.ride.findMany({
            where: {
                user_id: Number(user_id),   
                status: {
                    in: ["CANCELLED", "COMPLETED"]
                }
            },
            include: {
                bike: true,
            },
            orderBy: {
                start_time: "desc",
            },
        }); 
        console.log("Rides found:", rides.length);
        return res.status(200).json(rides);
} catch (error) {
        console.error("Error fetching rides:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export const currentRides = async (req, res) => {
  const { user_id } = req.query;
console.log("Fetching current rides for user_id:", user_id);
    try {
        if (!user_id) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }   
        const ride = await prisma.ride.findFirst({
            where: {
                user_id: Number(user_id),   
                status: {
                    in: ["ONGOING"]
                }
            },
            include: {
                bike: true,
            },
        });
        console.log("Current ride found:", ride);
        return res.status(200).json(ride);
} catch (error) {
        console.error("Error fetching rides:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}