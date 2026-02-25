export const runtime = "nodejs";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 100, // ₹1
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    console.log("ORDER RESPONSE:", order);


    return NextResponse.json({
  success: true,
  order
});


  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
