const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateHealthReport(checkupData, outputPath) {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outputPath, { flags: 'w' });
    doc.pipe(stream);

    // Eye-pleasing Background with Gradient
    const gradientSteps = 10;
    const pageHeight = doc.page.height;
    const stepHeight = pageHeight / gradientSteps;

    for (let i = 0; i < gradientSteps; i++) {
      const y = i * stepHeight;
      const r = 243 - (i * (243 - 224) / gradientSteps);
      const g = 229 - (i * (229 - 247) / gradientSteps);
      const b = 245 - (i * (245 - 233) / gradientSteps);
      const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      doc
        .rect(0, y, doc.page.width, stepHeight)
        .fillColor(color)
        .fill();
    }

    // Subtle Pattern: Faint dots for depth
    doc
      .opacity(0.08)
      .fillColor('#81c784')
      .strokeColor('#81c784');

    for (let y = 0; y < doc.page.height; y += 60) {
      for (let x = 0; x < doc.page.width; x += 60) {
        doc
          .circle(x, y, 2)
          .fill();
      }
    }

    doc.opacity(1);

    // Header
    doc
      .rect(0, 0, doc.page.width, 100)
      .fillColor('#4caf50')
      .fill();

    doc
      .fontSize(28)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('Health Kiosk', 50, 30);

    doc
      .fontSize(18)
      .font('Helvetica')
      .text('Comprehensive Health Checkup Report', 50, 65);

    doc.fillColor('black');

    // Date & Time Box
    const currentDateTime = new Date();
    doc
      .roundedRect(50, 120, 495, 40, 8)
      .fillColor('white')
      .opacity(0.9)
      .fill();

    doc
      .opacity(1)
      .fontSize(12)
      .fillColor('black')
      .text(`📅 Date: ${currentDateTime.toLocaleDateString()}`, 60, 135)
      .text(`🕒 Time: ${currentDateTime.toLocaleTimeString()}`, 300, 135);

    // Patient Name Section
    doc
      .roundedRect(50, 180, 495, 40, 8)
      .fillColor('white')
      .opacity(0.9)
      .fill();

    doc
      .roundedRect(50, 180, 495, 40, 8)
      .strokeColor('#388e3c')
      .lineWidth(1)
      .stroke();

    doc
      .opacity(1)
      .fontSize(16)
      .fillColor('#388e3c')
      .font('Helvetica-Bold')
      .text('👤 Patient Name', 60, 195);

    doc
      .fontSize(12)
      .fillColor('black')
      .font('Helvetica')
      .text(`${checkupData.patientName || 'Not Provided'}`, 60, 215);

    // Checkup Details (shifted down)
    doc
      .roundedRect(50, 240, 495, 180, 8)
      .fillColor('white')
      .opacity(0.9)
      .fill();

    doc
      .roundedRect(50, 240, 495, 180, 8)
      .strokeColor('#388e3c')
      .lineWidth(1)
      .stroke();

    doc
      .opacity(1)
      .fontSize(16)
      .fillColor('#388e3c')
      .font('Helvetica-Bold')
      .text('🏥 Checkup Details', 60, 255);

    doc
      .fontSize(12)
      .fillColor('black')
      .font('Helvetica')
      .text(`⚖️ Weight: ${checkupData.weight} kg`, 60, 280)
      .text(`📏 Height: ${checkupData.height} cm`, 60, 300)
      .text(`💓 SpO₂: ${checkupData.oximeter}%`, 60, 320)
      .text(`🩺 Blood Pressure: ${checkupData.bloodPressureSys}/${checkupData.bloodPressureDia} mmHg`, 60, 340)
      .text(`🌡️ Temperature: ${checkupData.temperature} °C`, 60, 360);

    // Doctor Info (shifted down)
    doc
      .moveDown(2)
      .fontSize(16)
      .fillColor('#388e3c')
      .font('Helvetica-Bold')
      .text('👨‍⚕️ Doctor Information', 50, 440)
      .moveTo(50, 460)
      .lineTo(200, 460)
      .stroke();

    doc
      .fontSize(12)
      .fillColor('black')
      .text(`Name: Dr. ${checkupData.doctorName}`, 60, 470);

    // Prescription Section (shifted down)
    doc
      .roundedRect(50, 510, 495, 100, 8)
      .fillColor('white')
      .opacity(0.9)
      .fill();

    doc
      .roundedRect(50, 510, 495, 100, 8)
      .strokeColor('#388e3c')
      .lineWidth(1)
      .stroke();

    doc
      .opacity(1)
      .fontSize(16)
      .fillColor('#388e3c')
      .font('Helvetica-Bold')
      .text('📝 Doctor\'s Prescription', 60, 525);

    doc
      .fontSize(12)
      .fillColor('black')
      .font('Helvetica')
      .text('Details to be filled by the doctor:', 60, 550)
      .text('(E.g., medications, dosage, instructions)', 60, 565);

    // Notes Section (shifted down)
    doc
      .roundedRect(50, 630, 495, 100, 8)
      .fillColor('white')
      .opacity(0.9)
      .fill();

    doc
      .roundedRect(50, 630, 495, 100, 8)
      .strokeColor('#388e3c')
      .lineWidth(1)
      .stroke();

    doc
      .opacity(1)
      .fontSize(16)
      .fillColor('#388e3c')
      .font('Helvetica-Bold')
      .text('📋 Additional Notes', 60, 645);

    doc
      .fontSize(12)
      .fillColor('black')
      .font('Helvetica')
      .text(checkupData.notes || 'No additional notes provided.', 60, 670, {
        width: 475,
        align: 'left'
      });

    // Footer
    doc
      .moveTo(50, 770)
      .lineTo(545, 770)
      .lineWidth(0.5)
      .strokeColor('#cccccc')
      .stroke();

    doc
      .fontSize(10)
      .font('Helvetica-Oblique')
      .fillColor('gray')
      .text('Generated by Health Kiosk | Confidential Medical Document', 50, 780, {
        align: 'center'
      });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', (err) => {
        stream.close();
        reject(err);
      });
    });

    console.log(`✅ PDF generated at: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error('❌ Error generating report:', err);
    throw err;
  }
}

module.exports = { generateHealthReport };
// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// async function generateHealthReport(checkupData, outputPath) {
//   try {
//     const doc = new PDFDocument({ size: 'A4', margin: 40 });
//     const stream = fs.createWriteStream(outputPath, { flags: 'w' });
//     doc.pipe(stream);

//     // Eye-pleasing Background with Gradient
//     const gradientSteps = 10;
//     const pageHeight = doc.page.height;
//     const stepHeight = pageHeight / gradientSteps;

//     for (let i = 0; i < gradientSteps; i++) {
//       const y = i * stepHeight;
//       const r = 243 - (i * (243 - 224) / gradientSteps);
//       const g = 229 - (i * (229 - 247) / gradientSteps);
//       const b = 245 - (i * (245 - 233) / gradientSteps);
//       const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
//       doc
//         .rect(0, y, doc.page.width, stepHeight)
//         .fillColor(color)
//         .fill();
//     }

//     // Subtle Pattern: Faint dots for depth
//     doc
//       .opacity(0.08)
//       .fillColor('#81c784')
//       .strokeColor('#81c784');

//     for (let y = 0; y < doc.page.height; y += 60) {
//       for (let x = 0; x < doc.page.width; x += 60) {
//         doc
//           .circle(x, y, 2)
//           .fill();
//       }
//     }

//     doc.opacity(1);

//     // Header
//     doc
//       .rect(0, 0, doc.page.width, 100)
//       .fillColor('#4caf50')
//       .fill();

//     doc
//       .fontSize(28)
//       .fillColor('white')
//       .font('Helvetica-Bold')
//       .text('Health Kiosk', 50, 30);

//     doc
//       .fontSize(18)
//       .font('Helvetica')
//       .text('Comprehensive Health Checkup Report', 50, 65);

//     doc.fillColor('black');

//     // Date & Time Box
//     const currentDateTime = new Date();
//     doc
//       .roundedRect(50, 120, 495, 40, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .opacity(1)
//       .fontSize(12)
//       .fillColor('black')
//       .text(`📅 Date: ${currentDateTime.toLocaleDateString()}`, 60, 135)
//       .text(`🕒 Time: ${currentDateTime.toLocaleTimeString()}`, 300, 135);

//     // Checkup Details
//     doc
//       .roundedRect(50, 180, 495, 180, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 180, 495, 180, 8)
//       .strokeColor('#388e3c')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('🏥 Checkup Details', 60, 195);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text(`⚖️ Weight: ${checkupData.weight} kg`, 60, 220)
//       .text(`📏 Height: ${checkupData.height} cm`, 60, 240)
//       .text(`💓 SpO₂: ${checkupData.oximeter}%`, 60, 260)
//       .text(`🩺 Blood Pressure: ${checkupData.bloodPressureSys}/${checkupData.bloodPressureDia} mmHg`, 60, 280)
//       .text(`🌡️ Temperature: ${checkupData.temperature} °C`, 60, 300);

//     // Doctor Info
//     doc
//       .moveDown(2)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('👨‍⚕️ Doctor Information', 50, 380)
//       .moveTo(50, 400)
//       .lineTo(200, 400)
//       .stroke();

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .text(`Name: Dr. ${checkupData.doctorName}`, 60, 410);

//     // Prescription Section
//     doc
//       .roundedRect(50, 450, 495, 100, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 450, 495, 100, 8)
//       .strokeColor('#388e3c')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('📝 Doctor\'s Prescription', 60, 465);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text('Details to be filled by the doctor:', 60, 490)
//       .text('(E.g., medications, dosage, instructions)', 60, 505);

//     // Notes Section
//     doc
//       .roundedRect(50, 570, 495, 100, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 570, 495, 100, 8)
//       .strokeColor('#388e3c')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('📋 Additional Notes', 60, 585);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text(checkupData.notes || 'No additional notes provided.', 60, 610, {
//         width: 475,
//         align: 'left'
//       });

//     // Footer
//     doc
//       .moveTo(50, 770)
//       .lineTo(545, 770)
//       .lineWidth(0.5)
//       .strokeColor('#cccccc')
//       .stroke();

//     doc
//       .fontSize(10)
//       .font('Helvetica-Oblique')
//       .fillColor('gray')
//       .text('Generated by Health Kiosk | Confidential Medical Document', 50, 780, {
//         align: 'center'
//       });

//     doc.end();

//     await new Promise((resolve, reject) => {
//       stream.on('finish', () => {
//         stream.close();
//         resolve();
//       });
//       stream.on('error', (err) => {
//         stream.close();
//         reject(err);
//       });
//     });

//     console.log(`✅ PDF generated at: ${outputPath}`);
//     return outputPath;
//   } catch (err) {
//     console.error('❌ Error generating report:', err);
//     throw err;
//   }
// }

// module.exports = { generateHealthReport };
// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// async function generateHealthReport(checkupData, outputPath) {
//   try {
//     const doc = new PDFDocument({ size: 'A4', margin: 40 });
//     const stream = fs.createWriteStream(outputPath, { flags: 'w' });
//     doc.pipe(stream);

//     // Eye-pleasing Background with Gradient
//     // Gradient from soft lavender (#f3e5f5) to pale mint (#e0f7e9)
//     const gradientSteps = 10;
//     const pageHeight = doc.page.height;
//     const stepHeight = pageHeight / gradientSteps;

//     for (let i = 0; i < gradientSteps; i++) {
//       const y = i * stepHeight;
//       const r = 243 - (i * (243 - 224) / gradientSteps);
//       const g = 229 - (i * (229 - 247) / gradientSteps);
//       const b = 245 - (i * (245 - 233) / gradientSteps);
//       const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
//       doc
//         .rect(0, y, doc.page.width, stepHeight)
//         .fillColor(color)
//         .fill();
//     }

//     // Subtle Pattern: Faint dots for depth
//     doc
//       .opacity(0.08)
//       .fillColor('#81c784')
//       .strokeColor('#81c784');

//     for (let y = 0; y < doc.page.height; y += 60) {
//       for (let x = 0; x < doc.page.width; x += 60) {
//         doc
//           .circle(x, y, 2)
//           .fill();
//       }
//     }

//     doc.opacity(1);

//     // Header
//     doc
//       .rect(0, 0, doc.page.width, 100)
//       .fillColor('#4caf50')
//       .fill();

//     doc
//       .fontSize(28)
//       .fillColor('white')
//       .font('Helvetica-Bold')
//       .text('Health Kiosk', 50, 30);

//     doc
//       .fontSize(18)
//       .font('Helvetica')
//       .text('Comprehensive Health Checkup Report', 50, 65);

//     doc.fillColor('black');

//     // Date & Time Box
//     const currentDateTime = new Date();
//     doc
//       .roundedRect(50, 120, 495, 40, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .opacity(1)
//       .fontSize(12)
//       .fillColor('black')
//       .text(`📅 Date: ${currentDateTime.toLocaleDateString()}`, 60, 135)
//       .text(`🕒 Time: ${currentDateTime.toLocaleTimeString()}`, 300, 135);

//     // Checkup Details
//     doc
//       .roundedRect(50, 180, 495, 180, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 180, 495, 180, 8)
//       .strokeColor('#388e3c')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('🏥 Checkup Details', 60, 195);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text(`⚖️ Weight: ${checkupData.weight} kg`, 60, 220)
//       .text(`📏 Height: ${checkupData.height} cm`, 60, 240)
//       .text(`💓 SpO₂: ${checkupData.oximeter}%`, 60, 260)
//       .text(`🩺 Blood Pressure: ${checkupData.bloodPressureSys}/${checkupData.bloodPressureDia} mmHg`, 60, 280)
//       .text(`🌡️ Temperature: ${checkupData.temperature} °C`, 60, 300);

//     // Doctor Info
//     doc
//       .moveDown(2)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('👨‍⚕️ Doctor Information', 50, 380)
//       .moveTo(50, 400)
//       .lineTo(200, 400)
//       .stroke();

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .text(`Name: Dr. ${checkupData.doctorName}`, 60, 410);

//     // Prescription Section
//     doc
//       .roundedRect(50, 450, 495, 100, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 450, 495, 100, 8)
//       .strokeColor('#388e3c')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('📝 Doctor\'s Prescription', 60, 465);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text('Details to be filled by the doctor:', 60, 490)
//       .text('(E.g., medications, dosage, instructions)', 60, 505);

//     // Notes Section
//     doc
//       .roundedRect(50, 570, 495, 100, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 570, 495, 100, 8)
//       .strokeColor('#388e3c')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#388e3c')
//       .font('Helvetica-Bold')
//       .text('📋 Additional Notes', 60, 585);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text(checkupData.notes || 'No additional notes provided.', 60, 610, {
//         width: 475,
//         align: 'left'
//       });

//     // Footer
//     doc
//       .moveTo(50, 770)
//       .lineTo(545, 770)
//       .lineWidth(0.5)
//       .strokeColor('#cccccc')
//       .stroke();

//     doc
//       .fontSize(10)
//       .font('Helvetica-Oblique')
//       .fillColor('gray')
//       .text('Generated by Health Kiosk | Confidential Medical Document', 50, 780, {
//         align: 'center'
//       });

//     doc.end();

//     await new Promise((resolve, reject) => {
//       stream.on('finish', () => {
//         stream.close();
//         resolve();
//       });
//       stream.on('error', (err) => {
//         stream.close();
//         reject(err);
//       });
//     });

//     console.log(`✅ PDF generated at: ${outputPath}`);
//     return outputPath;
//   } catch (err) {
//     console.error('❌ Error generating report:', err);
//     throw err;
//   }
// }

// module.exports = { generateHealthReport };
// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// async function generateHealthReport(checkupData, outputPath) {
//   try {
//     const doc = new PDFDocument({ size: 'A4', margin: 40 });
//     const stream = fs.createWriteStream(outputPath, { flags: 'w' });
//     doc.pipe(stream);

//     // Eye-pleasing Background with Gradient
//     // Gradient from soft pastel peach (#ffebee) to light sky blue (#e1f5fe)
//     const gradientSteps = 10;
//     const pageHeight = doc.page.height;
//     const stepHeight = pageHeight / gradientSteps;

//     for (let i = 0; i < gradientSteps; i++) {
//       const y = i * stepHeight;
//       // Interpolate between pastel peach (RGB: 255, 235, 238) and light sky blue (RGB: 225, 245, 254)
//       const r = 255 - (i * (255 - 225) / gradientSteps);
//       const g = 235 - (i * (235 - 245) / gradientSteps);
//       const b = 238 - (i * (238 - 254) / gradientSteps);
//       const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
//       doc
//         .rect(0, y, doc.page.width, stepHeight)
//         .fillColor(color)
//         .fill();
//     }

//     // Subtle Pattern: Faint curved lines for depth
//     doc
//       .opacity(0.1)
//       .strokeColor('#81d4fa') // Light blue for the pattern
//       .lineWidth(0.5);

//     for (let y = 0; y < doc.page.height; y += 80) {
//       doc.moveTo(0, y);
//       for (let x = 0; x <= doc.page.width; x += 10) {
//         const waveHeight = 4 * Math.sin(x * 0.04);
//         doc.lineTo(x, y + waveHeight);
//       }
//       doc.stroke();
//     }

//     // Reset opacity for content
//     doc.opacity(1);

//     // Header with a complementary background color
//     doc
//       .rect(0, 0, doc.page.width, 100)
//       .fillColor('#4db6ac') // Teal for contrast
//       .fill();

//     doc
//       .fontSize(28)
//       .fillColor('white')
//       .font('Helvetica-Bold')
//       .text('Health Kiosk', 50, 30);

//     doc
//       .fontSize(18)
//       .font('Helvetica')
//       .text('Comprehensive Health Checkup Report', 50, 65);

//     doc.fillColor('black');

//     // Date & Time Box with semi-transparent white background
//     const currentDateTime = new Date();
//     doc
//       .roundedRect(50, 120, 495, 40, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .opacity(1)
//       .fontSize(12)
//       .fillColor('black')
//       .text(`📅 Date: ${currentDateTime.toLocaleDateString()}`, 60, 135)
//       .text(`🕒 Time: ${currentDateTime.toLocaleTimeString()}`, 300, 135);

//     // Checkup Details with semi-transparent white background
//     doc
//       .roundedRect(50, 180, 495, 180, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 180, 495, 180, 8)
//       .strokeColor('#0288d1') // Deeper blue for borders
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#0288d1')
//       .font('Helvetica-Bold')
//       .text('🏥 Checkup Details', 60, 195);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text(`⚖️ Weight: ${checkupData.weight} kg`, 60, 220)
//       .text(`📏 Height: ${checkupData.height} cm`, 60, 240)
//       .text(`💓 SpO₂: ${checkupData.oximeter}%`, 60, 260)
//       .text(`🩺 Blood Pressure: ${checkupData.bloodPressureSys}/${checkupData.bloodPressureDia} mmHg`, 60, 280)
//       .text(`🌡️ Temperature: ${checkupData.temperature} °C`, 60, 300);

//     // Doctor Info
//     doc
//       .moveDown(2)
//       .fontSize(16)
//       .fillColor('#0288d1')
//       .font('Helvetica-Bold')
//       .text('👨‍⚕️ Doctor Information', 50, 380)
//       .moveTo(50, 400)
//       .lineTo(200, 400)
//       .stroke();

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .text(`Name: Dr. ${checkupData.doctorName}`, 60, 410);

//     // Prescription Section with semi-transparent white background
//     doc
//       .roundedRect(50, 450, 495, 100, 8)
//       .fillColor('white')
//       .opacity(0.9)
//       .fill();

//     doc
//       .roundedRect(50, 450, 495, 100, 8)
//       .strokeColor('#0288d1')
//       .lineWidth(1)
//       .stroke();

//     doc
//       .opacity(1)
//       .fontSize(16)
//       .fillColor('#0288d1')
//       .font('Helvetica-Bold')
//       .text('📝 Doctor\'s Prescription', 60, 465);

//     doc
//       .fontSize(12)
//       .fillColor('black')
//       .font('Helvetica')
//       .text('Details to be filled by the doctor:', 60, 490)
//       .text('(E.g., medications, dosage, instructions)', 60, 505);

//     // Footer
//     doc
//       .moveTo(50, 770)
//       .lineTo(545, 770)
//       .lineWidth(0.5)
//       .strokeColor('#cccccc')
//       .stroke();

//     doc
//       .fontSize(10)
//       .font('Helvetica-Oblique')
//       .fillColor('gray')
//       .text('Generated by Health Kiosk | Confidential Medical Document', 50, 780, {
//         align: 'center'
//       });

//     doc.end();

//     await new Promise((resolve, reject) => {
//       stream.on('finish', () => {
//         stream.close();
//         resolve();
//       });
//       stream.on('error', (err) => {
//         stream.close();
//         reject(err);
//       });
//     });

//     console.log(`✅ PDF generated at: ${outputPath}`);
//     return outputPath;
//   } catch (err) {
//     console.error('❌ Error generating report:', err);
//     throw err;
//   }
// }

// // Example usage
// const checkupData = {
//   weight: 70,
//   height: 175,
//   oximeter: 98,
//   bloodPressureSys: 120,
//   bloodPressureDia: 80,
//   temperature: 36.6,
//   doctorName: 'John Smith'
// };

// const outputPath = './health_checkup_report.pdf';
// generateHealthReport(checkupData, outputPath)
//   .then(() => console.log('✅ Report generation complete'))
//   .catch((err) => console.error('❌ Failed to generate report:', err));

// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// // Function to create a PDF
// async function createPDF(outputPath) {
//   try {
//     // Create a new PDF document
//     const doc = new PDFDocument({
//       size: 'A4',
//       margin: 50
//     });

//     // Pipe the PDF output to a file
//     const stream = fs.createWriteStream(outputPath);
//     doc.pipe(stream);

//     // Add content to the PDF
//     doc
//       .fontSize(24)
//       .font('Helvetica-Bold')
//       .text('Sample PDF Document', {
//         align: 'center'
//       });

//     doc.moveDown(1);

//     doc
//       .fontSize(16)
//       .font('Helvetica')
//       .text('This is a programmatically generated PDF.', {
//         align: 'left'
//       });

//     doc.moveDown(0.5);

//     doc
//       .fontSize(12)
//       .text('Generated using PDFKit in Node.js on ' + new Date().toLocaleDateString(), {
//         align: 'left'
//       });

//     // Add a simple list
//     doc.moveDown(1);
//     doc
//       .fontSize(14)
//       .font('Helvetica-Bold')
//       .text('Features:', {
//         align: 'left'
//       });

//     const features = [
//       'Dynamic text rendering',
//       'Custom fonts and sizes',
//       'Alignment options',
//       'Generated on-demand'
//     ];

//     features.forEach((feature, index) => {
//       doc
//         .fontSize(12)
//         .font('Helvetica')
//         .text(`${index + 1}. ${feature}`, {
//           align: 'left'
//         });
//     });

//     // Finalize the PDF and end the stream
//     doc.end();

//     // Wait for the stream to finish
//     await new Promise((resolve, reject) => {
//       stream.on('finish', resolve);
//       stream.on('error', reject);
//     });

//     console.log(`PDF created successfully at ${outputPath}`);
//     return outputPath;
//   } catch (err) {
//     console.error('Error creating PDF:', err);
//     throw err;
//   }
// }

// // Run the function
// const outputPath = './generated_pdf.pdf';
// createPDF(outputPath)
//   .then(() => console.log('PDF generation complete'))
//   .catch((err) => console.error('Failed to generate PDF:', err));