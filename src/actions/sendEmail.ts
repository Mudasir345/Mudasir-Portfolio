"use server";

import nodemailer from "nodemailer";

const DEV = process.env.NODE_ENV === "development";

type LogFn = (...args: unknown[]) => void;
const NOOP = () => {};
const _: { g: LogFn; ge: LogFn; l: LogFn; w: LogFn; e: LogFn } = DEV
  ? {
      g: (...a) => console.group(...a),
      ge: () => console.groupEnd(),
      l: (...a) => console.log(...a),
      w: (...a) => console.warn(...a),
      e: (...a) => console.error(...a),
    }
  : {
      g: NOOP,
      ge: NOOP,
      l: NOOP,
      w: (...a) => console.warn(...a),
      e: (...a) => console.error(...a),
    };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = {
  name: 100,
  email: 254,
  phone: 30,
  message: 5000,
  website: 200,
};

function sanitize(input: FormDataEntryValue | null, maxLen: number): string {
  if (!input || typeof input !== "string") return "";
  let s = input.trim();
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export type SendEmailResult = {
  ok: boolean;
  delivered: boolean;
  message: string;
  needsManual?: boolean;
  debug?: string;
  fallback?: {
    mailto: string;
    whatsapp?: string;
    email: string;
  };
  fieldErrors?: Record<string, string>;
};

function getContactEmail(): string {
  return (
    process.env.CONTACT_EMAIL ||
    process.env.EMAIL_USER ||
    "mudasirchoudhry345@gmail.com"
  );
}

function getWhatsAppLink(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP ||
    process.env.WHATSAPP_URL ||
    "https://wa.me/923047045345"
  );
}

function buildFallbackLinks(name: string, senderEmail: string, phone: string, message: string) {
  const CONTACT_EMAIL = getContactEmail();
  const WHATSAPP_LINK = getWhatsAppLink();

  const subject = `New Portfolio Inquiry from ${name}`;
  const subjectEncoded = encodeURIComponent(subject);
  const bodyLines = [
    `Hi Mudasir,`,
    ``,
    message,
    ``,
    `Regards,`,
    name,
    senderEmail,
    phone && phone !== "Not provided" ? `Phone: ${phone}` : "",
  ].filter(Boolean);
  const bodyText = encodeURIComponent(bodyLines.join("\n"));
  const mailtoLink = `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${subjectEncoded}&body=${bodyText}`;

  const waTextLines = [
    `Hi Mudasir! 👋`,
    name ? `I'm ${name}.` : "",
    senderEmail ? `Email: ${senderEmail}` : "",
    phone && phone !== "Not provided" ? `Phone: ${phone}` : "",
    ``,
    message,
  ].filter(Boolean).join("\n");
  const waSep = WHATSAPP_LINK.includes("?") ? "&" : "?";
  const whatsappLink = `${WHATSAPP_LINK}${waSep}text=${encodeURIComponent(waTextLines)}`;

  return {
    CONTACT_EMAIL,
    WHATSAPP_LINK,
    mailtoLink,
    whatsappLink,
  };
}

function makeFallbackResult(mailto: string, whatsapp: string, email: string, extraMessage?: string, debug?: string): SendEmailResult {
  return {
    ok: true,
    delivered: false,
    needsManual: true,
    message:
      extraMessage ||
      "Direct delivery couldn't complete just yet, so I'll open your email app with a pre-filled message — just hit 'Send' there and it reaches me right away! You can also use the WhatsApp / Email buttons below as alternatives.",
    debug,
    fallback: {
      mailto,
      whatsapp,
      email,
    },
  };
}

/** ──────────────── Primary: Web3Forms (https://web3forms.com) ──────────────── */
async function tryWeb3Forms(
  name: string,
  senderEmail: string,
  phone: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || process.env.WEB3FORMS_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mudasirdev.vercel.app";

  _.g("📧 [sendEmail] TRYING Web3Forms =========================================");
  _.l("1. Env key check:", {
    NEXT_PUBLIC_WEB3FORMS_KEY_set: Boolean(process.env.NEXT_PUBLIC_WEB3FORMS_KEY),
    WEB3FORMS_KEY_set: Boolean(process.env.WEB3FORMS_KEY),
    resolvedKeyPrefix: accessKey ? accessKey.slice(0, 8) + "…" : "MISSING",
    resolvedKeyLength: accessKey?.length ?? 0,
  });

  if (!accessKey || accessKey.length < 10) {
    _.e("❌ Web3Forms FAILED: Access key not configured or too short (< 10 chars)");
    _.ge();
    return { success: false, error: "Web3Forms key not configured. Add NEXT_PUBLIC_WEB3FORMS_KEY to .env" };
  }

  const CONTACT_EMAIL = getContactEmail();
  const basePayload: Record<string, string> = {
    access_key: accessKey,
    name,
    email: senderEmail,
    phone,
    message,
    subject: `New Portfolio Inquiry from ${name}`,
    to: CONTACT_EMAIL,
    from_name: "Portfolio Contact Form",
    botcheck: "",
  };

  _.l("2. Payload built:", {
    from_name: basePayload.from_name,
    to: basePayload.to,
    subject: basePayload.subject,
    has_access_key: Boolean(basePayload.access_key),
    keys: Object.keys(basePayload),
  });

  const baseHeaders: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 PortfolioApp/1.0 (server-side; +" +
      siteUrl +
      ")",
    Referer: siteUrl.endsWith("/") ? siteUrl : siteUrl + "/",
    Origin: siteUrl,
    "X-Requested-With": "XMLHttpRequest",
    "Accept-Language": "en-US,en;q=0.9",
    DNT: "1",
  };

  type AttemptFn = () => Promise<{ res: Response; tryName: string }>;
  const attempts: Array<AttemptFn> = [
    async () => {
      _.l("3a. TRY JSON POST (application/json) ...");
      return {
        tryName: "JSON POST",
        res: await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            ...baseHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basePayload),
          cache: "no-store",
        }),
      };
    },
    async () => {
      _.l("3b. RETRY form-encoded POST (application/x-www-form-urlencoded) ...");
      const params = new URLSearchParams();
      Object.entries(basePayload).forEach(([k, v]) => params.append(k, v));
      return {
        tryName: "Form-urlencoded POST",
        res: await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            ...baseHeaders,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: params.toString(),
          cache: "no-store",
        }),
      };
    },
  ];

  let lastRes: Response | null = null;
  let lastTryName = "";
  for (const run of attempts) {
    let res: Response;
    try {
      const { res: r, tryName } = await run();
      res = r;
      lastTryName = tryName;
    } catch (networkErr) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      _.e(`❌ Web3Forms NETWORK ERROR (${lastTryName || "fetch"}):`, msg);
      continue;
    }
    lastRes = res;
    _.l(`4. HTTP Response (${lastTryName}):`, {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      contentType: res.headers.get("content-type"),
    });

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      const rawText = await res.text().catch(() => "<unable to read body>");
      const snippet = rawText.slice(0, 400);
      _.w(`   ⚠️  Response not JSON (content-type="${ct}") — first 400 chars:`);
      _.w(`   ${snippet.replace(/\s+/g, " ").slice(0, 400)}`);
      if (res.status === 403) {
        _.w("   ⚠️  HTTP 403 = Cloudflare WAF blocked server-side fetch. Will try FormSubmit.co next.");
      }
      continue;
    }

    let json: Record<string, unknown> = {};
    try {
      json = (await res.json()) as Record<string, unknown>;
      _.l("5. Response JSON:", JSON.stringify(json, null, 2));
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      _.e("❌ Web3Forms JSON PARSE ERROR:", msg);
      continue;
    }

    const isSuccess = Boolean(json?.success);
    if (isSuccess) {
      _.l(`✅ Web3Forms SUCCESS via ${lastTryName}! Message delivered.`);
      _.ge();
      return { success: true };
    }

    const apiMessage = typeof json?.message === "string" ? json.message : "No error message from API";
    _.e(`❌ Web3Forms ${lastTryName} FAILED: API returned success=false`);
    _.e("   API error message:", apiMessage);
  }

  if (lastRes && lastRes.status === 403) {
    _.ge();
    return {
      success: false,
      error:
        "Web3Forms blocked (Cloudflare WAF 403 on server-side). This is common when calling from Node/Vercel. Trying FormSubmit.co next…",
    };
  }

  const status = lastRes?.status ?? "no-response";
  _.e("❌ Web3Forms ALL ATTEMPTS FAILED.");
  _.ge();
  return { success: false, error: `Web3Forms error: HTTP ${status} (tried 2 formats, no success)` };
}

/** ───── Layer 2: FormSubmit.co (FREE, NO SIGNUP — POST to formsubmit.co/ajax/EMAIL) ───── */
async function tryFormSubmit(
  name: string,
  senderEmail: string,
  phone: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const CONTACT_EMAIL = getContactEmail();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mudasirdev.vercel.app";
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`;

  _.g("📧 [sendEmail] TRYING #2 FormSubmit.co (FREE, no signup) ===============");
  _.l("1. Endpoint:", endpoint);
  _.l("2. Deliver to email:", CONTACT_EMAIL);

  const body: Record<string, string> = {
    name,
    email: senderEmail,
    phone: phone === "Not provided" ? "" : phone,
    message,
    _subject: `New Portfolio Inquiry from ${name}`,
    _template: "table",
    _captcha: "false",
    _autoresponse: `Hi ${name.split(" ")[0] || "there"},\n\nThanks for reaching out! I received your message and I'll get back to you within 24 hours.\n\nBest,\nMudasir Choudhry`,
  };

  let res: Response;
  try {
    _.l("3. POST JSON to FormSubmit.co/ajax ...");
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 PortfolioApp/1.0",
        Referer: siteUrl.endsWith("/") ? siteUrl : siteUrl + "/",
        Origin: siteUrl,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    _.l("4. HTTP Response:", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      contentType: res.headers.get("content-type"),
    });
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
    _.e("❌ FormSubmit.co NETWORK ERROR:", msg);
    _.ge();
    return { success: false, error: `FormSubmit network error: ${msg}` };
  }

  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
    _.l("5. Response JSON:", JSON.stringify(json, null, 2));
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    _.e("❌ FormSubmit.co JSON PARSE ERROR:", msg);
    const rawText = await res.text().catch(() => "<unable to read body>");
    _.e("   Raw body (first 500):", rawText.slice(0, 500));
    _.ge();
    return {
      success: false,
      error: `FormSubmit.co HTTP ${res.status} — non-JSON response. ${msg}`,
    };
  }

  const success = json.success === true || json.status === "success" || res.ok;
  if (success) {
    _.l("✅ FormSubmit.co SUCCESS! Email queued for delivery.");
    _.l("   Note: First time ONLY — FormSubmit sends a verification email to", CONTACT_EMAIL);
    _.l('   Please click "Activate Form" in that email for submissions to start working.');
    _.ge();
    return { success: true };
  }

  const apiMessage =
    typeof json.message === "string"
      ? json.message
      : typeof json.error === "string"
        ? json.error
        : "Unknown error from FormSubmit.co";
  _.e("❌ FormSubmit.co FAILED:", apiMessage);
  _.ge();
  return { success: false, error: `FormSubmit.co: ${apiMessage} (HTTP ${res.status})` };
}

/** ──────────────── Layer 3: Nodemailer Gmail SMTP ──────────────── */
async function tryNodemailer(
  name: string,
  senderEmail: string,
  phone: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  _.g("📧 [sendEmail] TRYING #3 Nodemailer (Gmail SMTP) ====================");
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const checks = {
    EMAIL_USER_set: Boolean(emailUser),
    EMAIL_PASS_set: Boolean(emailPass),
    EMAIL_PASS_length: emailPass?.length ?? 0,
    isPlaceholder:
      emailPass === "your-app-password" ||
      emailPass === "your-16-character-gmail-app-password" ||
      emailPass === "REPLACE_WITH_YOUR_GMAIL_APP_PASSWORD",
  };
  _.l("1. Credentials check:", checks);

  if (!emailUser || !emailPass || checks.isPlaceholder || emailPass.length < 10) {
    _.w("⚠️  Skipping Nodemailer: not configured (placeholder or missing creds)");
    _.ge();
    return { success: false, error: "Nodemailer not configured. Set valid EMAIL_USER + EMAIL_PASS (Gmail App Password)" };
  }

  try {
    _.l("2. Creating Gmail transporter...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    _.l("3. Verifying transporter connection...");
    const verified = await transporter.verify().catch((e) => {
      _.w("   Transporter verify failed:", e instanceof Error ? e.message : String(e));
      return false;
    });
    _.l("   Transporter verified:", verified);

    const safeName = name.replace(/[<>\\]/g, "").slice(0, 80);
    const safePhone = phone.replace(/[<>\\]/g, "").slice(0, 30);
    const safeMessage = message
      .replace(/<script/gi, "&lt;script")
      .replace(/<\/script>/gi, "&lt;/script&gt;");

    const subject = `New Portfolio Inquiry from ${safeName}`;

    const mailOptions = {
      from: `"Mudasir Portfolio Contact" <${emailUser}>`,
      to: emailUser,
      replyTo: senderEmail,
      subject,
      text: `Name: ${safeName}\nPhone: ${safePhone}\nEmail: ${senderEmail}\n\nMessage:\n${safeMessage}`,
      html: `<!DOCTYPE html>
<html>
<head><style>
  body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
  .container{max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
  .header{background:linear-gradient(90deg,#7c3aed,#0891b2);color:white;padding:20px;text-align:center}
  .content{padding:30px;background-color:#f9fafb}
  .field{margin-bottom:15px}
  .label{font-weight:bold;color:#555;display:block;margin-bottom:5px}
  .value{background:white;padding:10px;border-radius:4px;border:1px solid #ddd;white-space:pre-wrap;word-break:break-word}
  .footer{text-align:center;padding:15px;font-size:12px;color:#888;background:#f1f1f1}
</style></head>
<body>
  <div class="container">
    <div class="header"><h2 style="margin:0">New Portfolio Inquiry</h2></div>
    <div class="content">
      <div class="field"><span class="label">Name</span><div class="value">${safeName}</div></div>
      <div class="field"><span class="label">Email</span><div class="value"><a href="mailto:${senderEmail}">${senderEmail}</a></div></div>
      <div class="field"><span class="label">Phone</span><div class="value">${safePhone}</div></div>
      <div class="field"><span class="label">Message</span><div class="value">${safeMessage}</div></div>
    </div>
    <div class="footer">Received from your Portfolio Contact Form</div>
  </div>
</body>
</html>`,
    };

    _.l("4. Sending email via SMTP...");
    const info = await transporter.sendMail(mailOptions);
    _.l("✅ Nodemailer SUCCESS!");
    _.l("   Message ID:", info.messageId);
    _.l("   Accepted:", info.accepted);
    _.ge();
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    _.e("❌ Nodemailer FAILED:", msg);
    _.e("   Stack:", err instanceof Error ? err.stack : "N/A");
    _.ge();
    return { success: false, error: `SMTP error: ${msg}` };
  }
}

export const sendEmail = async (formData: FormData): Promise<SendEmailResult> => {
  const nameRaw = formData.get("name");
  const phoneRaw = formData.get("phone") ?? "";
  const senderEmailRaw = formData.get("senderEmail");
  const messageRaw = formData.get("message");
  const honeypot = formData.get("website");

  const name = sanitize(nameRaw, MAX_LEN.name);
  const phone = sanitize(phoneRaw, MAX_LEN.phone) || "Not provided";
  const senderEmail = sanitize(senderEmailRaw, MAX_LEN.email).toLowerCase();
  const message = sanitize(messageRaw, MAX_LEN.message);
  const website = sanitize(honeypot, MAX_LEN.website);

  _.g("%c🚀 [sendEmail] Server action invoked =========================", "color:#7c3aed; font-weight:bold");
  _.l("Received fields:", {
    name_len: name.length,
    senderEmail,
    phone_provided: phone !== "Not provided",
    message_len: message.length,
    honeypot_website_len: website.length,
  });

  const fieldErrors: Record<string, string> = {};

  if (website.length > 0) {
    _.l("🤖 Honeypot triggered (bot detected) → Silent success return");
    _.ge();
    return {
      ok: true,
      delivered: false,
      message: "✅",
    };
  }

  if (name.length < 2) fieldErrors.name = "Please enter your name (at least 2 characters).";
  if (!senderEmail) {
    fieldErrors.senderEmail = "Please enter your email address.";
  } else if (!EMAIL_REGEX.test(senderEmail)) {
    fieldErrors.senderEmail = "Please enter a valid email (e.g., name@example.com).";
  }
  if (message.length < 5) fieldErrors.message = "Please write a message (at least 5 characters).";

  if (Object.keys(fieldErrors).length > 0) {
    _.w("⚠️  Validation failed:", fieldErrors);
    _.ge();
    return {
      ok: false,
      delivered: false,
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const { CONTACT_EMAIL, mailtoLink, whatsappLink } = buildFallbackLinks(
    name,
    senderEmail,
    phone,
    message,
  );

  /** ── Try #1: Web3Forms ──────────────────────────────────────── */
  const w3f = await tryWeb3Forms(name, senderEmail, phone, message);
  if (w3f.success) {
    const firstName = name.split(" ")[0] || name;
    _.ge();
    return {
      ok: true,
      delivered: true,
      message: `✅ Thank you, ${firstName}! Your message was delivered successfully. I'll get back to you within 24 hours.`,
    };
  }

  /** ── Try #2: FormSubmit.co (FREE, no signup) ─────────────── */
  const fs = await tryFormSubmit(name, senderEmail, phone, message);
  if (fs.success) {
    const firstName = name.split(" ")[0] || name;
    _.ge();
    return {
      ok: true,
      delivered: true,
      message: `✅ Thank you, ${firstName}! Your message was delivered successfully. I'll get back to you within 24 hours.`,
    };
  }

  /** ── Try #3: Nodemailer (Gmail SMTP) ────────────────────────── */
  const smtp = await tryNodemailer(name, senderEmail, phone, message);
  if (smtp.success) {
    const firstName = name.split(" ")[0] || name;
    _.ge();
    return {
      ok: true,
      delivered: true,
      message: `✅ Thank you, ${firstName}! Your message was delivered successfully. I'll get back to you within 24 hours.`,
    };
  }

  /** ── All 3 delivery methods failed → graceful fallback ─────── */
  const debugInfo =
    `Web3Forms: ${w3f.error || "unknown error"} | ` +
    `FormSubmit.co: ${fs.error || "unknown error"} | ` +
    `Nodemailer: ${smtp.error || "skipped"}`;
  _.e("💥 ALL 3 delivery methods FAILED → fallback to mailto. Debug:", debugInfo);
  _.ge();

  return makeFallbackResult(mailtoLink, whatsappLink, CONTACT_EMAIL, undefined, debugInfo);
};
