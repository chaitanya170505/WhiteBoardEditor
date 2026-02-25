import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  // Create transporter using SMTP (example: Gmail / SendGrid / your SMTP)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"ManoRekha" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}