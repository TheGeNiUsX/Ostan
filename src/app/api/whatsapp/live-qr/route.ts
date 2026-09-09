import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL || "http://localhost:5001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/status`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: "gateway_offline",
        error: "WhatsApp gateway service is offline. Start it with 'npm run whatsapp'.",
        details: err?.message,
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = "send", ...payload } = body;

    let targetEndpoint = `${GATEWAY_URL}/api/send`;
    if (action === "logout") {
      targetEndpoint = `${GATEWAY_URL}/api/logout`;
    } else if (action === "restart") {
      targetEndpoint = `${GATEWAY_URL}/api/restart`;
    }

    const res = await fetch(targetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to communicate with WhatsApp gateway",
      },
      { status: 502, headers: corsHeaders }
    );
  }
}
