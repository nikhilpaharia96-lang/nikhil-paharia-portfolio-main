import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/static-motion";
import { toast } from "sonner";
import {
  Send, Mail, Phone, MapPin, Check,
  AlertCircle, ChevronDown, Clock, ShieldCheck, User, PenLine, ArrowRight,
  Lock, Sparkles, Wallet, ListChecks,
} from "lucide-react";
import {
  RiGithubFill, RiLinkedinFill, RiInstagramLine, RiYoutubeFill, RiWhatsappFill,
} from "react-icons/ri";
import Magnetic from "@/components/ui/Magnetic";
import { staggerContainer, cinChildSmall } from "@/lib/revealVariants";
import connectBg from "@/assets/images/showcase-bg.webp";

const ease = [0.16, 1, 0.3, 1] as const;

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
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25   peer
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
          <Icon className={`w-[18px] h-[18px]   ${error ? "text-red-400" : focused ? "text-primary" : "text-slate-400"}`} />
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

        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary to-sky-400 origin-left"
      />

      {/* Inline error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"

            animate={{ opacity: 1, y: 0, height: "auto" }}

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
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25   peer cursor-pointer
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
          <Icon className={`w-[18px] h-[18px]   ${error ? "text-red-400" : focused ? "text-primary" : "text-slate-400"}`} />
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

        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.div>

      {/* Animated bottom accent line */}
      <motion.div
        animate={{ scaleX: focused && !error ? 1 : 0, opacity: focused && !error ? 1 : 0 }}

        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary to-sky-400 origin-left"
      />

      {/* Inline error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"

            animate={{ opacity: 1, y: 0, height: "auto" }}

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
  "Website Development",
  "Video Editing",
  "Digital Marketing",
  "Graphic Designing",
  "UI/UX Design",
  "Automation & AI Solutions",
  "E-Commerce Solutions",
  "Cinematography & Video Production",
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
];

/* TODO: replace with real profile URLs — icon is hidden automatically until a real link is added */
const socials = [
  { Icon: RiGithubFill,    href: "https://github.com/nikhilpaharia96-lang", label: "GitHub"    },
  { Icon: RiLinkedinFill,  href: "", label: "LinkedIn"  }, // TODO: add LinkedIn URL
  { Icon: RiInstagramLine, href: "", label: "Instagram" }, // TODO: add Instagram URL
  { Icon: RiYoutubeFill,   href: "", label: "YouTube"   }, // TODO: add YouTube URL
  { Icon: RiWhatsappFill,  href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp" },
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

  // "Book Now" on a service card pre-selects that service here.
  useEffect(() => {
    const onBook = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      if (SUBJECT_OPTIONS.includes(title)) {
        setForm((f) => ({ ...f, subject: title }));
        setErrors((er) => ({ ...er, subject: undefined }));
      }
    };
    window.addEventListener("book-service", onBook);
    return () => window.removeEventListener("book-service", onBook);
  }, []);

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

        className="absolute top-10 right-[8%] w-56 h-56 rounded-full bg-sky-300/20 blur-3xl pointer-events-none z-0"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 20, 0], x: [0, -16, 0] }}

        className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none z-0"
      />

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">

          {/* Left — title + contact info + socials */}
          <div className="w-full relative">
            <motion.div

              whileInView={{ opacity: 1, x: 0 }}


            >
              {/* Mountain sky backdrop — fades softly into the page */}
              <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -top-10 h-[34rem] sm:h-[36rem] -z-10 overflow-hidden rounded-[2rem] [mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)]">
                <img src={connectBg} alt="" className="w-full h-full object-cover object-left opacity-90" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/65 to-white/85" />
                {/* tiny birds */}
                <svg viewBox="0 0 60 30" className="absolute right-6 top-24 w-14 text-[#0f2a5c]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M4 12c4-5 8-5 11 0 3-5 7-5 11 0" />
                  <path d="M34 22c3-4 6-4 8.5 0 2.5-4 5.5-4 8.5 0" />
                </svg>
              </div>

              {/* Eyebrow — red dot pill */}
              <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_8px_24px_-12px_rgba(15,45,90,0.25)]">
                <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase text-slate-800">Let's Connect</span>
              </div>

              <div className="relative">
                {/* Handwritten note + curved arrow */}
                <div aria-hidden="true" className="hidden sm:block absolute -left-4 lg:-left-20 top-6 font-script font-bold text-xl leading-[1.15] text-[#14284f] -rotate-[10deg] select-none">
                  Creative<br />Ideas<br />Collaboration
                  <svg viewBox="0 0 70 60" className="mt-1 ml-6 w-14 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4C10 30 28 46 58 50" />
                    <path d="M48 42l11 8-12 6" />
                  </svg>
                </div>

                <h2 className="font-sans font-extrabold tracking-tight text-[2.9rem] sm:text-6xl lg:text-[4.2rem] leading-[0.98] text-[#0a0f1e] mb-7 sm:pl-14 lg:pl-0">
                  Let's Build
                  <br />
                  Something
                  <br />
                  <span className="relative inline-block font-script font-bold italic text-primary text-[1.18em] leading-none -rotate-3 align-baseline my-1">
                    Amazing
                    <svg aria-hidden="true" className="absolute left-0 -bottom-2 w-full h-3 text-primary" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none">
                      <path d="M3 8 C 40 2, 110 2, 197 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <br />
                  Together.
                </h2>
              </div>

              <p className="text-base sm:text-[1.05rem] text-slate-700 mb-10 max-w-md leading-relaxed">
                Have a project in mind or just want to say hi? Tell me what you're building and I'll get back to you as soon as possible.
              </p>

              {/* Contact info cards */}
              <motion.div
                variants={staggerContainer}

                whileInView="show"

                className="flex flex-col gap-3 mb-10 max-w-md"
              >
                {contactInfo.map(({ Icon, label, value, href }) => {
                  const Wrapper = href ? motion.a : motion.div;
                  const isExternal = href?.startsWith("http");
                  return (
                    <Wrapper
                      key={label}
                      {...(href ? { href } : {})}
                      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                      variants={cinChildSmall}

                      className={`interactive group flex items-center gap-4 p-3.5 rounded-xl border border-blue-100/70 bg-white/50 backdrop-blur-sm    min-h-[48px] ${href ? "hover:bg-white/80 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(29,111,235,0.15)]" : ""}`}
                    >
                      <motion.div


                        className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center "
                      >
                        <Icon className="w-[18px] h-[18px] text-primary" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className="text-sm text-foreground font-semibold truncate">{value}</p>
                      </div>
                      {href && (
                        <div
                          aria-hidden="true"
                          className="shrink-0 text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100  group-hover:text-primary  "
                        >
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Wrapper>
                  );
                })}
              </motion.div>

              {/* Social icons — circular glass buttons */}
              <motion.div
                variants={staggerContainer}

                whileInView="show"

                className="flex gap-4 flex-wrap"
              >
                {socials.map(({ Icon, href, label }) => (
                  <Magnetic key={label} range={40} strength={0.35} scaleHover={1.12}>
                    <motion.a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer" : undefined}
                      aria-label={label}
                      variants={cinChildSmall}


                      className="interactive w-11 h-11 rounded-full flex items-center justify-center border border-blue-100/70 bg-white/50 backdrop-blur-md hover:bg-white/80 hover:border-primary/40  text-slate-700 hover:text-primary"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  </Magnetic>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div

            whileInView={{ opacity: 1, y: 0 }}


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



                  className={`w-full py-4 font-bold rounded-xl  flex items-center justify-center gap-3 disabled:opacity-80 mt-2 relative overflow-hidden text-white shadow-lg shadow-blue-200/60 ${sent ? "bg-green-500" : "bg-gradient-to-r from-primary to-sky-500"}`}
                >
                  {/* Shine sweep on hover */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"


                  />
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="spinner"

                        animate={{ opacity: 1, scale: 1 }}

                        role="status"
                        aria-label="Sending message"
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full "
                      />
                    ) : sent ? (
                      <motion.span
                        key="sent"

                        animate={{ opacity: 1, scale: 1 }}

                        className="flex items-center gap-2"
                      >
                        Sent <Check className="w-5 h-5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="label"

                        animate={{ opacity: 1, y: 0 }}

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

              {/* Trust badges — single horizontal row, no wrap */}
              <div className="flex items-start justify-between gap-2 pt-1">
                {trustBadges.map(({ Icon, line1, line2 }) => (
                  <div key={line1} className="flex flex-col items-center text-center gap-1.5 flex-1 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-slate-600 leading-tight">
                      <span className="block font-semibold text-slate-700">{line1}</span>
                      {line2}
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
