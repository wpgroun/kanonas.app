// Yuboto Octapush SMS Integration

interface YubotoSmsConfig {
  apiKey: string;
  senderId: string;
}

export async function sendSMS(phoneNumbers: string[], message: string) {
  // Try to use environment variables, fallback for MVP/dev purposes
  const apiKey = process.env.YUBOTO_API_KEY || 'test_api_key';
  const senderId = process.env.YUBOTO_SENDER_ID || 'Κανόνας'; // Max 11 latin characters

  // Mock implementation for development when no API Key is present
  if (!process.env.YUBOTO_API_KEY) {
    console.log(`\n[YUBOTO SMS MOCK - TEST MODE]`);
    console.log(`📤 Sender: ${senderId}`);
    console.log(`📞 Receivers: ${phoneNumbers.join(', ')}`);
    console.log(`✉️ Message: ${message}\n`);
    return { success: true, mock: true };
  }

  try {
    // Official Yuboto Omni API implementation (assuming standard POST structure)
    // Developers should verify the exact endpoint URL in their Yuboto Octapush Dashboard
    const yubotoEndpoint = 'https://services.yuboto.com/omni/v1/Send';
    
    // We encode the API Key in base64 if required by Omni or just pass as header Bearer/Basic
    const response = await fetch(yubotoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` 
      },
      body: JSON.stringify({
        phonenumbers: phoneNumbers,
        sender: senderId,
        text: message
      })
    });

    if (!response.ok) {
        throw new Error(`Yuboto API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('SMS Sending failed:', error);
    return { success: false, error: error.message };
  }
}

