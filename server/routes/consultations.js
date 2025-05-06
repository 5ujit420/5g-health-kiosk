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

router.get("/getacceptedrequests", auth, async (req, res) => {
  try {
    const requestedConsultations = await prisma.consultation.findMany({
      where: {
        status: "ACCEPTED",
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

// Accept a consultation request
router.post("/accept", auth, async (req, res) => {
  try {
    const { consultationId } = req.body;
    
    if (!consultationId) {
      return res.status(400).json({
        success: false,
        message: "Consultation ID is required",
      });
    }

    // Find the consultation
    const consultation = await prisma.consultation.findUnique({
      where: {
        id: consultationId,
      },
    });

    if (consultation.status !== "REQUESTED") {
      return res.status(400).json({
        success: false,
        message: "Only consultations with status 'REQUESTED' can be accepted",
      });
    }

    // Update the consultation status to ACCEPTED
    const updatedConsultation = await prisma.consultation.update({
      where: {
        id: consultationId,
      },
      data: {
        status: "ACCEPTED",
        updatedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    res.json({
      success: true,
      consultation: updatedConsultation,
      message: "Consultation request accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting consultation request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept consultation request",
    });
  }
});

// Get all distinct patients who have consulted with the doctor
router.get("/distinctpatients", auth, async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Step 1: Get distinct patients consulted by this doctor
    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId,
      },
      select: {
        patient: {
          include: {
            healthMeasurements: true,
          },
        },
        patientId: true,
      },
      distinct: ['patientId'],
    });

    // Step 2: Fetch accepted consultations per patient with this doctor
    const enrichedPatients = await Promise.all(
      consultations.map(async (c) => {
        const acceptedConsultations = await prisma.consultation.findMany({
          where: {
            patientId: c.patientId,
            doctorId,
            status: "ACCEPTED",
          },
        });

        return {
          ...c.patient,
          acceptedConsultations: Array.isArray(acceptedConsultations)
            ? acceptedConsultations
            : [], // Ensure it's always an array
        };
      })
    );

    res.json({
      success: true,
      patients: enrichedPatients,
    });

  } catch (error) {
    console.error("Error fetching enriched patient data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



module.exports = router;