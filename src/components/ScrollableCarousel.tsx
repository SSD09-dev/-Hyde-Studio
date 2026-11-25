import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePointerCapabilities } from '../hooks/usePointerCapabilities';

interface ScrollableCarouselProps {
  children: React.ReactNode;
  trackClassName?: string;
  prevLabel: string;
  nextLabel: string;
  resetKey?: string | number;
  hideOnDesktop?: boolean;
  onTrackMouseLeave?: () => void;
}

export const ScrollableCarousel: React.FC<ScrollableCarouselProps> = ({
  children,
  trackClassName = '',
  prevLabel,
  nextLabel,
  resetKey,
  hideOnDesktop = false,
  onTrackMouseLeave,
}) => {
  const { prefersReducedMotion } = usePointerCapabilities();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isLgViewport, setIsLgViewport] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsLgViewport(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'auto' });
    }
    updateScrollState();
  }, [resetKey, updateScrollState]);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize);
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [updateScrollState, children]);

  const scrollByStep = (direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = Math.max(250, el.clientWidth * 0.72);
    el.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const carouselActive = !(hideOnDesktop && isLgViewport);

  const maskGradient = useMemo(() => {
    if (!carouselActive) return undefined;
    if (canScrollPrev && canScrollNext) {
      return 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 3%, black 9%, black 91%, rgba(0,0,0,0.4) 97%, transparent 100%)';
    }
    if (!canScrollPrev && canScrollNext) {
      return 'linear-gradient(to right, black 0%, black 90%, rgba(0,0,0,0.4) 96%, transparent 100%)';
    }
    if (canScrollPrev && !canScrollNext) {
      return 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 4%, black 10%, black 100%)';
    }
    return undefined;
  }, [carouselActive, canScrollPrev, canScrollNext]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseLeave={onTrackMouseLeave}
        style={
          maskGradient
            ? {
                maskImage: maskGradient,
                WebkitMaskImage: maskGradient,
              }
            : undefined
        }
        className={`flex items-stretch gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-3 -my-3 ${trackClassName}`}
      >
        {children}
      </div>

      {/* Left Smooth Edge Blur & Floating Chevron */}
      {carouselActive && canScrollPrev && (
        <>
          <div
            aria-hidden="true"
            style={{
              maskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
            }}
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-16 md:w-20 backdrop-blur-[3px]"
          />
          <button
            type="button"
            onClick={() => scrollByStep('prev')}
            aria-label={prevLabel}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-background)]/55 backdrop-blur-md text-[var(--color-on-surface)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.2]" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Right Smooth Edge Blur & Floating Chevron */}
      {carouselActive && canScrollNext && (
        <>
          <div
            aria-hidden="true"
            style={{
              maskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
            }}
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-16 md:w-20 backdrop-blur-[3px]"
          />
          <button
            type="button"
            onClick={() => scrollByStep('next')}
            aria-label={nextLabel}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-background)]/55 backdrop-blur-md text-[var(--color-on-surface)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 stroke-[2.2]" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};
