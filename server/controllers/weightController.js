const {execFile} = require("child_process");
const path = require("path");

const getWeight = (req, res) => {
    const scriptPath = path.resolve("sensors/weight.py");

    execFile("python3", [scriptPath], (error, stdout, stderr) => {
        if (error) {
            console.error("Error executing Python script:", error);
            return res.status(500).json({ error: "Failed to read weight" });
        }

        try {
            const result = JSON.parse(stdout);
            res.json({ success: true, weight: result });
        } catch (err) {
            console.error("Invalid JSON from Python Script: ", stdout);
            res.status(500).json({ error: "Invalid temperature data "});
        }
    });
}

module.exports = {getWeight};