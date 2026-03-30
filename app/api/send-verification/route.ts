import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import admin from "firebase-admin";

// Initialise Admin SDK once (safe across hot reloads)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────────────────────
//  POST /api/send-verification
//  Body: { email: string }
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    // 1️⃣ Generate real Firebase verification link
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      });

    // 2️⃣ Send via Resend
    const { error } = await resend.emails.send({
      from: `Kopa360 <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: "Verify your email address",
      html: buildEmailHtml(verificationLink),
    });

    if (error) {
      console.error("[send-verification] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send verification email." },
        { status: 500 },
      );
    }

    console.log("[send-verification] Verification email sent to:", email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[send-verification] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Email template — green theme + logo space
// ─────────────────────────────────────────────────────────────
function buildEmailHtml(verificationLink: string): string {
  const LOGO_URL = `${process.env.NEXT_PUBLIC_APP_URL}/kopa360-logo.png`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
      </head>
      <body style="margin:0;padding:0;background:#f0faf4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="520" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                <!-- ── Logo Bar ── -->
                <tr>
                  <td style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:1px solid #e6f4ec;">
                    <img
                      src="${LOGO_URL}"
                      alt="Kopa360"
                      width="140"
                      style="display:inline-block;height:auto;max-height:60px;object-fit:contain;"
                    />
                  </td>
                </tr>

                <!-- ── Green Header ── -->
                <tr>
                  <td style="background:#16a34a;padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                      Confirm your email address
                    </h1>
                    <p style="margin:8px 0 0;color:#bbf7d0;font-size:14px;">
                      One step away from getting started
                    </p>
                  </td>
                </tr>

                <!-- ── Body ── -->
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                      Thanks for signing up for <strong>Kopa360</strong>! Click the button
                      below to verify your email address and activate your account.
                      This link expires in <strong>24 hours</strong>.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin:28px auto;">
                      <tr>
                        <td style="background:#16a34a;border-radius:8px;">
                          <a href="${verificationLink}"
                            style="display:inline-block;padding:14px 36px;color:#ffffff;
                                   font-size:15px;font-weight:700;text-decoration:none;
                                   border-radius:8px;letter-spacing:0.2px;">
                            ✓ Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                      <tr>
                        <td style="border-top:1px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin:0;word-break:break-all;">
                      <a href="${verificationLink}"
                        style="color:#16a34a;font-size:13px;">${verificationLink}</a>
                    </p>
                  </td>
                </tr>

                <!-- ── Footer ── -->
                <tr>
                  <td style="padding:20px 32px;background:#f0faf4;border-top:1px solid #e6f4ec;text-align:center;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">
                      If you didn't create a Kopa360 account, you can safely ignore this email.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:11px;">
                      © ${new Date().getFullYear()} Kopa360. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
