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
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`, // Sender address (must be authenticated user)
        to: process.env.EMAIL_USER, // Receiver address (yourself)
        replyTo: senderEmail as string, // Reply to the user who filled the form
        subject: `New Inquiry from ${name} | Portfolio`,
        text: `
      Name: ${name}
      Phone: ${phone}
      Email: ${senderEmail}
      
      Message:
      ${message}
    `,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
          .header { bg-gradient-to-r from-purple-600 to-cyan-600; background: linear-gradient(90deg, #7c3aed, #0891b2); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9fafb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #888; background: #f1f1f1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;">New Portfolio Inquiry</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name</span>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <span class="label">Email</span>
              <div class="value"><a href="mailto:${senderEmail}">${senderEmail}</a></div>
            </div>
            <div class="field">
              <span class="label">Phone</span>
              <div class="value">${phone}</div>
            </div>
            <div class="field">
              <span class="label">Message</span>
              <div class="value" style="white-space: pre-wrap;">${message}</div>
            </div>
          </div>
          <div class="footer">
            Received from your Portfolio Contact Form
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error: any) {
        console.error("Email Error:", error);
        return { error: error.message || "Something went wrong" };
    }
};
