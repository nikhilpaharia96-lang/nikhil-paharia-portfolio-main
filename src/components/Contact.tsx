import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  RiGithubFill, RiLinkedinFill, RiInstagramLine, RiYoutubeFill, RiSendPlaneFill,
  RiMailFill, RiPhoneFill, RiMapPinFill, RiCheckLine, RiErrorWarningLine, RiArrowDownSLine,
  RiSendPlane2Fill, RiShieldCheckLine, RiUser3Line, RiMailLine, RiPhoneLine,
  RiEditLine, RiArrowRightSLine, RiLockLine, RiMedalLine,
} from "react-icons/ri";
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
          <Icon className={`text-lg transition-colors duration-300 ${error ? "text-red-400" : focused ? "text-primary" : "text-slate-400"}`} />
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
            <RiErrorWarningLine className="text-sm shrink-0" /> {error}
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
}

function FloatSelect({ id, name, label, options, required, error, value, onValueChange }: FloatSelectProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!value && value.length > 0;
  const lifted = focused || hasValue;

  const sharedClass = `
    w-full appearance-none bg-white/70 dark:bg-white/10 border rounded-xl pt-6 pb-3 pl-4 pr-11
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
      {/* Floating label */}
      <motion.label
        htmlFor={id}
        animate={{
          y: lifted ? -10 : 0,
          scale: lifted ? 0.78 : 1,
          color: error ? "#ef4444" : lifted ? "#1d6feb" : "#94a3b8",
        }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="absolute left-4 top-4 origin-left pointer-events-none font-medium text-sm z-10"
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
        <RiArrowDownSLine className="text-xl" />
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
            <RiErrorWarningLine className="text-sm shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const SUBJECT_OPTIONS = [
  "Project Inquiry",
  "Website Development",
  "Web App Development",
  "Mobile App Development",
  "UI/UX Design",
  "Portfolio Website",
  "AI Integration",
  "Freelance Work",
  "Collaboration",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under $100",
  "$100 – $250",
  "$250 – $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Let's Discuss",
];

const contactInfo = [
  { Icon: RiMailFill,  label: "Email",    value: "nikhilpaharia96@gmail.com", href: "mailto:nikhilpaharia96@gmail.com" },
  { Icon: RiPhoneFill, label: "Phone",    value: "+91 94010 58667",           href: "tel:+919401058667" },
  { Icon: RiMapPinFill,label: "Location", value: "Northh East India, Assam",              href: https://maps.app.goo.gl/hoBbde9u99uG69P18?g_st=ac },
];

const socials = [
  { Icon: RiGithubFill,    href: "https://github.com/nikhilpaharia96-lang", label: "GitHub"    },
  { Icon: RiLinkedinFill,  href: "#", label: "LinkedIn"  },
  { Icon: RiInstagramLine, href: "#", label: "Instagram" },
  { Icon: RiYoutubeFill,   href: "#", label: "YouTube"   },
];

const trustBadges = [
  { Icon: RiShieldCheckLine, line1: "Response within",   line2: "24 Hours" },
  { Icon: RiLockLine,        line1: "100% Confidential", line2: "& Secure" },
  { Icon: RiMedalLine,       line1: "Free Project",      line2: "Consultation" },
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
    if (!form.subject.trim()) next.subject = "Please select a subject";
    if (!form.budget.trim()) next.budget = "Please select your budget";
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
        description: "I'll get back to you within 24 hours.",
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
              {/* Availability badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-green-200/70 shadow-[0_2px_12px_rgba(16,185,129,0.12)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-semibold text-green-700 tracking-wide">Available for new projects</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-[1.1] text-foreground max-w-full">
                <SplitText type="words">Let's Build Something</SplitText>
                <br />
                <span className="text-gradient">
                  <SplitText type="words" delay={0.15}>Amazing Together</SplitText>
                </span>
              </h2>
              <p className="text-xl text-slate-600 mb-10 font-light max-w-lg leading-relaxed">
                From full-stack web apps to cinematic video and brand design — tell me about your project and let's turn it into something exceptional.
              </p>

              {/* Contact info cards */}
              <div className="flex flex-col gap-3 mb-10 max-w-md">
                {contactInfo.map(({ Icon, label, value, href }, i) => {
                  const Wrapper = href ? motion.a : motion.div;
                  return (
                    <Wrapper
                      key={label}
                      {...(href ? { href } : {})}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      whileHover={{ y: -4, scale: 1.015 }}
                      className="interactive group flex items-center gap-4 p-3.5 rounded-xl border border-blue-100/70 bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(29,111,235,0.15)] transition-colors transition-shadow duration-300"
                    >
                      <motion.div
                        whileHover={{ rotate: -8, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors"
                      >
                        <Icon className="text-primary text-lg" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className="text-sm text-foreground font-semibold truncate">{value}</p>
                      </div>
                      <div
                        aria-hidden="true"
                        className="shrink-0 text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300"
                      >
                        <RiArrowRightSLine className="text-xl" />
                      </div>
                    </Wrapper>
                  );
                })}
              </div>

              {/* Social icons — circular glass buttons */}
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
                      className="interactive w-11 h-11 rounded-full flex items-center justify-center border border-blue-100/70 bg-white/50 backdrop-blur-md hover:bg-white/80 hover:border-primary/40 transition-colors text-slate-700 hover:text-primary"
                    >
                      <Icon className="text-2xl" />
                    </motion.a>
                  </Magnetic>
                ))}
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
              className="glass-premium p-5 sm:p-8 md:p-12 flex flex-col gap-6 relative"
            >
              {/* Form header — paper-plane icon + title + subtitle */}
              <div className="mb-2">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    whileHover={{ rotate: -12, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-sky-400/15 flex items-center justify-center shadow-inner"
                    aria-hidden="true"
                  >
                    <RiSendPlane2Fill className="text-primary text-xl" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Send Me a Message</h3>
                </div>
                <p className="text-sm text-slate-500 font-light pl-[3.5rem] -mt-1">
                  Fill out the form and I'll get back to you within 24 hours.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <FloatField id="contact-name"    name="name"    label="Full Name"     required value={form.name}    onValueChange={setField("name")}    error={errors.name} icon={RiUser3Line} autoComplete="name" />
                <FloatField id="contact-email"   name="email"   label="Email Address" type="email" required value={form.email}   onValueChange={setField("email")}   error={errors.email} icon={RiMailLine} autoComplete="email" inputMode="email" />
              </div>
              <FloatField id="contact-phone" name="phone" label="Your Phone Number" type="tel" value={form.phone} onValueChange={setField("phone")} error={errors.phone} icon={RiPhoneLine} autoComplete="tel" inputMode="tel" />
              <div className="grid sm:grid-cols-2 gap-6">
                <FloatSelect id="contact-subject" name="subject" label="Select a Subject" options={SUBJECT_OPTIONS} required value={form.subject} onValueChange={setField("subject")} error={errors.subject} />
                <FloatSelect id="contact-budget"  name="budget"  label="Select Your Budget" options={BUDGET_OPTIONS}  required value={form.budget}  onValueChange={setField("budget")}  error={errors.budget} />
              </div>
              <FloatField id="contact-message"   name="message" label="Message"       multiline rows={5} required value={form.message} onValueChange={setField("message")} error={errors.message} icon={RiEditLine} autoComplete="off" />

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
                        Sent <RiCheckLine className="text-xl" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-3"
                      >
                        <RiSendPlaneFill className="text-xl" /> Send Message
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Magnetic>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-1">
                {trustBadges.map(({ Icon, line1, line2 }) => (
                  <div key={line1} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 shrink-0 rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center">
                      <Icon className="text-primary text-base" aria-hidden="true" />
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
      </div>
    </section>
  );
}
