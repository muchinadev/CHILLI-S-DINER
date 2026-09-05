import type { SVGProps } from "react";

/**
 * Hand-drawn-style line-art doodles matching the business's own flyer
 * (tomato, fish, citrus wheel, bell pepper, garlic scattered around the
 * border). Pure outline, no fill, so they read as light background texture
 * behind real content rather than competing with it.
 */

type DoodleProps = SVGProps<SVGSVGElement>;

const commonProps = {
  viewBox: "0 0 100 100",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function TomatoDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M50 28c17 0 28 13 28 30s-13 28-28 28-28-12-28-28 11-30 28-30Z" />
      <path d="M50 28c-3-6-2-11 2-15M50 28c3-6 2-11-2-15M50 28c-6-4-12-3-16 2M50 28c6-4 12-3 16 2" />
      <path d="M32 50c3-8 9-13 18-14M64 62c-2 7-8 12-16 13" />
    </svg>
  );
}

export function FishDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M12 50c14-16 34-22 50-14 10 5 18 14 22 14-4 0-12 9-22 14-16 8-36 2-50-14Z" />
      <path d="M84 50 96 36M84 50l12 14" />
      <circle cx="30" cy="46" r="2.5" fill="currentColor" stroke="none" />
      <path d="M34 50c6 2 12 2 18 0M38 60c7 2 14 2 21-1" />
    </svg>
  );
}

export function CitrusDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <circle cx="50" cy="50" r="34" />
      <circle cx="50" cy="50" r="34" strokeDasharray="1 7" />
      <path d="M50 16v68M16 50h68M27 27l46 46M73 27 27 73" />
      <circle cx="50" cy="50" r="10" />
    </svg>
  );
}

export function BellPepperDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M50 30c-2-8-1-14 6-18" />
      <path d="M40 34c6-4 14-4 20 0" />
      <path d="M34 40c-10 8-12 24-6 36 6 11 16 16 22 16s16-5 22-16c6-12 4-28-6-36-8-6-24-6-32 0Z" />
      <path d="M42 42c-4 10-4 26 2 38M58 42c4 10 4 26-2 38" />
    </svg>
  );
}

export function GarlicDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M50 18c3 5 3 9 0 13" />
      <path d="M38 30c4-8 20-8 24 0 8 6 12 18 12 30 0 16-11 26-24 26s-24-10-24-26c0-12 4-24 12-30Z" />
      <path d="M50 30v52M40 34c-2 16-2 32 2 46M60 34c2 16 2 32-2 46" />
    </svg>
  );
}

export function PlateDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <circle cx="54" cy="50" r="30" />
      <circle cx="54" cy="50" r="18" />
      <path d="M20 24v26c0 5 3 8 6 8M20 24c0 6 3 9 6 9M26 24v34" />
    </svg>
  );
}

export function ChiliDoodle(props: DoodleProps) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M46 20c4-6 10-8 16-6" />
      <path d="M46 20c-6 2-8 8-4 12 10 4 16 14 14 28-2 16-16 26-28 22-10-3-16-14-13-26 4-14 18-30 31-36Z" />
    </svg>
  );
}
