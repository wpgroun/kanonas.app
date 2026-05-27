// Yuboto Octapush SMS Integration

interface YubotoSmsConfig {
 apiKey: string;
 senderId: string;
}

import { prisma } from '@/lib/prisma';

export async function sendSMS(
  phoneNumbers: string[], 
  message: string,
  templeSettings?: { smsSenderId?: string }
) {
  const platformSettings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  
  const apiKey = platformSettings?.yubotoApiKey || process.env.YUBOTO_API_KEY || 'test_api_key';

  const isValidSender = (id?: string | null) => {
    if (!id) return false;
    return /^[A-Za-z0-9]{1,11}$/.test(id);
  };

  let senderId = 'Kanonas';
  if (isValidSender(templeSettings?.smsSenderId)) {
    senderId = templeSettings!.smsSenderId!;
  } else if (isValidSender(platformSettings?.yubotoSenderId)) {
    senderId = platformSettings!.yubotoSenderId!;
  } else if (isValidSender(process.env.YUBOTO_SENDER_ID)) {
    senderId = process.env.YUBOTO_SENDER_ID!;
  }

  // Mock implementation for development when no API Key is present
  if (!platformSettings?.yubotoApiKey && !process.env.YUBOTO_API_KEY) {
 console.log(`\n[YUBOTO SMS MOCK - TEST MODE]`);
 console.log(`📤 Sender: ${senderId}`);
 console.log(`📞 Receivers: ${phoneNumbers.join(', ')}`);
 console.log(`✉️ Message: ${message}\n`);
 return { success: true, mock: true };
 }

  try {
    const yubotoEndpoint = 'https://services.yuboto.com/omni/v1/Send';

    // Normalize phone to international format (e.g. 6912345678 → 306912345678)
    const normalizePhone = (phone: string) => {
      let p = phone.replace(/[\s\-().+]/g, '');
      if (p.startsWith('00')) p = p.slice(2);
      if (p.startsWith('6') && p.length === 10) p = '30' + p;
      if (p.startsWith('2') && p.length === 10) p = '30' + p;
      return p;
    };
    const normalizedNumbers = phoneNumbers.map(normalizePhone);

    // Format authorization header to Basic <base64Key>
    let authHeader = apiKey.trim();
    if (!authHeader.startsWith('Basic ')) {
      if (authHeader.includes('-')) {
        authHeader = 'Basic ' + Buffer.from(authHeader).toString('base64');
      } else {
        authHeader = 'Basic ' + authHeader;
      }
    }

    const response = await fetch(yubotoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        dlr: 'false',
        contacts: normalizedNumbers.map(p => ({
          phonenumber: p,
        })),
        sms: {
          sender: senderId,
          text: message,
          typesms: 'sms',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Yuboto API Error: ${response.status} ${errText || response.statusText}`);
    }

    const data = await response.json();
    if (data?.ErrorCode && data.ErrorCode !== 0) {
      throw new Error(`Yuboto Error (ErrorCode ${data.ErrorCode}): ${data.ErrorMessage || JSON.stringify(data)}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('SMS Sending failed:', error);
    return { success: false, error: error.message };
  }
}


