const { exec } = require("child_process");
const path = require("path");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Controller to measure height using Python script
const measureHeight = (req, res) => {
  const pythonScriptPath = path.join(__dirname, "../sensors/height.py");

  exec(`python3 ${pythonScriptPath}`, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error("Execution error:", error || stderr);
      return res.status(500).json({ error: "Sensor not connected" });
    }

    try {
      const output = JSON.parse(stdout);

      if (output.error) {
        console.error("Python error:", output.error);
        return res.status(500).json({ error: output.error });
      }

      return res.json(output);
    } catch (parseError) {
      console.error("Parsing error:", parseError);
      return res.status(500).json({ error: "Invalid sensor output" });
    }
  });
};

// Controller to update or create height entry
const updateHeight = async (req, res) => {
  try {
    const { height, userId } = req.body;

    // Validate input
    if (!height || typeof height !== 'number' || height <= 0) {
      return res.status(400).json({ error: "Invalid height value" });
    }

    // Check if a height measurement already exists for the user
    const existingMeasurement = await prisma.healthMeasurement.findFirst({
      where: {
        patientId: userId,
        height: {
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
          height,
          measuredAt: new Date(),
        },
      });
    } else {
      // Create new measurement
      healthMeasurement = await prisma.healthMeasurement.create({
        data: {
          patientId: userId,
          height,
          measuredAt: new Date(),
        },
      });
    }

    return res.json({
      message: "Height saved successfully",
      height: healthMeasurement.height,
    });
  } catch (error) {
    console.error("Error saving height:", error);
    return res.status(500).json({ error: "Failed to save height" });
  }
};

module.exports = { measureHeight, updateHeight };
