// Ícones do protótipo, traço 2px, mesma geometria
import type { SVGProps } from "react"

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size: number, sw = 2) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
})

export const IconStudents = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-7 7-7s7 3 7 7" /><path d="M17 11a3 3 0 1 0 0-6" /><path d="M22 21c0-3-2-5-4-6" /></svg>
)
export const IconCard = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
)
export const IconCalendarCheck = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M9 16l2 2 4-4" /></svg>
)
export const IconChart = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>
)
export const IconTag = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><path d="M7.5 7.5h.01" /></svg>
)
export const IconLink = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
)
export const IconQr = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></svg>
)
export const IconOut = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
)
export const IconBack = ({ size = 16, ...p }: P) => (
  <svg {...base(size, 2.5)} {...p}><path d="M15 18l-6-6 6-6" /></svg>
)
export const IconPlus = ({ size = 18, ...p }: P) => (
  <svg {...base(size, 2.5)} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconCheck = ({ size = 40, ...p }: P) => (
  <svg {...base(size, 3)} {...p}><path d="M5 12l5 5L20 7" /></svg>
)
export const IconEye = ({ size = 20, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
)
export const IconSearch = ({ size = 18, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
)
export const IconMail = ({ size = 30, ...p }: P) => (
  <svg {...base(size, 2.5)} {...p}><path d="M4 4h16v16H4z" /><path d="M4 6l8 7 8-7" /></svg>
)
