const express = require("express");
const router = express.Router();
const prisma = require('../utils/prisma');
const auth = require("../middleware/authMiddleware");

// Request a new consultation
router.post("/request", auth, async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Verify the doctor exists and is active
    const doctor = await prisma.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        isActive: true
      },
      include: {
        doctorProfile: true
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or not available",
      });
    }

    // Cancel any existing pending consultations for this patient
    await prisma.consultation.updateMany({
      where: {
        patientId,
        status: "REQUESTED",
      },
      data: {
        status: "CANCELLED",
        updatedAt: new Date()
      },
    });

    // Create new consultation request with selected doctor
    const newConsultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId,
        status: "REQUESTED",
        requestTime: new Date(),
      },
      include: {
        doctor: true, // Include the doctor user
        patient: true, // Include the patient user
      },
    });

    // Create notification for the doctor
    await prisma.notification.create({
      data: {
        recipientId: doctorId,
        consultationId: newConsultation.id,
        type: "VIDEO_CALL_REQUEST",
        title: "New Consultation Request",
        content: `You have a new consultation request from ${req.user.name}`,
        actionRequired: true
      }
    });

    res.json({
      success: true,
      consultation: newConsultation,
      message: "Consultation request created successfully",
    });
  } catch (error) {
    console.error("Error creating consultation request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create consultation request",
    });
  }
});

// Get all consultations with status REQUESTED
router.get("/getrequests", auth, async (req, res) => {
  try {
    const requestedConsultations = await prisma.consultation.findMany({
      where: {
        status: "REQUESTED",
        doctorId: req.user.id // Only show requests for this doctor
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        requestTime: "asc",
      },
    });

    res.json({
      success: true,
      consultations: requestedConsultations,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;