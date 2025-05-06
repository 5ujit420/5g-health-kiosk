const fs = require('fs').promises;
const path = require('path');
const { generateHealthReport } = require('./create_pdf');
const { connectToWhatsApp } = require('./index');

async function sendHealthReport() {
  let sock;
  try {
    // Define health checkup parameters with patient name
    const checkupData = {
      patientName: 'Alex Johnson',
      weight: 72,
      height: 170,
      oximeter: 97,
      bloodPressureSys: 118,
      bloodPressureDia: 78,
      temperature: 36.8,
      doctorName: 'Jane Doe',
      notes: 'Patient should increase water intake and schedule a follow-up in 1 month.'
    };

    // Generate the PDF
    const pdfPath = path.join(__dirname, 'health_checkup_report.pdf');
    await generateHealthReport(checkupData, pdfPath);
    console.log('Health report PDF generated successfully');

    // Connect to WhatsApp
    try {
      sock = await connectToWhatsApp();
      console.log('WhatsApp connection established');
    } catch (err) {
      console.error('Failed to connect to WhatsApp:', err);
      throw err;
    }

    // Recipient details
    const number = '917083505744';
    const jid = `${number}@s.whatsapp.net`;

    // Send a test text message
    await sock.sendMessage(jid, { text: 'Hello! Here is your health checkup report.' })
      .then(() => console.log('Test message sent'))
      .catch((err) => {
        console.error('Error sending test message:', err);
        throw err;
      });

    // Send the generated PDF
    const pdfBuffer = await fs.readFile(pdfPath);
    await sock.sendMessage(jid, {
      document: pdfBuffer,
      mimetype: 'application/pdf',
      fileName: 'Health_Checkup_Report.pdf'
    })
      .then(() => console.log('Health report PDF sent successfully'))
      .catch((err) => {
        console.error('Error sending health report PDF:', err);
        throw err;
      });

    // Add a small delay to ensure WhatsApp API processes the messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up: Delete the PDF file after sending
    await fs.unlink(pdfPath).catch((err) => console.error('Error deleting PDF:', err));

    // Close the WhatsApp connection
    console.log('Closing WhatsApp connection...');
    await sock.end();

    // Exit the process
    console.log('Script completed. Exiting...');
    process.exit(0);
  } catch (err) {
    console.error('Error in sendHealthReport:', err);
    if (sock) {
      await sock.end().catch((err) => console.error('Error closing WhatsApp connection:', err));
    }
    // Clean up: Delete the PDF file if it exists
    const pdfPath = path.join(__dirname, 'report', 'health_checkup_report.pdf');
    await fs.unlink(pdfPath).catch((err) => console.error('Error deleting PDF during cleanup:', err));
    process.exit(1);
  }
}

// Run the script
sendHealthReport().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});