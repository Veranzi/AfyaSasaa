import { NextRequest, NextResponse } from 'next/server';
import africastalking from 'africastalking';

console.log('AT_API_KEY:', process.env.AT_API_KEY);
console.log('AT_USERNAME:', process.env.AT_USERNAME);

const AT = africastalking({
  apiKey: process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
});

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    if (!to || !message) {
      return NextResponse.json({ success: false, error: 'Missing phone or message' }, { status: 400 });
    }
    // Africa's Talking expects an array for 'to'
    const sms = await AT.SMS.send({ to: [to], message });
    return NextResponse.json({ success: true, sms });
  } catch (error: any) {
    console.error("Africa's Talking SMS error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
} 