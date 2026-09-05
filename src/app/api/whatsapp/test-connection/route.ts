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
      phoneNumberId: reqPhoneNumberId,
      accessToken: reqAccessToken,
    } = body;

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

    // Call Meta Graph API to fetch phone number details
    const metaUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`;

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
        verifiedName: metaData.verified_name || "Meta Verified Business Account",
        displayPhoneNumber: metaData.display_phone_number || "Active Number",
        qualityRating: metaData.quality_rating || "GREEN",
        codeVerificationStatus: metaData.code_verification_status || "VERIFIED",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Meta WhatsApp Test Connection Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error while testing Meta API",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
