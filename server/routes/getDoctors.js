const express = require("express");
const router = express.Router();
const prisma = require('../utils/prisma');
const auth = require("../middleware/authMiddleware");

// Get active doctors
router.get("/active", auth, async (req, res) => {
  try {
    // Get doctors who are active and have been active recently (last 5 minutes)
    const activeDoctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        isActive: true,
      },
      include: {
        doctorProfile: true,
      },
    });

    // Format the response
    const doctorsData = activeDoctors.map((doctor) => ({
      id: doctor.id,
      user: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
      },
      specialty: doctor.doctorProfile?.specialty || "General Physician",
      rating: doctor.doctorProfile?.rating || null,
      bio: doctor.doctorProfile?.bio || null,
      licenseNumber: doctor.doctorProfile?.licenseNumber || null,
    }));

    res.json(doctorsData);
  } catch (error) {
    console.error("Error fetching active doctors:", error);
    res.status(500).json({ message: "Failed to fetch active doctors" });
  }
});

module.exports = router;