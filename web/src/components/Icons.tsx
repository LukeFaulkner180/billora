import type {ReactNode} from 'react';

const paths: Record<string, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-12 6 2 2 4-4"/></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></>,
  trend: <path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-8h6v8"/></>,
  bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z"/>,
  repeat: <path d="m17 1 4 4-4 4M3 11V8a3 3 0 0 1 3-3h15M7 23l-4-4 4-4M21 13v3a3 3 0 0 1-3 3H3"/>,
  receipt: <><path d="M4 3h16v18l-4-2-4 2-4-2-4 2V3Z"/><path d="M8 8h8M8 12h8"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  check: <path d="m4 12 5 5L20 6"/>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6"/><path d="M10 10v7m4-7v7"/></>,
  edit: <><path d="M12 20h9M3 17.5V21h3.5L19 8.5 15.5 5 3 17.5ZM14 6.5 17.5 10"/></>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/></>,
  alert: <><path d="m12 2 10 18H2L12 2Z"/><path d="M12 9v4m0 4h.01"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  download: <path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>,
  upload: <path d="M12 21V8m-5 5 5-5 5 5M4 7V3h16v4"/>,
  wallet: <><rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 9V5a2 2 0 0 1 2-2h13m3 9h-6a2 2 0 0 0 0 4h6"/></>,
  piggy: <><path d="M18 8a7 7 0 0 0-11 1H4v6h3a7 7 0 0 0 2 2v3h3v-2h3v2h3v-4a7 7 0 0 0 2-8V6h-2v2Z"/><path d="M16 11h.01"/></>,
  sparkle: <path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"/>,
  chart: <path d="M4 20V10m5 10V4m5 16v-8m5 8V7"/>,
};
export function Icon({name, size = 18}: {name: string; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.info}</svg>;
}
