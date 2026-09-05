import type { SVGProps } from "react";

/** The red chili pepper mark from the business's own flyer, used as the wordmark icon. */
export function ChiliMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M20 10c2-3 6-4 9-2"
        stroke="#3a7d2c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M19 11c-3 1-4 5-1 7 7 2 12 10 10 20-2 11-13 16-20 12-6-4-8-12-4-19C8 20 14 14 19 11Z"
        fill="#d13b2f"
        stroke="#a82a20"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 26c3 6 3 12-1 17"
        stroke="#f0958a"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
