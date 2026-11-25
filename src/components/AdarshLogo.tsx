import React from 'react';

interface AdarshLogoProps {
  variant?: 'light' | 'dark';
  size?: 'header' | 'drawer' | 'footer';
  showIcon?: boolean;
  referenceWordmark?: boolean;
}

export const AdarshLogo: React.FC<AdarshLogoProps> = ({
  variant = 'light',
  size = 'header',
  showIcon = true,
  referenceWordmark = false,
}) => {
  const isDark = variant === 'dark';

  const svgSizeClass =
    size === 'footer'
      ? 'w-11 h-9 sm:w-12 sm:h-10'
      : size === 'drawer'
      ? 'w-9 h-7'
      : 'w-8 h-6 sm:w-10 sm:h-8';

  const titleClass =
    size === 'footer'
      ? 'text-xl sm:text-2xl'
      : size === 'drawer'
      ? 'text-base'
      : referenceWordmark
      ? 'text-[13.5px] min-[390px]:text-[15px] sm:text-lg'
      : 'text-[14px] min-[390px]:text-[15px] sm:text-lg';

  const subtitleClass =
    size === 'footer'
      ? 'text-[9px] sm:text-[10px] tracking-[0.16em]'
      : size === 'drawer'
      ? 'text-[7.5px] tracking-[0.12em]'
      : 'text-[6.5px] min-[390px]:text-[7px] sm:text-[8.5px] tracking-[0.1em] sm:tracking-[0.14em]';

  const primaryStroke = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2 select-none shrink-0">
      {/* Inline Racing Superbike Crest SVG (Zero external file dependency) */}
      {showIcon && (
        <svg
          viewBox="0 0 56 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={`${svgSizeClass} shrink-0`}
        >
          {/* Dynamic Speed Wing Backdrop */}
          <path d="M4 11H24L20 15H2L4 11Z" fill="#DC2626" />
          <path d="M6 17H19L16 20.5H4L6 17Z" fill="#DC2626" fillOpacity="0.75" />
          {/* Superbike Silhouette Chassis & Fairing */}
          <path
            d="M17 24L22.5 14.5H33.5L39.5 10.5L43 13.5L38 18.5L42.5 24H36L32.5 19H25L22.5 24H17Z"
            fill={primaryStroke}
          />
          {/* Racing Windscreen & Tank Accent */}
          <path d="M24 14.5L30.5 11.5H36.5L33 14.5H24Z" fill="#DC2626" />
          {/* Rear Wheel */}
          <circle cx="18" cy="27.5" r="7" stroke={primaryStroke} strokeWidth="3.2" />
          <circle cx="18" cy="27.5" r="2.1" fill="#DC2626" />
          {/* Front Wheel */}
          <circle cx="43" cy="27.5" r="7" stroke="#DC2626" strokeWidth="3.2" />
          <circle cx="43" cy="27.5" r="2.1" fill={primaryStroke} />
        </svg>
      )}

      {/* Crisp Typography Wordmark */}
      <span className="flex flex-col leading-none text-left">
        {referenceWordmark ? (
          <span
            aria-label="ADARSH MOTORS"
            className={`font-logo font-black italic uppercase tracking-[0.01em] whitespace-nowrap text-[#E51919] inline-flex items-baseline leading-none ${titleClass}`}
          >
            <span>ADARSH M</span>
            {/* Motorcycle glyph forming O-T-O in fire red */}
            <svg
              viewBox="0 0 48 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="inline-block h-[1.06em] w-auto align-baseline mx-[0.015em] shrink-0 text-[#E51919]"
            >
              {/* Rear Wheel (First O) */}
              <circle cx="10.2" cy="19.5" r="7.2" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="10.2" cy="19.5" r="5.1" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="10.2" cy="19.5" r="1.7" fill="currentColor" />
              <path
                d="M10.2 14.1V24.9M4.8 19.5H15.6M6.4 15.7L14 23.3M14 15.7L6.4 23.3"
                stroke="currentColor"
                strokeWidth="0.8"
              />

              {/* Sculpted Seat + Fuel Tank (Top Bar of T) */}
              <path
                d="M2.6 7.3C5.8 7.8 7.8 9.9 12.2 9.9C16.7 9.9 19.8 6.8 25.6 6.3C28.7 6.1 30.8 7.5 30.2 10.1L26.8 11.7H19.4C15.5 11.7 9.6 11.8 4.9 10.4C3.3 9.9 2.3 8.5 2.6 7.3Z"
                fill="currentColor"
              />

              {/* Bold Slanted Engine Post (Stem of T) */}
              <path d="M20.6 11.2H26.4L24.8 27.6H19.2L20.6 11.2Z" fill="currentColor" />

              {/* Handlebar, Fork & Headlight */}
              <path
                d="M29.4 4.5L37.5 19.5"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
              />
              <path
                d="M29.4 4.5L26.3 2.5L24.2 2.7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="30.6"
                y="4.8"
                width="3.4"
                height="2.4"
                rx="0.8"
                transform="rotate(14 32 6)"
                fill="currentColor"
              />

              {/* Front Wheel (Second O) */}
              <circle cx="37.5" cy="19.5" r="7.2" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="37.5" cy="19.5" r="5.1" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="37.5" cy="19.5" r="1.7" fill="currentColor" />
              <path
                d="M37.5 14.1V24.9M32.1 19.5H42.9M33.7 15.7L41.3 23.3M41.3 15.7L33.7 23.3"
                stroke="currentColor"
                strokeWidth="0.8"
              />
            </svg>
            <span>RS</span>
          </span>
        ) : (
          <span
            className={`font-black italic uppercase tracking-tight whitespace-nowrap ${titleClass}`}
          >
            <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>ADARSH </span>
            <span className="text-[#DC2626]">MOTORS</span>
          </span>
        )}
        <span
          className={`font-extrabold uppercase whitespace-nowrap mt-0.5 ${subtitleClass} ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          THE BIKER&apos;S PARADISE &bull; ESTD 2001
        </span>
      </span>
    </span>
  );
};
