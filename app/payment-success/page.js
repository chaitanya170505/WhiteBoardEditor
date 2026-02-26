"use client";

import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>🎉 Payment Successful!</h1>

        <p style={styles.subText}>
          Your Premium Plan is now active and ready to use.
        </p>

        <div style={styles.features}>
          <h2 style={styles.featureTitle}>✨ Premium Features Unlocked</h2>
          <ul style={styles.list}>
            <li>Unlimited Slides</li>
            <li>Export to PDF</li>
            <li>High Resolution Downloads</li>
            <li>Priority Support</li>
          </ul>
        </div>

        <button
          style={styles.button}
          onClick={() => router.push("/")}
          onMouseOver={(e) =>
            (e.target.style.transform = "scale(1.05)")
          }
          onMouseOut={(e) =>
            (e.target.style.transform = "scale(1)")
          }
        >
          🚀 Return to Home
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #d1fae5, #ecfdf5)",
    padding: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
  },
  heading: {
    fontSize: "30px",
    marginBottom: "10px",
    fontWeight: "700",
    color: "#065f46",
  },
  subText: {
    marginBottom: "25px",
    color: "#374151",
    fontSize: "15px",
  },
  features: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "left",
  },
  featureTitle: {
    fontSize: "16px",
    marginBottom: "12px",
    fontWeight: "600",
    color: "#15803d",
  },
  list: {
    paddingLeft: "18px",
    lineHeight: "1.8",
    color: "#374151",
    fontSize: "14px",
  },
  button: {
    padding: "12px 28px",
    background: "linear-gradient(90deg, #16a34a, #15803d)",
    color: "#ffffff",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
};