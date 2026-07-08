import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.15,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Rice / biryani / grain dishes */
export function GrainIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 20c-1.2-3.5-1.2-7 0-11" />
      <path d="M10.5 20c-1.2-4.5-1.2-9.5 0-15" />
      <path d="M15 20c-.8-4-.8-8.5 0-13" />
      <path d="M18.5 20c-.5-3-.5-6 0-9" />
    </svg>
  );
}

/** Vegetable / curry / leafy dishes */
export function VegetableIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21c-4.5 0-7-3-7-7 0-3 2-5 4-6" />
      <path d="M12 21c4.5 0 7-3 7-7 0-3-2-5-4-6" />
      <path d="M12 3c1.8 1.4 2.6 3 2.6 5" />
      <path d="M12 3c-1.8 1.4-2.6 3-2.6 5" />
      <path d="M12 21V9" />
    </svg>
  );
}

/** Bread / naan / roti */
export function BreadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13c0-4 3.5-7 8-7s8 3 8 7-3.5 6-8 6-8-2-8-6Z" />
      <path d="M9 10.5c.8.6 1.4 1.6 1.4 3" />
      <path d="M14.5 10.5c-.8.6-1.4 1.6-1.4 3" />
    </svg>
  );
}

/** Protein / kebab / meat dishes */
export function ProteinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 15c-2 2-3.5 2.5-4.5 1.5S4.2 14 6 12" />
      <path d="M9 15c2.5-2.5 5-6.5 7.5-9C18.5 4 20 5.5 18 7.5c-2.5 2.5-6.5 5-9 7.5Z" />
      <circle cx="7.5" cy="16.5" r="1.4" />
    </svg>
  );
}

/** Soup / dal / stew */
export function SoupIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16c0 4-3 8-8 8s-8-4-8-8Z" />
      <path d="M8 12V9" />
      <path d="M16 12V9" />
      <path d="M9.5 4.5c-.8.8-.8 1.7 0 2.5" />
      <path d="M14.5 4.5c-.8.8-.8 1.7 0 2.5" />
    </svg>
  );
}

/** Drinks / chai / lassi */
export function DrinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 9h10l-1 10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 9Z" />
      <path d="M7 9c0-2.5 2-4 5-4s5 1.5 5 4" />
      <path d="M10 13.5h4" />
    </svg>
  );
}

/** Dessert / sweets */
export function DessertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4c1.8 0 3 1.4 3 3.2 0 1.3-.7 2-1.5 2.8H10.5c-.8-.8-1.5-1.5-1.5-2.8C9 5.4 10.2 4 12 4Z" />
      <path d="M6 10h12l-1.2 8.5a2 2 0 0 1-2 1.5H9.2a2 2 0 0 1-2-1.5L6 10Z" />
      <path d="M9 14h6" />
    </svg>
  );
}

/** Generic plate — fallback when nothing else matches */
export function PlateIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/** No meal scheduled / empty state */
export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="1.5" />
      <path d="M4 9.5h16" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
    </svg>
  );
}

const KEYWORD_ICONS: [RegExp, (props: IconProps) => React.JSX.Element][] = [
  [/biryani|rice|pulao|khichdi/i, GrainIcon],
  [/naan|roti|paratha|bread|kulcha/i, BreadIcon],
  [/chicken|mutton|kebab|kabab|fish|egg|meat|tikka/i, ProteinIcon],
  [/dal|curry|soup|stew|sambar|rasam/i, SoupIcon],
  [/chai|lassi|drink|juice|shake/i, DrinkIcon],
  [/kheer|halwa|gulab|sweet|dessert|barfi|jalebi/i, DessertIcon],
  [/baingan|paneer|sabzi|vegetable|saag|bhindi|aloo/i, VegetableIcon],
];

export function getDishIcon(dishName: string) {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(dishName));
  return match ? match[1] : PlateIcon;
}
