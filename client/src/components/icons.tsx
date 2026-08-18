import type { SVGProps } from "react";

// Set de iconos propio (stroke, currentColor) para no depender de emojis ni de
// una librería de iconos genérica. Todos comparten el mismo trazo (1.75) y
// grid de 20x20 para verse como un sistema coherente.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 18, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8.5h14M6.5 2.5v3M13.5 2.5v3" />
    </svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 18s6-5.2 6-9.8A6 6 0 0 0 4 8.2C4 12.8 10 18 10 18Z" />
      <circle cx="10" cy="8" r="2.1" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="7.2" cy="6.5" r="2.5" />
      <path d="M2.5 17c0-2.9 2.1-5 4.7-5s4.7 2.1 4.7 5" />
      <circle cx="14.3" cy="7.2" r="2" />
      <path d="M12.9 12.2c1.9.4 3.3 2.1 3.3 4.3" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="7.3" />
      <path d="M6.8 10.2l2.1 2.1 4.3-4.6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h12M8 6V4.3A1.3 1.3 0 0 1 9.3 3h1.4A1.3 1.3 0 0 1 12 4.3V6M6 6l.6 9.4A1.5 1.5 0 0 0 8.1 17h3.8a1.5 1.5 0 0 0 1.5-1.6L14 6" />
    </svg>
  );
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12.6 3.4a1.8 1.8 0 0 1 2.6 2.6L6 15.2l-3 .8.8-3 8.8-9.6Z" />
    </svg>
  );
}

export function IconLogOut(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 17H4.8A1.8 1.8 0 0 1 3 15.2V4.8A1.8 1.8 0 0 1 4.8 3H8" />
      <path d="M13 14l4-4-4-4M17 10H7.5" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 2.5l6 2.2v4.4c0 4.2-2.6 7-6 8.4-3.4-1.4-6-4.2-6-8.4V4.7l6-2.2Z" />
      <path d="M7.3 9.7l2 2 3.4-3.7" />
    </svg>
  );
}

export function IconQrCode(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="5.5" height="5.5" rx="1" />
      <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" />
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" />
      <path d="M11.5 11.5h2.2v2.2M16.5 11.5v.01M13.7 16.5h2.8v-2.8M11.5 16.5v-1.8" />
    </svg>
  );
}

export function IconScan(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7V5.2A2.2 2.2 0 0 1 5.2 3H7M13 3h1.8A2.2 2.2 0 0 1 17 5.2V7M17 13v1.8a2.2 2.2 0 0 1-2.2 2.2H13M7 17H5.2A2.2 2.2 0 0 1 3 14.8V13" />
      <path d="M3 10h14" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9" />
      <circle cx="3.7" cy="5.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="3.7" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="3.7" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 2.8 18 16.5H2L10 2.8Z" />
      <path d="M10 8.2v3.4" />
      <circle cx="10" cy="14.1" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconLogIn(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 17h3.2A1.8 1.8 0 0 0 17 15.2V4.8A1.8 1.8 0 0 0 15.2 3H12" />
      <path d="M7 6l-4 4 4 4M3 10h9.5" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8.8" cy="8.8" r="5.3" />
      <path d="M17 17l-3.6-3.6" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="7.3" />
      <path d="M12.8 7.2 11.4 11.4l-4.2 1.4 1.4-4.2 4.2-1.4Z" />
    </svg>
  );
}
