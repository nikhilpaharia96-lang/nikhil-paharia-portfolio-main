import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Github, Linkedin, Instagram, Youtube, Send, Mail, Phone, MapPin, Check,
  AlertCircle, ChevronDown, Clock, ShieldCheck, User, PenLine, ArrowRight,
  Lock, Sparkles, MessageCircle, Wallet, ListChecks,
} from "lucide-react";
import Magnetic from "@/components/ui/Magnetic";
import SplitText from "@/components/ui/SplitText";

/* ── Floating label input wrapper ─────────────────────── */
interface FloatInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

function FloatField({ id, name, label, type = "text", required, multiline, rows = 5, error, value, onValueChange, icon: Icon, autoComplete, inputMode }: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!value && value.length > 0;
  const lifted = focused || hasValue;
  const hasIcon = !!Icon;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onValueChange?.(e.target.value);
  };

  const sharedClass = `
    w-full bg-white/70 border rounded-xl pt-6 pb-3 ${hasIcon ? "pl-11 pr-4" : "px-4"} text-foreground resize-none
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 transition-all duration-300 peer
    ${error
      ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
      : focused
      ? "border-primary shadow-[0_0_0_3px_rgba(29,111,235,0.13)]"
      : "border-slate-200 hover:border-slate-300"
    }
  `;

  return (
    <div className="relative">
      {/* Leading icon */}
      {Icon && (
        <div className={`absolute left-4 ${multiline ? "top-4" : "top-1/2 -translate-y-1/2"} pointer-events-none z-10`}>
          <Icon className={`w-[18px] h-[18px] transition-colors duration-300 ${error ? "text-red-400" : focused ? "text-primary" : "text-slate-400"}`} />
        </div>
      )}

      {/* Floating label */}
      <motion.label
        htmlFor={id}
        animate={{
          y: lifted ? -10 : 0,
          scale: lifted ? 0.78 : 1,
          x: hasIcon && !lifted ? 4 : 0,
          color: error ? "#ef4444" : lifted ? "#1d6feb" : "#94a3b8",
        }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute ${hasIcon ? "left-11" : "left-4"} top-4 origin-left pointer-events-none font-medium text-sm z-10`}
      >
        {label}{required && <span className="text-primary/70"> *</span>}
      </motion.label>

      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          value={value}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${sharedClass} text-base`}
          autoComplete={autoComplete}
          enterKeyHint="send"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${sharedClass} text-base`}
          autoComplete={autoComplete}
          inputMode={inputMode}
          enterKeyHint="next"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
        />
      )}

      {/* Animated bottom accent line */}
      <motion.div
        animate={{ scaleX: focused && !error ? 1 : 0, opacity: focused && !error ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary to-sky-400 origin-left"
      />

      {/* Inline error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1.5 pl-1"
          >
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Floating label SELECT wrapper — same shell/spacing/shadows as FloatField ── */
interface FloatSelectProps {
  id: string;
  name: string;
  label: string;
  options: string[];
  required?: boolean;
  error?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}

function FloatSelect({ id, name, label, options, required, error, value, onValueChange, icon: Icon }: FloatSelectProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!value && value.length > 0;
  const lifted = focused || hasValue;
  const hasIcon = !!Icon;

  const sharedClass = `
    w-full appearance-none bg-white/70 dark:bg-white/10 border rounded-xl pt-6 pb-3 ${hasIcon ? "pl-11" : "pl-4"} pr-11
    text-foreground dark:text-white
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 transition-all duration-300 peer cursor-pointer
    ${error
      ? "border-red-400 dark:border-red-400/70 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
      : focused
      ? "border-primary shadow-[0_0_0_3px_rgba(29,111,235,0.13)]"
      : "border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/25"
    }
  `;

  return (
    <div className="relative">
      {/* Leading icon */}
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className={`w-[18px] h-[18px] transition-colors duration-300 ${error ? "text-red-400" : focused ? "text-primary" : "text-slate-400"}`} />
        </div>
      )}

      {/* Floating label */}
      <motion.label
        htmlFor={id}
        animate={{
          y: lifted ? -10 : 0,
          scale: lifted ? 0.78 : 1,
          x: hasIcon && !lifted ? 4 : 0,
          color: error ? "#ef4444" : lifted ? "#1d6feb" : "#94a3b8",
        }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute ${hasIcon ? "left-11" : "left-4"} top-4 origin-left pointer-events-none font-medium text-sm z-10`}
      >
        {label}{required && <span className="text-primary/70"> *</span>}
      </motion.label>

      <select
        id={id}
        name={name}
        required={required}
        value={value}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={sharedClass}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        <option value="" disabled hidden></option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-foreground bg-white dark:bg-slate-800">
            {opt}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <motion.div
        animate={{ rotate: focused ? 180 : 0, color: error ? "#ef4444" : focused ? "#1d6feb" : "#94a3b8" }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.div>

      {/* Animated bottom accent line */}
      <motion.div
        animate={{ scaleX: focused && !error ? 1 : 0, opacity: focused && !error ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary to-sky-400 origin-left"
      />

      {/* Inline error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1.5 pl-1"
          >
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const SUBJECT_OPTIONS = [
  "Full-Stack Web Development",
  "Landing Page",
  "Web Design",
  "Admin Dashboard",
  "Video Editing",
  "Social Media Content",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under ₹5,000",
  "₹5,000 – ₹15,000",
  "₹15,000 – ₹30,000",
  "₹30,000+",
  "Let's Discuss",
];

/* Real, verified contact details only — edit these directly to update everywhere */
const WHATSAPP_NUMBER = "919395722454"; // no "+", no spaces — required for wa.me links
const PHONE_DISPLAY = "+91 93957 22454";

const contactInfo = [
  { Icon: Mail,  label: "Email",    value: "nikhilpaharia96@gmail.com", href: "mailto:nikhilpaharia96@gmail.com" },
  { Icon: Phone, label: "Phone / WhatsApp", value: PHONE_DISPLAY, href: `https://wa.me/${WHATSAPP_NUMBER}` },
  { Icon: MapPin,label: "Location", value: "Assam, India",              href: undefined },
  { Icon: Clock, label: "Availability", value: "Open for new opportunities", href: undefined },
];

/* TODO: replace with real profile URLs — icon is hidden automatically until a real link is added */
const socials = [
  { Icon: Github,        href: "https://github.com/nikhilpaharia96-lang", label: "GitHub"    },
  { Icon: Linkedin,      href: "", label: "LinkedIn"  }, // TODO: add LinkedIn URL
  { Icon: Instagram,     href: "", label: "Instagram" }, // TODO: add Instagram URL
  { Icon: Youtube,       href: "", label: "YouTube"   }, // TODO: add YouTube URL
  { Icon: MessageCircle, href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp" },
].filter((s) => s.href);

const trustBadges = [
  { Icon: Clock,       line1: "Quick Response",    line2: "Usually within 24–48 hours" },
  { Icon: ShieldCheck, line1: "100% Confidential", line2: "Your details stay private" },
  { Icon: Sparkles,    line1: "Free Consultation", line2: "Let's discuss your idea" },
];

type FormState = { name: string; email: string; phone: string; subject: string; budget: string; message: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

/* Formspree endpoint for the contact form */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgodegyo";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", subject: "", budget: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const setField = (key: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!form.email.trim()) next.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (form.phone.trim() && !/^\+?[0-9](?:[0-9\s-]{5,18})[0-9]$/.test(form.phone.trim()))
      next.phone = "Enter a valid phone number, e.g. +1 555 123 4567";
    if (!form.subject.trim()) next.subject = "Please select what you need";
    if (!form.message.trim()) next.message = "Please write a short message";
    else if (form.message.trim().length < 10) next.message = "Message should be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          budget: form.budget,
          message: form.message,
        }),
      });

      if (!response.ok) {
        // Formspree returns a JSON body with field-level errors on failure
        const data = await response.json().catch(() => null);
        const message = data?.errors?.map((err: { message: string }) => err.message).join(", ");
        throw new Error(message || "Something went wrong while sending your message.");
      }

      setSent(true);
      toast.success("Message sent successfully!", {
        description: "I'll get back to you as soon as possible.",
      });
      formRef.current?.reset();
      setForm({ name: "", email: "", phone: "", subject: "", budget: "", message: "" });
      setTimeout(() => setSent(false), 2600);
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Please check your connection and try again.";
      toast.error("Couldn't send your message", { description });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden bg-transparent section-wrap max-w-full">
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent -z-10" />
      <div className="absolute -left-20 top-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating blurred background elements — soft blue glow, premium depth */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -22, 0], x: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-[8%] w-56 h-56 rounded-full bg-sky-300/20 blur-3xl pointer-events-none z-0"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 20, 0], x: [0, -16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none z-0"
      />

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">

          {/* Left — title + contact info + socials */}
          <div className="w-full relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-primary/20 shadow-[0_2px_12px_rgba(29,111,235,0.08)]">
                <Send className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-[0.14em] uppercase">Let's Connect</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-[1.1] text-foreground max-w-full">
                <SplitText type="words">Let's Build Something</SplitText>
                <br />
                <span className="relative inline-block">
                  <SplitText type="words" delay={0.15} charClassName="text-gradient">Amazing</SplitText>
                  {/* Hand-drawn brush-stroke underline accent */}
                  <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 180 14"
                    className="absolute left-0 -bottom-2 w-full h-3 text-primary/70"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
                  >
                    <path
                      d="M2 10.5C40 4 90 2 130 6C150 8 165 6 178 4"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </motion.svg>
                </span>{" "}
                <SplitText type="words" delay={0.22}>Together.</SplitText>
              </h2>
              <p className="text-xl text-slate-600 mb-10 font-light max-w-lg leading-relaxed">
                Have a project in mind or just want to say hi? Tell me what you're building and I'll get back to you as soon as possible.
              </p>

              {/* Contact info cards */}
              <div className="flex flex-col gap-3 mb-10 max-w-md">
                {contactInfo.map(({ Icon, label, value, href }, i) => {
                  const Wrapper = href ? motion.a : motion.div;
                  const isExternal = href?.startsWith("http");
                  return (
                    <Wrapper
                      key={label}
                      {...(href ? { href } : {})}
                      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      whileHover={href ? { y: -4, scale: 1.015 } : undefined}
                      className={`interactive group flex items-center gap-4 p-3.5 rounded-xl border border-blue-100/70 bg-white/50 backdrop-blur-sm transition-colors transition-shadow duration-300 min-h-[48px] ${href ? "hover:bg-white/80 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(29,111,235,0.15)]" : ""}`}
                    >
                      <motion.div
                        whileHover={{ rotate: -8, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors"
                      >
                        {label === "Availability" ? (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                          </span>
                        ) : (
                          <Icon className="w-[18px] h-[18px] text-primary" />
                        )}
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className="text-sm text-foreground font-semibold truncate">{value}</p>
                      </div>
                      {href && (
                        <div
                          aria-hidden="true"
                          className="shrink-0 text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Wrapper>
                  );
                })}
              </div>

              {/* Social icons — circular glass buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-400 tracking-[0.14em] uppercase mb-3">Connect With Me</p>
                <div className="flex gap-4 flex-wrap">
                  {socials.map(({ Icon, href, label }) => (
                    <Magnetic key={label} range={40} strength={0.35} scaleHover={1.12}>
                      <motion.a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noreferrer" : undefined}
                        aria-label={label}
                        whileHover={{ y: -3, boxShadow: "0 10px 24px rgba(29,111,235,0.18)" }}
                        whileTap={{ scale: 0.9 }}
                        className="interactive w-12 h-12 rounded-full flex items-center justify-center border border-blue-100/70 bg-white/50 backdrop-blur-md hover:bg-white/80 hover:border-primary/40 transition-colors text-slate-700 hover:text-primary"
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    </Magnetic>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-full relative"
          >
            {/* Soft blue glow behind the glass card */}
            <div aria-hidden="true" className="absolute -inset-4 bg-gradient-to-br from-primary/15 via-sky-300/10 to-transparent rounded-[32px] blur-2xl -z-10" />

            <form
              ref={formRef}
              action={FORMSPREE_ENDPOINT}
              method="POST"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
              className="glass-premium p-5 sm:p-8 md:p-12 flex flex-col gap-5 sm:gap-6 relative"
            >
              {/* Form header — paper-plane icon + title + subtitle */}
              <div className="mb-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    whileHover={{ rotate: -12, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-sky-400/15 flex items-center justify-center shadow-inner"
                    aria-hidden="true"
                  >
                    <Send className="w-5 h-5 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Send Me a Message</h3>
                </div>
                <p className="text-sm text-slate-500 font-light pl-[3.5rem] -mt-1">
                  Tell me about your project and I'll get back to you.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                <FloatField id="contact-name"    name="name"    label="Your Name"     required value={form.name}    onValueChange={setField("name")}    error={errors.name} icon={User} autoComplete="name" />
                <FloatField id="contact-email"   name="email"   label="Email Address" type="email" required value={form.email}   onValueChange={setField("email")}   error={errors.email} icon={Mail} autoComplete="email" inputMode="email" />
              </div>
              <FloatField id="contact-phone" name="phone" label="WhatsApp / Phone Number" type="tel" value={form.phone} onValueChange={setField("phone")} error={errors.phone} icon={Phone} autoComplete="tel" inputMode="tel" />
              <FloatSelect id="contact-subject" name="subject" label="What do you need?" options={SUBJECT_OPTIONS} required value={form.subject} onValueChange={setField("subject")} error={errors.subject} icon={ListChecks} />
              <FloatSelect id="contact-budget"  name="budget"  label="Budget (Optional)" options={BUDGET_OPTIONS}  value={form.budget}  onValueChange={setField("budget")}  error={errors.budget} icon={Wallet} />
              <FloatField id="contact-message"   name="message" label="Tell me about your project" multiline rows={5} required value={form.message} onValueChange={setField("message")} error={errors.message} icon={PenLine} autoComplete="off" />

              {/* Magnetic submit button */}
              <Magnetic range={80} strength={0.3} scaleHover={1.02}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ boxShadow: "0 0 40px rgba(29,111,235,0.5)", y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-80 mt-2 relative overflow-hidden text-white shadow-lg shadow-blue-200/60 ${sent ? "bg-green-500" : "bg-gradient-to-r from-primary to-sky-500"}`}
                >
                  {/* Shine sweep on hover */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    whileHover={{ translateX: "200%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="spinner"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        role="status"
                        aria-label="Sending message"
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      />
                    ) : sent ? (
                      <motion.span
                        key="sent"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        Sent <Check className="w-5 h-5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-3"
                      >
                        <Send className="w-5 h-5" /> Send Message
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Magnetic>

              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 -mt-1">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Your information stays private and is never shared.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-1">
                {trustBadges.map(({ Icon, line1, line2 }) => (
                  <div key={line1} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 shrink-0 rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-tight">
                      {line1}<br />{line2}
                    </p>
                  </div>
                ))}
              </div>
            </form>
          </motion.div>
        </div>

        {/* Final CTA — premium card connecting Contact to the rest of the portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7 }}
          className="glass-premium mt-14 sm:mt-20 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 relative overflow-hidden"
        >
          {/* Soft ambient glow */}
          <div aria-hidden="true" className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center md:text-left max-w-md">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 leading-tight">
              Let's build your next{" "}
              <span className="relative inline-block">
                <span className="text-gradient">big idea.</span>
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 140 12"
                  className="absolute left-0 -bottom-1.5 w-full h-2.5 text-primary/60"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                >
                  <path d="M2 9C30 3 70 2 100 5C112 6.5 125 5 138 3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </motion.svg>
              </span>
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-light leading-relaxed">
              From full-stack web apps to cinematic video and brand design — I'm here to turn your vision into reality.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Magnetic range={60} strength={0.25} scaleHover={1.03}>
              <motion.a
                href="#projects"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="interactive w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-sky-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200/60 hover:shadow-[0_0_32px_rgba(29,111,235,0.4)] transition-shadow"
              >
                View My Work <ArrowRight className="w-4 h-4" />
              </motion.a>
            </Magnetic>
            <motion.a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="interactive w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-white/80 backdrop-blur border border-blue-200 text-primary font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
