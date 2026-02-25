"use client";

import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🎉 Payment Successful!</h1>

      <p style={styles.subText}>
        Your Premium Plan is now active.
      </p>

      <div style={styles.card}>
        <h2>✨ Premium Features Unlocked:</h2>
        <ul>
          <li>Unlimited Slides</li>
          <li>Export to PDF</li>
          <li>High Resolution Downloads</li>
          <li>Cloud Auto-Save</li>
          <li>Priority Support</li>
        </ul>
      </div>

      <button
        style={styles.button}
        onClick={() => router.push("/dashboard")}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
    padding: "20px",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  subText: {
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    width: "300px",
  },
  button: {
    padding: "10px 20px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};