import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { usePointerCapabilities } from '../hooks/usePointerCapabilities';
import { usePreferences } from '../context/PreferencesContext';

/**
 * Global viewport cursor lighting overlay.
 * White luminous glow in dark mode; soft dark atmospheric shading in light mode.
 */
export const GlobalCursorLight: React.FC = () => {
  const { hasFinePointer, prefersReducedMotion } = usePointerCapabilities();
  const { theme } = usePreferences();
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);
  const smoothX = useSpring(mouseX, { stiffness: 260, damping: 30, mass: 0.4 });
  const smoothY = useSpring(mouseY, { stiffness: 260, damping: 30, mass: 0.4 });

  const darkBg = useMotionTemplate`radial-gradient(380px circle at ${smoothX}px ${smoothY}px, rgba(227, 232, 41, 0.08), rgba(254, 253, 249, 0.03) 45%, transparent 75%)`;
  const lightBg = useMotionTemplate`radial-gradient(360px circle at ${smoothX}px ${smoothY}px, rgba(1, 1, 1, 0.11), rgba(1, 1, 1, 0.035) 45%, transparent 75%)`;

  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) return;

    const handleMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible((prev) => (prev ? prev : true));
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [hasFinePointer, prefersReducedMotion, mouseX, mouseY]);

  if (!hasFinePointer || prefersReducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        background: theme === 'dark' ? darkBg : lightBg,
      }}
    />
  );
};

interface MagneticControlProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Tactile magnetic wrapper for desktop fine-pointer devices.
 * Automatically falls back to pure tap-spring feedback on touchscreens.
 */
export const MagneticWrapper: React.FC<MagneticControlProps> = ({
  children,
  className = '',
  strength = 0.22,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { hasFinePointer, prefersReducedMotion } = usePointerCapabilities();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 24, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 320, damping: 24, mass: 0.5 });

  const canMagnetize = hasFinePointer && !prefersReducedMotion;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canMagnetize || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-6, Math.min(6, offsetX * strength)));
    y.set(Math.max(-6, Math.min(6, offsetY * strength)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={canMagnetize ? { x: springX, y: springY } : undefined}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface SpotlightBentoCardProps {
  children: React.ReactNode;
  className?: string;
  darkSurface?: boolean;
}

/**
 * PixelUI-inspired cursor-tracking spotlight surface card.
 * Tracks pointer coordinates only when fine-pointer hover hardware is available.
 */
export const SpotlightBentoCard: React.FC<SpotlightBentoCardProps> = ({
  children,
  className = '',
  darkSurface = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { hasFinePointer, prefersReducedMotion } = usePointerCapabilities();
  const [coords, setCoords] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const canTrack = hasFinePointer && !prefersReducedMotion;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTrack || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    if (!canTrack) return;
    setCoords((prev) => ({ ...prev, active: false }));
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.992 }}
      className={`relative overflow-hidden transition-colors duration-200 ${className}`}
    >
      {canTrack && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: coords.active ? 1 : 0,
            background: darkSurface
              ? `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, rgba(227, 232, 41, 0.11), transparent 65%)`
              : `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, rgba(227, 232, 41, 0.18), rgba(1, 1, 1, 0.025) 45%, transparent 65%)`,
          }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

interface ResponsiveImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/**
 * Resilient image container implementing the Zero-Broken-Image policy.
 * Renders an architectural monochrome fallback if an image fails to load.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  title,
  className = '',
  imgClassName = '',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="h-3 w-3 rounded-xs bg-[var(--color-primary)] mb-3" aria-hidden="true" />
        <p className="font-heading text-sm font-semibold text-[var(--color-on-surface)]">
          {title || 'The Hyde Studios'}
        </p>
        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] max-w-[28ch]">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[var(--color-surface-container)] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-90'
        } ${imgClassName}`}
      />
    </div>
  );
};
