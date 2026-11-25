import React from 'react';
import { motion } from 'motion/react';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../i18n/translations';
import { usePointerCapabilities } from '../hooks/usePointerCapabilities';
import { ScrollableCarousel } from './ScrollableCarousel';

export const HowWeWorkSection: React.FC = () => {
  const { prefersReducedMotion } = usePointerCapabilities();
  const { language } = usePreferences();
  const t = translations[language];

  return (
    <section
      id="about"
      className="py-16 md:py-22 bg-[var(--color-background)] border-b border-[var(--color-outline-variant)]"
    >
      <div className="container-hyde">
        <div className="pb-10 md:pb-12 border-b border-[var(--color-outline-variant)] max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.04em] text-[var(--color-primary-text)]">
            {t.aboutSection.eyebrow}
          </p>
          <h2 className="section-heading-type mt-2 text-[var(--color-on-surface)]">
            {t.aboutSection.headline}
          </h2>
          <p className="mt-4 text-base md:text-lg text-[var(--color-on-surface-variant)] leading-relaxed max-w-[58ch]">
            {t.aboutSection.description}
          </p>
        </div>

        <div className="pt-8 md:pt-10">
          <ScrollableCarousel
            hideOnDesktop
            prevLabel="Scroll process steps left"
            nextLabel="Scroll process steps right"
            resetKey={language}
            trackClassName="lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:py-0 lg:my-0"
          >
            {t.aboutSection.steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: prefersReducedMotion ? 0.01 : 0.32,
                  delay: prefersReducedMotion ? 0 : index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-[78vw] max-w-[290px] sm:w-[270px] shrink-0 snap-start rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-5 lg:w-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
              >
                <span className="font-mono-tabular text-xs font-semibold text-[var(--color-primary-text)]">
                  {step.number}.
                </span>
                <h3 className="mt-2 font-heading text-lg font-semibold text-[var(--color-on-surface)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </ScrollableCarousel>
        </div>
      </div>
    </section>
  );
};
