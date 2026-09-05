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
      provider = "meta", // "meta" | "ultramsg" | "greenapi"
      phone,
      message,
      templateName,
      templateLanguage = "en_US",
      phoneNumberId: reqPhoneNumberId,
      accessToken: reqAccessToken,
      instanceId: reqInstanceId,
      token: reqToken,
    } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message body cannot be empty." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Clean phone number: remove non-digits, leading +, 00, etc.
    let cleanPhone = String(phone).replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
      cleanPhone = "966" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("5") && cleanPhone.length === 9) {
      cleanPhone = "966" + cleanPhone;
    }

    // =========================================================================
    // PROVIDER 1: ULTRAMSG (FOR NORMAL PERSONAL WHATSAPP NUMBERS)
    // =========================================================================
    if (provider === "ultramsg") {
      const instanceId = reqInstanceId || reqPhoneNumberId || process.env.ULTRAMSG_INSTANCE_ID;
      const token = reqToken || reqAccessToken || process.env.ULTRAMSG_TOKEN;

      if (!instanceId || !token) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing UltraMsg credentials. Please provide Instance ID and Token.",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const ultraUrl = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/messages/chat`;
      const ultraRes = await fetch(ultraUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          to: cleanPhone,
          body: message.trim(),
        }),
      });

      const ultraData = await ultraRes.json();

      if (ultraData.sent === "true" || ultraData.id) {
        return NextResponse.json(
          {
            success: true,
            messageId: String(ultraData.id || "msg-" + Date.now()),
            recipient: cleanPhone,
            provider: "ultramsg",
            data: ultraData,
          },
          { status: 200, headers: corsHeaders }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: ultraData.error || ultraData.message || "UltraMsg dispatch failed.",
            details: ultraData,
          },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // =========================================================================
    // PROVIDER 2: GREEN-API (FOR NORMAL PERSONAL WHATSAPP NUMBERS)
    // =========================================================================
    if (provider === "greenapi") {
      const idInstance = reqInstanceId || reqPhoneNumberId || process.env.GREENAPI_ID_INSTANCE;
      const apiToken = reqToken || reqAccessToken || process.env.GREENAPI_TOKEN;

      if (!idInstance || !apiToken) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing Green-API credentials. Please provide idInstance and apiTokenInstance.",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const greenUrl = `https://api.green-api.com/waInstance${encodeURIComponent(idInstance)}/sendMessage/${encodeURIComponent(apiToken)}`;
      const greenRes = await fetch(greenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: `${cleanPhone}@c.us`,
          message: message.trim(),
        }),
      });

      const greenData = await greenRes.json();

      if (greenRes.ok && greenData.idMessage) {
        return NextResponse.json(
          {
            success: true,
            messageId: greenData.idMessage,
            recipient: cleanPhone,
            provider: "greenapi",
            data: greenData,
          },
          { status: 200, headers: corsHeaders }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: greenData.message || "Green-API dispatch failed.",
            details: greenData,
          },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // =========================================================================
    // PROVIDER 3: OFFICIAL META CLOUD API (FOR WHATSAPP BUSINESS ACCOUNTS)
    // =========================================================================
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

    const metaUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneNumberId)}/messages`;

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
        provider: "meta",
        data: metaData,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("WhatsApp API Send Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error while calling WhatsApp API",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
