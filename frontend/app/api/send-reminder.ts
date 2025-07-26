import type { NextApiRequest, NextApiResponse } from 'next';
import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;

const client = new Twilio(accountSid, authToken);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ success: false, error: 'Missing to or message' });

  try {
    const sms = await client.messages.create({
      body: message,
      from: twilioPhone,
      to,
    });
    res.status(200).json({ success: true, sid: sms.sid });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
} 