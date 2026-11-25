import React, { useState } from 'react';
import { ServiceId, siteConfig } from '../config/siteConfig';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../i18n/translations';
import { SpotlightBentoCard } from './MotionPrimitives';
import { usePointerCapabilities } from '../hooks/usePointerCapabilities';
import { ScrollableCarousel } from './ScrollableCarousel';

export const ServicesBento: React.FC = () => {
  const { language, theme } = usePreferences();
  const { hasFinePointer } = usePointerCapabilities();
  const t = translations[language];
  const [hoveredService, setHoveredService] = useState<ServiceId | null>(null);

  return (
    <section
      id="services"
      className="py-16 md:py-22 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]"
    >
      <div className="container-hyde">
        <div className="max-w-2xl mb-8 md:mb-10">
          <p className="text-xs font-semibold tracking-[0.04em] text-[var(--color-primary-text)]">
            {t.servicesSection.eyebrow}
          </p>
          <h2 className="section-heading-type mt-2 text-[var(--color-on-surface)]">
            {t.servicesSection.heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-[var(--color-on-surface-variant)] leading-relaxed max-w-[54ch]">
            {t.servicesSection.subheading}
          </p>
        </div>

        {/* User-Controlled Scrollable Services Track with Smooth Edge Blur & Floating Chevrons */}
        <ScrollableCarousel
          prevLabel="Scroll services left"
          nextLabel="Scroll services right"
          resetKey={language}
          onTrackMouseLeave={() => setHoveredService(null)}
        >
          {siteConfig.services.map((service) => {
            const localized = t.servicesSection.items[service.id];
            const isHovered = hoveredService === service.id;
            const isDimmed = hoveredService !== null && !isHovered;

            return (
              <div
                key={service.id}
                onMouseEnter={() => {
                  if (hasFinePointer) setHoveredService(service.id);
                }}
                onMouseLeave={() => {
                  if (hasFinePointer) {
                    setHoveredService((prev) => (prev === service.id ? null : prev));
                  }
                }}
                onFocus={() => {
                  if (hasFinePointer) setHoveredService(service.id);
                }}
                onBlur={() => setHoveredService((prev) => (prev === service.id ? null : prev))}
                tabIndex={hasFinePointer ? 0 : undefined}
                className={`w-[82vw] max-w-[300px] sm:w-[290px] lg:w-[295px] shrink-0 snap-start rounded-[var(--radius-lg)] transition-all duration-300 ease-out focus:outline-none ${
                  isHovered
                    ? 'scale-[1.015] -translate-y-1 opacity-100 z-10'
                    : isDimmed
                      ? 'opacity-35 scale-[0.98] blur-[1px]'
                      : 'opacity-100'
                }`}
              >
                <SpotlightBentoCard
                  darkSurface={theme === 'dark'}
                  className={`h-full rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 xl:p-6 transition-all duration-300 ${
                    isHovered
                      ? 'border-[var(--color-primary-border)] ring-1 ring-[var(--color-primary)]/45 shadow-[var(--shadow-card)]'
                      : 'border-[var(--color-outline-variant)]'
                  }`}
                >
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div>
                      <span className="font-mono-tabular text-xs font-semibold text-[var(--color-primary-text)]">
                        {service.index}. {localized.shortLabel}
                      </span>

                      <h3 className="mt-2.5 font-heading text-lg xl:text-xl font-semibold tracking-[-0.02em] text-[var(--color-on-surface)]">
                        {localized.title}
                      </h3>

                      <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                        {localized.description}
                      </p>
                    </div>

                    <ul className="space-y-2 border-t border-[var(--color-outline-variant)] pt-4">
                      {localized.deliverables.map((item) => (
                        <li
                          key={item}
                          className="text-xs xl:text-sm text-[var(--color-on-surface)] flex items-start gap-2"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-text)]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotlightBentoCard>
              </div>
            );
          })}
        </ScrollableCarousel>
      </div>
    </section>
  );
};
