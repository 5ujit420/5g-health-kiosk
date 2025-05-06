const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendHealthReport = async (req, res) => {
  try {
    const { patientId, doctorId, consultationId } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !consultationId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, Doctor ID, and Consultation ID are required'
      });
    }

    // Check if the consultation exists and belongs to these users
    const consultation = await prisma.consultation.findUnique({
      where: {
        id: consultationId,
        patientId: patientId,
        doctorId: doctorId
      }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found or does not belong to these users'
      });
    }

    // Get the latest health measurements for the patient
    const healthMeasurements = await prisma.healthMeasurement.findMany({
      where: {
        patientId: patientId
      },
      orderBy: {
        measuredAt: 'desc' // Get most recent first
      },
      take: 10 // Limit to 10 most recent measurements
    });

    if (!healthMeasurements || healthMeasurements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No health measurements found for this patient'
      });
    }

    // Create a report in the database
    const report = await prisma.report.create({
      data: {
        consultationId: consultationId,
        patientId: patientId,
        doctorId: doctorId,
        diagnosis: 'Health Measurement Report',
        notes: 'Automated report generated from patient health measurements',
        treatmentPlan: 'Review measurements and provide recommendations'
      }
    });

    // Optionally create a notification for the doctor
    await prisma.notification.create({
      data: {
        recipientId: doctorId,
        consultationId: consultationId,
        type: 'VIDEO_CALL_REQUEST',
        title: 'New Health Report Available',
        content: `Patient ${req.user.name} has shared their health measurements with you`,
        actionRequired: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'Health report sent successfully',
      data: {
        report,
        healthMeasurements
      }
    });

  } catch (error) {
    console.error('Error sending health report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  sendHealthReport
};