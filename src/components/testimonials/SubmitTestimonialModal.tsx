import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, Upload, CheckCircle2, AlertCircle, Loader2, User } from "lucide-react";
import { submitTestimonial } from "@/lib/submitTestimonial";
import { lockBodyScroll } from "@/lib/scrollLock";
import type { TestimonialSubmission } from "@/types/testimonial";

type SubmitTestimonialModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  company: string;
  role: string;
  rating: number;
  content: string;
  projectName: string;
  website: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  company: "",
  role: "",
  rating: 5,
  content: "",
  projectName: "",
  website: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB — keeps the payload light

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!form.company.trim()) errors.company = "Please enter your company or brand.";
  if (!form.role.trim()) errors.role = "Please enter your role or position.";
  if (!form.content.trim() || form.content.trim().length < 20) {
    errors.content = "Please share a few sentences (at least 20 characters).";
  }
  if (form.website.trim()) {
    try {
      // Allow bare domains like "example.com" by prefixing a scheme if missing.
      const candidate = /^https?:\/\//i.test(form.website.trim())
        ? form.website.trim()
        : `https://${form.website.trim()}`;
      new URL(candidate);
    } catch {
      errors.website = "That doesn't look like a valid link.";
    }
  }
  return errors;
}

export default function SubmitTestimonialModal({ open, onClose }: SubmitTestimonialModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState("");
  const [submitMethod, setSubmitMethod] = useState<"endpoint" | "email" | null>(null);

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Reset to a clean form each time the modal is opened fresh.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setStatus("idle");
      setErrorMessage("");
      setPhotoDataUrl(undefined);
      setPhotoError("");
      setSubmitMethod(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const unlock = lockBodyScroll();
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      clearTimeout(t);
    };
  }, [open, onClose]);

  const field = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Image is too large — please use one under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("submitting");
    setErrorMessage("");
    try {
      const payload: TestimonialSubmission = {
        name: form.name.trim(),
        company: form.company.trim(),
        role: form.role.trim(),
        rating: form.rating,
        content: form.content.trim(),
        projectName: form.projectName.trim() || undefined,
        website: form.website.trim() || undefined,
        photoDataUrl,
        submittedAt: new Date().toISOString(),
      };
      const result = await submitTestimonial(payload);
      setSubmitMethod(result.method);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-testimonial-heading"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_40px_90px_-24px_rgba(15,45,90,0.4)]"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="interactive absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/70 backdrop-blur flex items-center justify-center text-slate-500 hover:text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="p-6 sm:p-8">
              {status === "success" ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-foreground mb-2">Thank you!</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    {submitMethod === "email"
                      ? "Your email app should have opened with your testimonial pre-filled — just hit send and I'll review it shortly."
                      : "Your testimonial has been submitted for review. I'll take a look and add it soon."}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="interactive mt-6 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 id="submit-testimonial-heading" className="font-serif font-bold text-xl sm:text-2xl text-foreground mb-1.5">
                    Share your experience
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Worked with me on a project? I'd love to hear how it went — submissions are reviewed before appearing on the site.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="tf-name" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Full name
                        </label>
                        <input
                          ref={firstFieldRef}
                          id="tf-name"
                          type="text"
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "tf-name-error" : undefined}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                            errors.name ? "border-red-400" : "border-slate-200"
                          }`}
                          {...field("name")}
                        />
                        {errors.name && (
                          <p id="tf-name-error" className="text-xs text-red-500 mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="tf-company" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Company / brand
                        </label>
                        <input
                          id="tf-company"
                          type="text"
                          aria-invalid={!!errors.company}
                          aria-describedby={errors.company ? "tf-company-error" : undefined}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                            errors.company ? "border-red-400" : "border-slate-200"
                          }`}
                          {...field("company")}
                        />
                        {errors.company && (
                          <p id="tf-company-error" className="text-xs text-red-500 mt-1">
                            {errors.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tf-role" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Role / position
                      </label>
                      <input
                        id="tf-role"
                        type="text"
                        aria-invalid={!!errors.role}
                        aria-describedby={errors.role ? "tf-role-error" : undefined}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          errors.role ? "border-red-400" : "border-slate-200"
                        }`}
                        placeholder="e.g. Founder, Marketing Head"
                        {...field("role")}
                      />
                      {errors.role && (
                        <p id="tf-role-error" className="text-xs text-red-500 mt-1">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-slate-600 mb-1.5">Profile photo or logo (optional)</span>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {photoDataUrl ? (
                            <img src={photoDataUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" aria-hidden="true" />
                          )}
                        </div>
                        <label className="interactive inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                          {photoDataUrl ? "Change image" : "Upload image"}
                          <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
                        </label>
                      </div>
                      {photoError && <p className="text-xs text-red-500 mt-1.5">{photoError}</p>}
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-slate-600 mb-1.5">Rating</span>
                      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating out of 5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const value = i + 1;
                          const filled = value <= form.rating;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={form.rating === value}
                              aria-label={`${value} star${value > 1 ? "s" : ""}`}
                              onClick={() => setForm((f) => ({ ...f, rating: value }))}
                              className="interactive p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  filled ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="ml-2 text-sm font-semibold text-foreground">{form.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tf-content" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Your experience
                      </label>
                      <textarea
                        id="tf-content"
                        rows={4}
                        aria-invalid={!!errors.content}
                        aria-describedby={errors.content ? "tf-content-error" : undefined}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-foreground leading-relaxed resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          errors.content ? "border-red-400" : "border-slate-200"
                        }`}
                        placeholder="What was it like working together? What stood out?"
                        {...field("content")}
                      />
                      {errors.content && (
                        <p id="tf-content-error" className="text-xs text-red-500 mt-1">
                          {errors.content}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="tf-project" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Project name <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          id="tf-project"
                          type="text"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          {...field("projectName")}
                        />
                      </div>
                      <div>
                        <label htmlFor="tf-website" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Website / social <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          id="tf-website"
                          type="text"
                          aria-invalid={!!errors.website}
                          aria-describedby={errors.website ? "tf-website-error" : undefined}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                            errors.website ? "border-red-400" : "border-slate-200"
                          }`}
                          placeholder="yourcompany.com"
                          {...field("website")}
                        />
                        {errors.website && (
                          <p id="tf-website-error" className="text-xs text-red-500 mt-1">
                            {errors.website}
                          </p>
                        )}
                      </div>
                    </div>

                    {status === "error" && (
                      <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="interactive w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-semibold shadow-[0_10px_28px_-10px_rgba(29,111,235,0.5)] hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          Submitting…
                        </>
                      ) : (
                        "Submit Experience"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
