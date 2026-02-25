"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Script from "next/script";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Fetch user email on component load
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Supabase getUser error:", error);
        return;
      }
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handlePayment = async () => {
    if (!userEmail) {
      alert("Please log in to upgrade.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create order from backend
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Order creation failed");
        return;
      }

      // 2️⃣ Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "ManoRekha",
        description: "Pro Plan Subscription",
        order_id: orderData.order.id,

        // 3️⃣ Prefill email
        prefill: { email: userEmail },

        // 4️⃣ Payment success handler
        handler: async function (response) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, email: userEmail }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("🎉 Payment Successful! Pro Activated.");
            window.location.href = verifyData.redirectTo || "/payment-success";
          } else {
            alert("Payment verification failed.");
          }
        },

        theme: { color: "#15803d" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center justify-center px-6 py-20">
        {userEmail && (
          <p className="mb-6 text-sm text-green-800 bg-green-100 px-4 py-2 rounded-full border border-green-200">
            Upgrading account: <strong>{userEmail}</strong>
          </p>
        )}

        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10">

          {/* FREE PLAN */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-green-100 opacity-80">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Free Plan</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✔ Up to 10 slides</li>
              <li>✔ Watermarked slides</li>
              <li>❌ No PDF download</li>
            </ul>
            <button className="mt-8 w-full py-3 rounded-xl bg-gray-200 text-gray-600 font-semibold cursor-default">
              Current Plan
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-green-600 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-700 text-white text-xs px-4 py-1 rounded-full">
              Most Popular
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-6">Pro Plan</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✔ Up to 15 slides</li>
              <li>✔ No watermarks</li>
              <li>✔ PDF download</li>
              <li>✔ Priority support</li>
            </ul>
            <button
              onClick={handlePayment}
              disabled={loading || !userEmail}
              className="mt-8 w-full py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : userEmail ? "Subscribe Now" : "Please Login"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}