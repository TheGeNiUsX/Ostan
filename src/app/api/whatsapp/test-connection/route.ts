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
      phoneNumberId: reqPhoneNumberId,
      accessToken: reqAccessToken,
      instanceId: reqInstanceId,
      token: reqToken,
    } = body;

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
            error: "Instance ID and Token are required to test UltraMsg connection.",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const ultraUrl = `https://api.ultramsg.com/${encodeURIComponent(instanceId)}/instance/status?token=${encodeURIComponent(token)}`;
      const ultraRes = await fetch(ultraUrl);
      const ultraData = await ultraRes.json();

      if (ultraData.status && ultraData.status.account_status) {
        const accStatus = ultraData.status.account_status;
        return NextResponse.json(
          {
            success: true,
            provider: "ultramsg",
            verifiedName: "UltraMsg Personal WhatsApp",
            displayPhoneNumber: accStatus.phone || "Active Linked Phone",
            qualityRating: accStatus.status === "authenticated" ? "AUTHENTICATED ✅" : accStatus.status,
            codeVerificationStatus: "CONNECTED",
          },
          { status: 200, headers: corsHeaders }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: ultraData.error || "UltraMsg authentication failed. Ensure Instance ID and Token are correct and your personal WhatsApp is paired.",
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
            error: "idInstance and apiTokenInstance are required to test Green-API connection.",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const greenUrl = `https://api.green-api.com/waInstance${encodeURIComponent(idInstance)}/getStateInstance/${encodeURIComponent(apiToken)}`;
      const greenRes = await fetch(greenUrl);
      const greenData = await greenRes.json();

      if (greenRes.ok && greenData.stateInstance) {
        return NextResponse.json(
          {
            success: greenData.stateInstance === "authorized",
            provider: "greenapi",
            verifiedName: "Green-API Personal WhatsApp",
            displayPhoneNumber: "Linked WhatsApp Account",
            qualityRating: greenData.stateInstance.toUpperCase(),
            codeVerificationStatus: greenData.stateInstance,
          },
          { status: 200, headers: corsHeaders }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: greenData.message || "Failed to verify Green-API instance.",
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
          error: "Phone Number ID and Access Token are required to test connection.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const metaUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneNumberId)}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`;

    const metaRes = await fetch(metaUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      const errorMsg =
        metaData.error?.message ||
        metaData.error?.error_user_msg ||
        "Failed to verify Meta WhatsApp credentials.";
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          details: metaData.error || metaData,
        },
        { status: metaRes.status, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        provider: "meta",
        verifiedName: metaData.verified_name || "Meta Verified Business Account",
        displayPhoneNumber: metaData.display_phone_number || "Active Number",
        qualityRating: metaData.quality_rating || "GREEN",
        codeVerificationStatus: metaData.code_verification_status || "VERIFIED",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("WhatsApp Test Connection Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error while testing WhatsApp API",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
