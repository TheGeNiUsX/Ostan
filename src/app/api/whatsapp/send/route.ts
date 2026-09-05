import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      message,
      templateName,
      templateLanguage = "en_US",
      phoneNumberId: reqPhoneNumberId,
      accessToken: reqAccessToken,
    } = body;

    const phoneNumberId = reqPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = reqAccessToken || process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Meta WhatsApp credentials. Please provide Phone Number ID and Access Token in settings or .env.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Clean phone number: remove non-digits, leading +, 00, etc.
    let cleanPhone = String(phone).replace(/[^0-9]/g, "");
    // Saudi standard auto-correction if starts with 05...
    if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
      cleanPhone = "966" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("5") && cleanPhone.length === 9) {
      cleanPhone = "966" + cleanPhone;
    }

    let payload: Record<string, any>;

    if (templateName) {
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
        },
      };
    } else {
      if (!message || !message.trim()) {
        return NextResponse.json(
          { success: false, error: "Message body cannot be empty." },
          { status: 400, headers: corsHeaders }
        );
      }
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: false,
          body: message.trim(),
        },
      };
    }

    const metaUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const metaRes = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      const errorMsg =
        metaData.error?.message ||
        metaData.error?.error_user_msg ||
        "Meta API dispatch failed.";
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          details: metaData.error || metaData,
        },
        { status: metaRes.status, headers: corsHeaders }
      );
    }

    const messageId = metaData.messages?.[0]?.id || null;

    return NextResponse.json(
      {
        success: true,
        messageId,
        recipient: cleanPhone,
        data: metaData,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Meta WhatsApp Send Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error while calling Meta API",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
