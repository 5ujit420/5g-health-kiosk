const { execFile } = require("child_process");
const path = require("path");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getTemperature = (req, res) => {
  const scriptPath = path.resolve("sensors/temperature.py");

  execFile("python3", [scriptPath], (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing Python script:", error);
      return res.status(500).json({ error: "Failed to read temperature" });
    }

    try {
      const result = JSON.parse(stdout);
      res.json({ success: true, temperature: result });
    } catch (err) {
      console.error("Invalid JSON from Python script:", stdout);
      res.status(500).json({ error: "Invalid temperature data" });
    }
  });
};

// Controller to update or create temperature entry
const updateTemp = async (req, res) => {
  try {
    const { temperature, userId } = req.body;

    // Validate input
    if (!temperature || typeof temperature !== 'number' || temperature <= 0) {
      return res.status(400).json({ error: "Invalid temperature value" });
    }

    // Check if a temperature measurement already exists for the user
    const existingMeasurement = await prisma.healthMeasurement.findFirst({
      where: {
        patientId: userId,
        temperature: {
          not: null,
        },
      },
      orderBy: {
        measuredAt: 'desc',
      },
    });

    let healthMeasurement;

    if (existingMeasurement) {
      // Update existing measurement
      healthMeasurement = await prisma.healthMeasurement.update({
        where: {
          id: existingMeasurement.id,
        },
        data: {
          temperature,
          measuredAt: new Date(),
        },
      });
    } else {
      // Create new measurement
      healthMeasurement = await prisma.healthMeasurement.create({
        data: {
          patientId: userId,
          temperature,
          measuredAt: new Date(),
        },
      });
    }

    return res.json({
      message: "temperature saved successfully",
      temperature: healthMeasurement.temperature,
    });
  } catch (error) {
    console.error("Error saving temperature:", error);
    return res.status(500).json({ error: "Failed to save temperature" });
  }
};

module.exports = { getTemperature, updateTemp };