import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/sms/service";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone, message } = await req.json();
  if (!phone || !message) {
    return NextResponse.json(
      { error: "phone and message are required" },
      { status: 400 }
    );
  }

  const result = await sendSms(phone, message);
  if (result.success) {
    return NextResponse.json({ success: true, messageId: result.data.messageId });
  }

  return NextResponse.json(
    { success: false, error: result.error.message },
    { status: 500 }
  );
}
