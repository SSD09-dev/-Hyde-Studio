import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, ChevronDown, Mail, MessageSquare, Phone } from 'lucide-react';
import { ServiceId, siteConfig } from '../config/siteConfig';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../i18n/translations';
import { MagneticWrapper } from './MotionPrimitives';
import { InstagramIcon, LinkedInIcon } from './SocialIcons';

interface ContactHubProps {
  preselectedService: ServiceId | '';
  prefilledBriefNote: string;
  onOpenPrivacyPolicy?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: ServiceId | '';
  subservice: string;
  brief: string;
}

export const ContactHub: React.FC<ContactHubProps> = ({
  preselectedService,
  prefilledBriefNote,
  onOpenPrivacyPolicy,
}) => {
  const { language } = usePreferences();
  const t = translations[language];

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    service: preselectedService,
    subservice: '',
    brief: prefilledBriefNote,
  });

  const [errors, setErrors] = useState<
    Partial<Record<'name' | 'email' | 'phone' | 'service' | 'subservice', string>>
  >({});
  const [submittedData, setSubmittedData] = useState<FormState | null>(null);

  useEffect(() => {
    if (preselectedService || prefilledBriefNote) {
      setForm((prev) => ({
        ...prev,
        service: preselectedService || prev.service,
        subservice:
          preselectedService && preselectedService !== prev.service ? '' : prev.subservice,
        brief: prefilledBriefNote || prev.brief,
      }));
      setSubmittedData(null);
    }
  }, [preselectedService, prefilledBriefNote]);

  const activeSubcategories = form.service
    ? siteConfig.SERVICE_SUBCATEGORIES[form.service] || []
    : [];

  const validate = (): boolean => {
    const nextErrors: Partial<
      Record<'name' | 'email' | 'phone' | 'service' | 'subservice', string>
    > = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = t.contactSection.form.nameError;
    }

    const trimmedEmail = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = t.contactSection.form.emailError;
    }

    const digitsOnly = form.phone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      nextErrors.phone = t.contactSection.form.phoneError;
    }

    if (!form.service) {
      nextErrors.service = t.contactSection.form.serviceError;
    } else if (!form.subservice) {
      nextErrors.subservice = t.contactSection.form.subserviceError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmittedData({ ...form });
  };

  const activeServiceKey = submittedData?.service || form.service;
  const selectedServiceTitle = activeServiceKey
    ? t.servicesSection.items[activeServiceKey].title
    : 'Project Inquiry';

  const getSubcategoryLabel = (serviceId: ServiceId | '', subId: string) => {
    if (!serviceId || !subId) return '';
    return (
      siteConfig.SERVICE_SUBCATEGORIES[serviceId]?.find((s) => s.id === subId)?.label || subId
    );
  };

  const buildMailtoHref = (data: FormState) => {
    const subLabel = getSubcategoryLabel(data.service, data.subservice);
    const serviceSummary = subLabel
      ? `${selectedServiceTitle} — ${subLabel}`
      : selectedServiceTitle;
    const briefText = data.brief.trim()
      ? data.brief.trim()
      : t.contactSection.form.briefSkippedNote;

    const subject = encodeURIComponent(`[Project Inquiry] ${serviceSummary} — ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nContact Number: ${data.phone}\nService: ${selectedServiceTitle}${
        subLabel ? `\nSubcategory: ${subLabel}` : ''
      }\n\nProject Brief:\n${briefText}`
    );
    return `mailto:${siteConfig.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="py-16 md:py-22 bg-[var(--color-background)]"
    >
      <div className="container-hyde">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Minimal Direct Contact Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.04em] text-[var(--color-primary-text)]">
                {t.contactSection.eyebrow}
              </p>
              <h2 className="section-heading-type mt-2 text-[var(--color-on-surface)]">
                {t.contactSection.headline}
              </h2>
              <p className="mt-4 text-base text-[var(--color-on-surface-variant)] leading-relaxed max-w-[42ch]">
                {t.contactSection.description}
              </p>
            </div>

            <div className="space-y-3 border-t border-[var(--color-outline-variant)] pt-6 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="h-4 w-4 text-[var(--color-primary-text)] shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${siteConfig.CONTACT_EMAIL}`}
                  className="font-medium text-[var(--color-on-surface)] hover:opacity-75 transition-opacity break-all"
                >
                  {siteConfig.CONTACT_EMAIL}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[var(--color-primary-text)] shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${siteConfig.CONTACT_PHONE.replace(/\s+/g, '')}`}
                  className="font-mono-tabular font-medium text-[var(--color-on-surface)] hover:opacity-75 transition-opacity"
                >
                  {siteConfig.CONTACT_PHONE}
                </a>
              </div>

              {siteConfig.WHATSAPP_NUMBER && (
                <div className="flex items-center gap-3">
                  <MessageSquare
                    className="h-4 w-4 text-[var(--color-primary-text)] shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={`https://wa.me/${siteConfig.WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-on-surface)] hover:opacity-75 transition-opacity underline underline-offset-4"
                  >
                    {t.contactSection.whatsappCta}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-3">
                <a
                  href={siteConfig.SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="The Hyde Studios on LinkedIn"
                  title="LinkedIn"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-container)] transition-colors"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>

                <a
                  href={siteConfig.SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="The Hyde Studios on Instagram"
                  title="Instagram"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-container)] transition-colors"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Client Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6 md:p-8">
              {submittedData ? (
                <div role="status" className="py-4 space-y-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-bold text-[var(--color-on-surface)]">
                      {t.contactSection.form.successTitlePrefix} {submittedData.name}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] max-w-[50ch]">
                      {t.contactSection.form.successBodyPrefix}{' '}
                      <span className="font-semibold text-[var(--color-on-surface)]">
                        {selectedServiceTitle}
                        {submittedData.subservice
                          ? ` — ${getSubcategoryLabel(
                              submittedData.service,
                              submittedData.subservice
                            )}`
                          : ''}
                      </span>{' '}
                      {t.contactSection.form.successBodySuffix}
                    </p>
                  </div>

                  <div className="rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-4 text-sm space-y-2">
                    <p>
                      <span className="font-semibold text-[var(--color-on-surface)]">
                        {t.contactSection.form.replyToLabel}{' '}
                      </span>
                      <span className="text-[var(--color-on-surface-variant)] break-all">
                        {submittedData.email}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-[var(--color-on-surface)]">
                        {t.contactSection.form.phoneSummaryLabel}{' '}
                      </span>
                      <span className="font-mono-tabular text-[var(--color-on-surface-variant)]">
                        {submittedData.phone}
                      </span>
                    </p>
                    {submittedData.subservice && (
                      <p>
                        <span className="font-semibold text-[var(--color-on-surface)]">
                          {t.contactSection.form.subserviceSummaryLabel}{' '}
                        </span>
                        <span className="text-[var(--color-on-surface-variant)]">
                          {getSubcategoryLabel(submittedData.service, submittedData.subservice)}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-[var(--color-on-surface)]">
                        {t.contactSection.form.briefSummaryLabel}{' '}
                      </span>
                      <span className="text-[var(--color-on-surface-variant)]">
                        {submittedData.brief.trim()
                          ? submittedData.brief.trim()
                          : t.contactSection.form.briefSkippedNote}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--color-outline-variant)] pt-2.5 text-xs">
                      <a
                        href={`mailto:${siteConfig.CONTACT_EMAIL}`}
                        className="inline-flex items-center gap-1.5 font-medium text-[var(--color-on-surface)] hover:opacity-75 transition-opacity break-all"
                      >
                        <Mail className="h-3.5 w-3.5 text-[var(--color-primary-text)] shrink-0" aria-hidden="true" />
                        <span>{siteConfig.CONTACT_EMAIL}</span>
                      </a>
                      <a
                        href={`tel:${siteConfig.CONTACT_PHONE.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 font-mono-tabular font-medium text-[var(--color-on-surface)] hover:opacity-75 transition-opacity whitespace-nowrap"
                      >
                        <Phone className="h-3.5 w-3.5 text-[var(--color-primary-text)] shrink-0" aria-hidden="true" />
                        <span>{siteConfig.CONTACT_PHONE}</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={buildMailtoHref(submittedData)}
                      className="inline-flex min-h-[46px] items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)] border border-[var(--color-primary-btn-border)] hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                      <span>{t.contactSection.form.openEmailCta}</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedData(null);
                        setForm({
                          name: '',
                          email: '',
                          phone: '',
                          service: '',
                          subservice: '',
                          brief: '',
                        });
                      }}
                      className="inline-flex min-h-[46px] items-center rounded-[var(--radius-md)] border border-[var(--color-outline)] px-5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                    >
                      {t.contactSection.form.sendAnotherCta}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-sm font-semibold text-[var(--color-on-surface)] mb-1.5"
                    >
                      {t.contactSection.form.nameLabel}
                    </label>
                    <input
                      id="inquiry-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder={t.contactSection.form.namePlaceholder}
                      required
                      aria-invalid={Boolean(errors.name)}
                      className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary-border)] focus:outline-none"
                    />
                    {errors.name && (
                      <p
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-[var(--color-error)]"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="inquiry-email"
                        className="block text-sm font-semibold text-[var(--color-on-surface)] mb-1.5"
                      >
                        {t.contactSection.form.emailLabel}
                      </label>
                      <input
                        id="inquiry-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder={t.contactSection.form.emailPlaceholder}
                        required
                        aria-invalid={Boolean(errors.email)}
                        className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary-border)] focus:outline-none"
                      />
                      {errors.email && (
                        <p
                          role="alert"
                          className="mt-1.5 text-xs font-medium text-[var(--color-error)]"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="inquiry-phone"
                        className="block text-sm font-semibold text-[var(--color-on-surface)] mb-1.5"
                      >
                        {t.contactSection.form.phoneLabel}
                      </label>
                      <input
                        id="inquiry-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, phone: e.target.value }));
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder={t.contactSection.form.phonePlaceholder}
                        required
                        aria-invalid={Boolean(errors.phone)}
                        className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3.5 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary-border)] focus:outline-none"
                      />
                      {errors.phone && (
                        <p
                          role="alert"
                          className="mt-1.5 text-xs font-medium text-[var(--color-error)]"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-service"
                      className="block text-sm font-semibold text-[var(--color-on-surface)] mb-1.5"
                    >
                      {t.contactSection.form.serviceLabel}
                    </label>
                    <div className="relative">
                      <select
                        id="inquiry-service"
                        value={form.service}
                        onChange={(e) => {
                          const nextService = e.target.value as ServiceId | '';
                          setForm((prev) => ({
                            ...prev,
                            service: nextService,
                            subservice: '',
                          }));
                          if (errors.service || errors.subservice) {
                            setErrors((prev) => ({
                              ...prev,
                              service: undefined,
                              subservice: undefined,
                            }));
                          }
                        }}
                        required
                        aria-invalid={Boolean(errors.service)}
                        className="h-12 w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] pl-3.5 pr-10 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary-border)] focus:outline-none cursor-pointer"
                      >
                        <option value="">{t.contactSection.form.servicePlaceholder}</option>
                        {siteConfig.services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {t.servicesSection.items[service.id].title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-on-surface-variant)]"
                        aria-hidden="true"
                      />
                    </div>
                    {errors.service && (
                      <p
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-[var(--color-error)]"
                      >
                        {errors.service}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Subcategory Dropdown scoped strictly to selected main service */}
                  <AnimatePresence initial={false}>
                    {form.service && activeSubcategories.length > 0 && (
                      <motion.div
                        key={`sub-${form.service}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <label
                          htmlFor="inquiry-subservice"
                          className="block text-sm font-semibold text-[var(--color-on-surface)] mb-1.5"
                        >
                          {t.contactSection.form.subserviceLabel}
                        </label>
                        <div className="relative">
                          <select
                            id="inquiry-subservice"
                            value={form.subservice}
                            onChange={(e) => {
                              setForm((prev) => ({ ...prev, subservice: e.target.value }));
                              if (errors.subservice) {
                                setErrors((prev) => ({ ...prev, subservice: undefined }));
                              }
                            }}
                            required
                            aria-invalid={Boolean(errors.subservice)}
                            className="h-12 w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] pl-3.5 pr-10 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary-border)] focus:outline-none cursor-pointer"
                          >
                            <option value="">
                              {t.contactSection.form.subservicePlaceholder}
                            </option>
                            {activeSubcategories.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-on-surface-variant)]"
                            aria-hidden="true"
                          />
                        </div>
                        {errors.subservice && (
                          <p
                            role="alert"
                            className="mt-1.5 text-xs font-medium text-[var(--color-error)]"
                          >
                            {errors.subservice}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Optional Project Brief Field (Always Visible, No Asterisk, No Toggle) */}
                  <div>
                    <label
                      htmlFor="inquiry-brief"
                      className="block text-sm font-semibold text-[var(--color-on-surface)] mb-1.5"
                    >
                      {t.contactSection.form.briefLabel}{' '}
                      <span className="font-normal text-xs text-[var(--color-on-surface-variant)]">
                        {t.contactSection.form.briefOptionalTag}
                      </span>
                    </label>
                    <textarea
                      id="inquiry-brief"
                      rows={4}
                      value={form.brief}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, brief: e.target.value }))
                      }
                      placeholder={t.contactSection.form.briefPlaceholder}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3.5 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary-border)] focus:outline-none resize-y"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <button
                      type="button"
                      onClick={onOpenPrivacyPolicy}
                      className="text-left text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-text)] underline underline-offset-4 cursor-pointer"
                    >
                      {t.contactSection.form.privacyNote}
                    </button>
                    <MagneticWrapper className="w-full sm:w-auto">
                      <button
                        type="submit"
                        className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-on-primary)] border border-[var(--color-primary-btn-border)] hover:bg-[var(--color-primary-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{t.contactSection.form.submitCta}</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </MagneticWrapper>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
