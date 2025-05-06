const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs').promises;

// Explicitly import the crypto module
let crypto;
try {
  crypto = require('crypto');
  console.log('Crypto module loaded successfully');
} catch (err) {
  console.error('Failed to load crypto module:', err);
  console.error('The crypto module is required for WhatsApp authentication. Please ensure you are using a supported Node.js version.');
  process.exit(1);
}

// Log Node.js version for debugging
console.log('Node.js version:', process.version);

// Helper function to ensure crypto is available
function ensureCryptoAvailable() {
  if (!crypto) {
    console.error('Crypto module is not available. Cannot proceed with WhatsApp authentication.');
    process.exit(1);
  }
  // Attempt to polyfill crypto for baileys (this is a workaround)
  if (!global.crypto) {
    global.crypto = crypto;
    console.log('Crypto module injected into global scope as a workaround');
  }
}

async function whatsappLogin() {
  let sock;
  try {
    // Ensure crypto is available
    ensureCryptoAvailable();

    const authDir = './auth_info';

    // Clear the auth directory to ensure a fresh login
    console.log('Clearing previous authentication data...');
    await fs.rm(authDir, { recursive: true, force: true }).catch((err) => {
      console.error('Error clearing auth directory:', err);
    });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    let isConnected = false;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('Scan the QR code below with WhatsApp:');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        console.log('WhatsApp login successful!');
        isConnected = true;
        // Close the connection
        console.log('Closing WhatsApp connection...');
        await sock.end();
        // Exit the script
        console.log('Script completed. Exiting...');
        process.exit(0);
      }

      if (connection === 'close') {
        isConnected = false;
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(`Disconnected: ${DisconnectReason[reason] || reason}`);

        if (reason === DisconnectReason.loggedOut) {
          console.log('Session logged out. Clearing auth data and retrying...');
          await fs.rm(authDir, { recursive: true, force: true }).catch((err) => {
            console.error('Error clearing auth directory:', err);
          });
          // Retry login
          whatsappLogin();
        } else {
          console.error('Connection closed unexpectedly:', lastDisconnect?.error);
          process.exit(1);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('error', (err) => {
      console.error('Socket error:', err);
      process.exit(1);
    });

    // Wait for the connection to be established
    while (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error('Error in whatsappLogin:', err);
    if (sock) {
      await sock.end().catch((err) => console.error('Error closing WhatsApp connection:', err));
    }
    process.exit(1);
  }
}

// Run the script
whatsappLogin().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});