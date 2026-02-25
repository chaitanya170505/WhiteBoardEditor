import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/send-email";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"; // ✅ use admin client

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
  } = body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  console.log("Payment Verified ✅");

  /* -------------------------------- */
  /* 1️⃣ Update Plan in Database     */
  /* -------------------------------- */

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
  plan: "premium",
})
      .eq("email", email)
      .select();

    if (error) {
      console.error("Plan update failed ❌", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    console.log("User upgraded to Premium ✅", data);
  } catch (err) {
    console.error("Unexpected DB error ❌", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  /* -------------------------------- */
  /* 2️⃣ Send Confirmation Email     */
  /* -------------------------------- */

  const emailHtml = `
    <h2>🎉 Payment Successful!</h2>
    <p>Hi there,</p>
    <p>Your <strong>Premium Plan</strong> is now activated.</p>
    <ul>
      <li>Payment ID: ${razorpay_payment_id}</li>
      <li>Order ID: ${razorpay_order_id}</li>
      <li>Plan: Premium</li>
      <li>Features:
        <ul>
          <li>Up to 20 slides</li>
          <li>No watermarks</li>
          <li>PDF download</li>
          <li>Priority support</li>
        </ul>
      </li>
    </ul>
    <p>Enjoy 🚀</p>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Your Premium Plan is Activated 🎉",
      html: emailHtml,
    });
  } catch (err) {
    console.error("Email failed ❌", err);
  }

  return NextResponse.json({
    success: true,
    redirectTo: "/payment-success",
  });
}