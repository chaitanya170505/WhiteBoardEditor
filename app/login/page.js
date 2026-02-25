"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

const Auth = dynamic(
  () => import("@supabase/auth-ui-react").then((mod) => mod.Auth),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState("sign_in");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push("/");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-green-100">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-2">
          {view === "sign_in" ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="text-gray-500 text-center mb-8 text-sm">
          {view === "sign_in"
            ? "Sign in to continue"
            : "Sign up to get started"}
        </p>

        <Auth
          supabaseClient={supabase}
          view={view}
          providers={[]}
          redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/`}
          appearance={{
            style: {
              container: { gap: "14px" },
              input: {
                background: "transparent",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "12px",
                color: "#065f46",
              },
              label: {
                color: "#047857",
                fontWeight: "500",
              },
              button: {
                background: "#16a34a",
                color: "white",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: "600",
              },
              anchor: { color: "#15803d" },
            },
          }}
        />

        <div className="mt-6 text-center text-sm text-gray-600">
          {view === "sign_in" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setView("sign_up")}
                className="text-green-700 font-semibold"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setView("sign_in")}
                className="text-green-700 font-semibold"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}