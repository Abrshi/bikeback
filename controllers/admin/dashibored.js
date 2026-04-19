import { prisma } from "../../lib/prisma.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.User.findMany();

    res.status(200).json(users);
  } catch (err) {
    console.error("Getting users failed:", err);
    res.status(500).json({ error: "Failed to get users" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();

    const activeRides = await prisma.ride.count({
      where: {
        status: "ONGOING",
      },
    });

    const totalRides = await prisma.ride.count();

    const totalBikes = await prisma.bike.count();

    const totalAvailableBikes = await prisma.bike.count({
      where: {
        status: "AVAILABLE", // change if your bike status name is different
      },
    });
    console.log(totalUsers,
      activeRides,
      totalRides,
      totalBikes,
      totalAvailableBikes,)

    res.status(200).json({
      totalUsers,
      activeRides,
      totalRides,
      totalBikes,
      totalAvailableBikes,
    });
  } catch (err) {
    console.error("Getting dashboard stats failed:", err);
    res.status(500).json({
      error: "Failed to get dashboard stats",
    });
  }
};
