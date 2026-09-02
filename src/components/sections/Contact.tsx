"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "framer-motion";
import {
  Send,
  Smartphone,
  User,
  Mail,
  Loader2,
  Github,
  Linkedin,
  ExternalLink,
  XCircle,
  CheckCircle2,
  Copy,
  CheckCheck,
  MessageCircle,
} from "lucide-react";
import { ProfileData } from "@/lib/db";
import { gmailComposeUrl, CONTACT_EMAIL } from "@/lib/contact";
import { sendEmail, type SendEmailResult } from "@/actions/sendEmail";

interface ContactProps {
  profile: ProfileData;
}

type FieldErrors = Record<"name" | "senderEmail" | "message" | "phone", string | null>;
type Banner = null | {
  type: "success" | "error" | "info";
  title?: string;
  text: string;
  debug?: string;
  ctas?: Array<{ label: string; href: string; icon?: React.ComponentType<{ size?: number }>; external?: boolean }>;
  copyText?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SEC = 60;
const AUTO_DISMISS_SUCCESS_MS = 6500;

function validate(values: { name: string; senderEmail: string; message: string; phone: string }): FieldErrors {
  const errors: FieldErrors = { name: null, senderEmail: null, message: null, phone: null };
  const name = values.name.trim();
  const email = values.senderEmail.trim().toLowerCase();
  const msg = values.message.trim();
  const phone = values.phone.trim();

  if (name.length < 2) errors.name = "Please enter your full name (at least 2 characters).";
  else if (name.length > 100) errors.name = "Name is too long (100 characters max).";

  if (!email) errors.senderEmail = "Email address is required.";
  else if (!EMAIL_REGEX.test(email)) errors.senderEmail = "That email doesn't look right. Try name@example.com.";
  else if (email.length > 254) errors.senderEmail = "Email is too long (254 characters max).";

  if (msg.length < 5) errors.message = "Please write a short message (at least 5 characters).";
  else if (msg.length > 5000) errors.message = "Message is too long (5000 characters max).";

  if (phone && phone.length > 30) errors.phone = "Phone number is too long (30 characters max).";

  return errors;
}

function firstErrorField(errors: FieldErrors): keyof FieldErrors | null {
  const order: Array<keyof FieldErrors> = ["name", "senderEmail", "phone", "message"];
  return order.find((k) => errors[k]) ?? null;
}

const Contact = ({ profile }: ContactProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [banner, setBanner] = useState<Banner>(null);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    name: null,
    senderEmail: null,
    message: null,
    phone: null,
  });
  const [shakeKey, setShakeKey] = useState(0);

  const valuesRef = useRef({ name: "", senderEmail: "", message: "", phone: "" });

  useEffect(() => {
    if (cooldownLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setCooldownLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldownLeft]);

  useEffect(() => {
    if (banner?.type !== "success") return undefined;
    const id = window.setTimeout(() => setBanner(null), AUTO_DISMISS_SUCCESS_MS);
    return () => window.clearTimeout(id);
  }, [banner]);

  const onFieldChange = useCallback((field: keyof FieldErrors, value: string) => {
    valuesRef.current[field] = value;
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const copyEmail = useCallback(async (email: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, []);

  const buildMailtoFallback = useCallback((vals: typeof valuesRef.current) => {
    const subject = `Portfolio Inquiry from ${vals.name.trim() || "Visitor"}`;
    const lines = [
      `Hi Mudasir,`,
      ``,
      vals.message.trim(),
      ``,
      `Regards,`,
      vals.name.trim() || "A visitor",
      vals.senderEmail.trim() ? `Email: ${vals.senderEmail.trim()}` : "",
      vals.phone.trim() ? `Phone: ${vals.phone.trim()}` : "",
    ].filter(Boolean);
    return `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }, []);

  const buildWhatsAppFallback = useCallback((vals: typeof valuesRef.current) => {
    const base = profile.whatsapp || "https://wa.me/923047045345";
    const text = [
      `Hi Mudasir! 👋`,
      vals.name.trim() ? `I'm ${vals.name.trim()}.` : "",
      vals.senderEmail.trim() ? `Email: ${vals.senderEmail.trim()}` : "",
      vals.phone.trim() ? `Phone: ${vals.phone.trim()}` : "",
      ``,
      vals.message.trim(),
    ].filter(Boolean).join("\n");
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}text=${encodeURIComponent(text)}`;
  }, [profile.whatsapp]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || cooldownLeft > 0) return;
    const form = e.currentTarget;
    const raw = new FormData(form);
    const current = {
      name: String(raw.get("name") ?? ""),
      senderEmail: String(raw.get("senderEmail") ?? ""),
      message: String(raw.get("message") ?? ""),
      phone: String(raw.get("phone") ?? ""),
    };
    valuesRef.current = current;

    const errors = validate(current);
    setFieldErrors(errors);
    const firstBad = firstErrorField(errors);
    if (firstBad) {
      setShakeKey((k) => k + 1);
      setBanner({
        type: "error",
        title: "Please fix the highlighted fields",
        text: "Your message wasn't sent yet. Double-check the marked fields and try again.",
      });
      const el = form.querySelector<HTMLElement>(`[data-field="${firstBad}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPending(true);
    setBanner(null);

    let result: SendEmailResult;
    try {
      result = await sendEmail(raw);
    } catch (err) {
      result = {
        ok: false,
        delivered: false,
        needsManual: true,
        message:
          "Something unexpected happened on the way. No worries — I'll open your email app with the message pre-filled so you can just hit 'Send'!",
        fallback: {
          mailto: buildMailtoFallback(current),
          whatsapp: buildWhatsAppFallback(current),
          email: CONTACT_EMAIL,
        },
      };
    }

    setPending(false);

    if (result.fieldErrors) {
      setFieldErrors((prev) => ({
        name: result.fieldErrors?.name ?? prev.name,
        senderEmail: result.fieldErrors?.senderEmail ?? prev.senderEmail,
        message: result.fieldErrors?.message ?? prev.message,
        phone: result.fieldErrors?.phone ?? prev.phone,
      }));
      setBanner({ type: "error", text: result.message });
      setShakeKey((k) => k + 1);
      return;
    }

    if (result.ok && result.delivered) {
      setBanner({
        type: "success",
        title: "Message sent successfully! 🎉",
        text: result.message,
      });
      formRef.current?.reset();
      valuesRef.current = { name: "", senderEmail: "", message: "", phone: "" };
      setCooldownLeft(COOLDOWN_SEC);
      return;
    }

    if (result.ok && result.needsManual && result.fallback) {
      try {
        const mailto = result.fallback.mailto || buildMailtoFallback(current);
        const wa = result.fallback.whatsapp || buildWhatsAppFallback(current);
        window.setTimeout(() => {
          window.open(mailto, "_blank", "noopener,noreferrer");
        }, 120);
        setBanner({
          type: "info",
          title: "Opening your email app…",
          text: result.message,
          copyText: result.fallback.email,
          ctas: [
            { label: "Open Gmail", href: gmailComposeUrl(`Inquiry from ${current.name.trim() || "Visitor"}`), icon: Mail, external: true },
            { label: "Chat on WhatsApp", href: wa, icon: MessageCircle, external: true },
          ],
          debug: result.debug,
        });
      } catch {
        setBanner({
          type: "info",
          text: result.message,
          copyText: result.fallback?.email,
          debug: result.debug,
        });
      }
      setCooldownLeft(30);
      return;
    }

    setBanner({
      type: "error",
      title: "Couldn't send your message",
      text: result.message,
      copyText: CONTACT_EMAIL,
      ctas: [
        { label: "Open Mail App", href: buildMailtoFallback(current), icon: Mail, external: true },
        { label: "Chat on WhatsApp", href: buildWhatsAppFallback(current), icon: MessageCircle, external: true },
      ],
    });
    setShakeKey((k) => k + 1);
  }, [pending, cooldownLeft, buildMailtoFallback, buildWhatsAppFallback]);

  const submitDisabled = pending || cooldownLeft > 0;
  const submitLabel = useMemo(() => {
    if (pending) return <>Sending… <Loader2 className="animate-spin" size={18} /></>;
    if (cooldownLeft > 0) return `Please wait ${cooldownLeft}s`;
    return <>Send Message <Send className="opacity-70 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} /></>;
  }, [pending, cooldownLeft]);

  const bannerEmail = banner?.copyText ?? CONTACT_EMAIL;

  return (
    <section id="contact" className="py-20 relative z-[20]">
      <SectionHeading>Contact Me</SectionHeading>

      <div className="max-w-6xl mx-auto px-5 w-full mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
          {/* Left Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-4">
                Let&apos;s Connect
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                I&apos;m currently looking for new opportunities — my inbox is always open.
                Whether you have a question or just want to say hi, I&apos;ll try my best to get back to you!
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Email Card */}
              <a
                href={gmailComposeUrl("Portfolio Inquiry")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition-all group cursor-pointer"
                title={`Email ${profile.email}`}
              >
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 text-cyan-400 transition-all">
                  <Mail size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-400 text-sm mb-0.5">Email</h4>
                  <p className="text-white font-medium group-hover:text-cyan-400 transition-colors truncate">
                    {profile.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); void copyEmail(bannerEmail); }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-cyan-400 transition-all"
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copied ? <CheckCheck size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <ExternalLink size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 hidden sm:block" />
              </a>

              {/* WhatsApp Card */}
              {profile.whatsapp && (
                <a
                  href={profile.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all group cursor-pointer"
                  title="Chat on WhatsApp"
                >
                  <div className="p-3 rounded-full bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition-all">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-400 text-sm mb-0.5">WhatsApp</h4>
                    <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                      Usually replies within 24 hours
                    </p>
                  </div>
                  <ExternalLink size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                </a>
              )}

              {/* Social Links */}
              <div className="flex gap-4">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-105"
                    aria-label="GitHub"
                  >
                    <Github size={24} />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-gray-400 hover:text-[#0077b5] transition-all hover:scale-105"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={24} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            key={shakeKey}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            animate={shakeKey > 0 ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              noValidate
            >
              {/* Honeypot field — hidden from humans, bots fill it */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website (leave this empty)</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  onChange={() => {}}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2" data-field="name">
                  <label htmlFor="name" className="text-sm font-medium text-gray-400 ml-1">Name</label>
                  <div className="relative">
                    <User className={`absolute left-3 top-3.5 ${fieldErrors.name ? "text-red-400" : "text-gray-500"}`} size={18} />
                    <input
                      id="name"
                      className={`w-full h-12 pl-10 pr-4 rounded-lg border bg-black/20 text-white focus:outline-none transition-all placeholder:text-gray-600 ${
                        fieldErrors.name
                          ? "border-red-500/50 focus:border-red-500 focus:bg-red-950/20"
                          : "border-white/10 focus:border-cyan-500/50 focus:bg-black/40"
                      }`}
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      placeholder="John Doe"
                      autoComplete="name"
                      onChange={(e) => onFieldChange("name", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p id="name-error" className="flex items-start gap-1 text-xs text-red-400 ml-1">
                      <XCircle size={14} className="mt-0.5 shrink-0" /> {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2" data-field="phone">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-400 ml-1">Phone <span className="text-gray-600">(optional)</span></label>
                  <div className="relative">
                    <Smartphone className={`absolute left-3 top-3.5 ${fieldErrors.phone ? "text-red-400" : "text-gray-500"}`} size={18} />
                    <input
                      id="phone"
                      className={`w-full h-12 pl-10 pr-4 rounded-lg border bg-black/20 text-white focus:outline-none transition-all placeholder:text-gray-600 ${
                        fieldErrors.phone
                          ? "border-red-500/50 focus:border-red-500 focus:bg-red-950/20"
                          : "border-white/10 focus:border-cyan-500/50 focus:bg-black/40"
                      }`}
                      name="phone"
                      type="tel"
                      maxLength={20}
                      placeholder="+1 234…"
                      autoComplete="tel"
                      onChange={(e) => onFieldChange("phone", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p id="phone-error" className="flex items-start gap-1 text-xs text-red-400 ml-1">
                      <XCircle size={14} className="mt-0.5 shrink-0" /> {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2" data-field="senderEmail">
                <label htmlFor="senderEmail" className="text-sm font-medium text-gray-400 ml-1">Email</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3.5 ${fieldErrors.senderEmail ? "text-red-400" : "text-gray-500"}`} size={18} />
                  <input
                    id="senderEmail"
                    className={`w-full h-12 pl-10 pr-4 rounded-lg border bg-black/20 text-white focus:outline-none transition-all placeholder:text-gray-600 ${
                      fieldErrors.senderEmail
                        ? "border-red-500/50 focus:border-red-500 focus:bg-red-950/20"
                        : "border-white/10 focus:border-cyan-500/50 focus:bg-black/40"
                    }`}
                    name="senderEmail"
                    type="email"
                    required
                    maxLength={500}
                    placeholder="john@example.com"
                    autoComplete="email"
                    inputMode="email"
                    onChange={(e) => onFieldChange("senderEmail", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.senderEmail)}
                    aria-describedby={fieldErrors.senderEmail ? "senderEmail-error" : undefined}
                  />
                </div>
                {fieldErrors.senderEmail && (
                  <p id="senderEmail-error" className="flex items-start gap-1 text-xs text-red-400 ml-1">
                    <XCircle size={14} className="mt-0.5 shrink-0" /> {fieldErrors.senderEmail}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2" data-field="message">
                <label htmlFor="message" className="text-sm font-medium text-gray-400 ml-1">Message</label>
                <textarea
                  id="message"
                  className={`w-full h-32 p-4 rounded-lg border bg-black/20 text-white focus:outline-none transition-all placeholder:text-gray-600 resize-none ${
                    fieldErrors.message
                      ? "border-red-500/50 focus:border-red-500 focus:bg-red-950/20"
                      : "border-white/10 focus:border-cyan-500/50 focus:bg-black/40"
                  }`}
                  name="message"
                  placeholder="Tell me a bit about your project or say hi!"
                  required
                  maxLength={5000}
                  rows={5}
                  onChange={(e) => onFieldChange("message", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? "message-error" : undefined}
                />
                {fieldErrors.message && (
                  <p id="message-error" className="flex items-start gap-1 text-xs text-red-400 ml-1">
                    <XCircle size={14} className="mt-0.5 shrink-0" /> {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Status Banner */}
              {banner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative overflow-hidden rounded-xl p-4 text-sm font-medium border ${
                    banner.type === "success"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : banner.type === "error"
                      ? "bg-red-500/15 text-red-300 border-red-500/30"
                      : "bg-cyan-500/15 text-cyan-200 border-cyan-500/30"
                  }`}
                  role={banner.type === "error" ? "alert" : "status"}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {banner.type === "success" ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : banner.type === "error" ? (
                        <XCircle size={18} className="text-red-400" />
                      ) : (
                        <Mail size={18} className="text-cyan-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {banner.title && (
                        <div className="font-semibold mb-0.5">{banner.title}</div>
                      )}
                      <div className="leading-relaxed opacity-95">{banner.text}</div>
                      {banner.ctas && banner.ctas.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {banner.ctas.map((cta, i) => {
                            const Icon = cta.icon;
                            return (
                              <a
                                key={i}
                                href={cta.href}
                                target={cta.external ? "_blank" : undefined}
                                rel={cta.external ? "noopener noreferrer" : undefined}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold"
                              >
                                {Icon && <Icon size={14} />}
                                {cta.label}
                              </a>
                            );
                          })}
                        </div>
                      )}
                      {banner.copyText && (
                        <button
                          type="button"
                          onClick={() => void copyEmail(banner.copyText!)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs font-semibold"
                        >
                          {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          {copied ? "Copied!" : `Copy ${banner.copyText.slice(0, 32)}${banner.copyText.length > 32 ? "…" : ""}`}
                        </button>
                      )}
                      {banner.debug && (
                        <details className="mt-3 text-[11px] text-gray-400/90">
                          <summary className="cursor-pointer select-none text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1">
                            <span className="text-amber-300">⚙️</span> Debug info (for developer)
                          </summary>
                          <pre className="mt-2 p-2 rounded bg-black/40 border border-white/10 whitespace-pre-wrap break-all font-mono leading-relaxed text-amber-200/90">
{banner.debug}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitDisabled}
                className="group mt-2 flex items-center justify-center gap-2 h-12 w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
              >
                {submitLabel}
              </button>

              <p className="text-[11px] leading-relaxed text-gray-500 mt-1 text-center">
                Your details are safe. No spam — I read every message personally.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
