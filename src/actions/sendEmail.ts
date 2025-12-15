"use server";

import nodemailer from "nodemailer";

export const sendEmail = async (formData: FormData) => {
    const name = formData.get("name");
    const phone = formData.get("phone");
    const senderEmail = formData.get("senderEmail");
    const message = formData.get("message");

    // Simple server-side validation
    if (!message || typeof message !== "string") {
        return { error: "Invalid message" };
    }
    if (!senderEmail || typeof senderEmail !== "string") {
        return { error: "Invalid email" };
    }
    if (!name || typeof name !== "string") {
        return { error: "Invalid name" };
    }

    // Create Transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Google App Password
        },
    });

    const mailOptions = {
        from: `${name} <${senderEmail}>`,
        to: "mudasirchoudhry345@gmail.com",
        subject: `New Portfolio Message from ${name}`,
        text: `
      Name: ${name}
      Phone: ${phone}
      Email: ${senderEmail}
      
      Message:
      ${message}
    `,
        html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${senderEmail}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { error: error.message || "Something went wrong" };
    }
};
