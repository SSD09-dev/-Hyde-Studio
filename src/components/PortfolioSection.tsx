import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { ClientProject, PortfolioCategory, siteConfig } from '../config/siteConfig';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../i18n/translations';
import { ResponsiveImage } from './MotionPrimitives';
import { usePointerCapabilities } from '../hooks/usePointerCapabilities';
import { ScrollableCarousel } from './ScrollableCarousel';

interface PortfolioSectionProps {
  activeCategory: PortfolioCategory;
  onCategoryChange: (category: PortfolioCategory) => void;
  onOpenProject: (project: ClientProject) => void;
}

interface ProjectCardProps {
  project: ClientProject;
  onOpen: (project: ClientProject) => void;
  enableHoverEffects: boolean;
  prefersReducedMotion: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  enableHoverEffects,
  prefersReducedMotion,
}) => {
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const { language } = usePreferences();
  const t = translations[language];
  const localized = t.portfolioSection.projects[project.translationKey || project.id];
  const localizedCategory = t.portfolioSection.categories[project.category];

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const floatX = useSpring(rawX, { stiffness: 480, damping: 32, mass: 0.35 });
  const floatY = useSpring(rawY, { stiffness: 480, damping: 32, mass: 0.35 });

  const updatePointerCoords = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableHoverEffects || !imageWrapRef.current) return;
    const rect = imageWrapRef.current.getBoundingClientRect();
    const clampedX = Math.max(72, Math.min(rect.width - 72, e.clientX - rect.left));
    const clampedY = Math.max(42, Math.min(rect.height - 10, e.clientY - rect.top));
    rawX.set(clampedX);
    rawY.set(clampedY);
  };

  const handleImagePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableHoverEffects) return;
    updatePointerCoords(e);
    setIsImageHovered(true);
  };

  const handleImagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableHoverEffects) return;
    updatePointerCoords(e);
    if (!isImageHovered) setIsImageHovered(true);
  };

  const handleImagePointerLeave = () => {
    if (!enableHoverEffects) return;
    setIsImageHovered(false);
  };

  return (
    <motion.article
      layout={!prefersReducedMotion}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.988 }}
      className="group relative h-full rounded-[var(--radius-md)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:border-[var(--color-primary-border)] hover:ring-1 hover:ring-[var(--color-primary)]/45 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="flex h-full w-full flex-col text-left cursor-pointer rounded-[var(--radius-md)] overflow-hidden"
        aria-label={`${t.portfolioSection.viewCaseStudy}: ${localized.title}`}
      >
        {/* Hover CTA Pop-up appears ONLY when cursor hovers the image area */}
        <div
          ref={imageWrapRef}
          onPointerEnter={handleImagePointerEnter}
          onPointerMove={handleImagePointerMove}
          onPointerLeave={handleImagePointerLeave}
          className="relative aspect-[16/10] w-full overflow-hidden border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]"
        >
          <ResponsiveImage
            src={project.image}
            alt={project.imageAlt}
            title={localized.title}
            className="h-full w-full"
            imgClassName={
              enableHoverEffects
                ? 'transition-transform duration-300 ease-out group-hover:scale-[1.04]'
                : ''
            }
          />

          <AnimatePresence>
            {enableHoverEffects && isImageHovered && (
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  left: floatX,
                  top: floatY,
                  x: '-50%',
                  y: '-115%',
                }}
                className="pointer-events-none absolute z-30 inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-on-primary)] border border-[var(--color-primary-btn-border)] shadow-[var(--shadow-menu)] whitespace-nowrap"
              >
                <span>{t.portfolioSection.viewCaseStudy}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Text Body — focuses card without showing the image hover button */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              <span className="font-semibold text-[var(--color-primary-text)]">
                {localizedCategory}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{project.client}</span>
            </div>

            <h3 className="mt-1.5 font-heading text-base font-semibold tracking-[-0.02em] leading-snug text-[var(--color-on-surface)] group-hover:text-[var(--color-primary-text)] transition-colors line-clamp-2">
              {localized.title}
            </h3>

            <p className="mt-1.5 text-xs text-[var(--color-on-surface-variant)] leading-relaxed line-clamp-2">
              {localized.summary}
            </p>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[var(--color-outline-variant)]/70 flex items-center justify-between text-[11px] font-semibold text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors">
            <span>{t.portfolioSection.viewCaseStudy}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </button>
    </motion.article>
  );
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  activeCategory,
  onCategoryChange,
  onOpenProject,
}) => {
  const { hasFinePointer, prefersReducedMotion } = usePointerCapabilities();
  const { language } = usePreferences();
  const t = translations[language];

  const filteredProjects =
    activeCategory === 'All'
      ? siteConfig.projects
      : siteConfig.projects.filter((project) => project.category === activeCategory);

  const hoverEffectsEnabled = hasFinePointer && !prefersReducedMotion;

  return (
    <section
      id="work"
      className="py-16 md:py-22 bg-[var(--color-background)] border-b border-[var(--color-outline-variant)]"
    >
      <div className="container-hyde">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.04em] text-[var(--color-primary-text)]">
              {t.portfolioSection.eyebrow}
            </p>
            <h2 className="section-heading-type mt-2 text-[var(--color-on-surface)]">
              {t.portfolioSection.heading}
            </h2>
          </div>

          <div
            role="tablist"
            aria-label={t.portfolioSection.filterAriaLabel}
            className="flex flex-wrap items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-1"
          >
            {siteConfig.portfolioCategories.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onCategoryChange(category)}
                  className={`relative min-h-[42px] px-3 py-1.5 text-xs md:text-sm font-medium rounded-[var(--radius-sm)] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'text-[var(--color-on-primary)]'
                      : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="portfolioFilterIndicator"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.01 }
                          : { type: 'spring', stiffness: 420, damping: 32 }
                      }
                      className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-primary)] border border-[var(--color-primary-btn-border)]"
                    />
                  )}
                  <span className="relative z-10">
                    {t.portfolioSection.categories[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual User-Scrollable Project Strip with Smooth Edge Blur & Floating Chevrons */}
        <ScrollableCarousel
          prevLabel="Scroll projects left"
          nextLabel="Scroll projects right"
          resetKey={`${activeCategory}-${language}`}
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="w-[78vw] max-w-[270px] sm:w-[265px] lg:w-[280px] shrink-0 snap-start"
            >
              <ProjectCard
                project={project}
                onOpen={onOpenProject}
                enableHoverEffects={hoverEffectsEnabled}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ))}
        </ScrollableCarousel>
      </div>
    </section>
  );
};
