import * as React from 'react';
import { cx, formatNum } from '@/lib/format.js';

export function Icon({ name, size = 16, stroke = 1.6 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9z" /></svg>;
    case 'compass':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-4 0 2-6z" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" /></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case 'arrow-right':
      return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
    case 'arrow-left':
      return <svg {...props}><path d="M19 12H5M11 19l-7-7 7-7" /></svg>;
    case 'arrow-down':
      return <svg {...props}><path d="M12 5v14M5 12l7 7 7-7" /></svg>;
    case 'x':
      return <svg {...props}><path d="M6 6l12 12M18 6l-12 12" /></svg>;
    case 'wallet':
      return <svg {...props}><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M16 12h3" /><path d="M3 10h18" /></svg>;
    case 'users':
      return <svg {...props}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M2 20c0-3 3-5 7-5s7 2 7 5M14 19c0-2 2-3.5 5-3.5s5 1.5 5 3.5" /></svg>;
    case 'mic':
      return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>;
    case 'briefcase':
      return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>;
    case 'cap':
      return <svg {...props}><path d="M2 9l10-4 10 4-10 4L2 9z" /><path d="M6 11v5c0 1 3 2 6 2s6-1 6-2v-5" /></svg>;
    case 'sparkles':
      return <svg {...props}><path d="M12 3l1 4 4 1-4 1-1 4-1-4-4-1 4-1zM19 13l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5zM5 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5z" fill="currentColor" stroke="none" /></svg>;
    case 'check':
      return <svg {...props}><path d="M4 12l5 5L20 6" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

export const CAT_META = {
  news: { icon: 'globe', bg: '#1a2444', fg: '#fff', soft: '#e6e9f4', dark: true },
  alpha: { icon: 'sparkles', bg: '#efb742', fg: '#2a1d00', soft: '#fbedcc' },
  earn: { icon: 'wallet', bg: '#f7705a', fg: '#3a1208', soft: '#fde2dc' },
  skills: { icon: 'briefcase', bg: '#b89ef0', fg: '#241540', soft: '#ece5fb' },
  activities: { icon: 'book', bg: '#efd9c1', fg: '#3d2614', soft: '#fbf3e8' },
  training: { icon: 'cap', bg: '#cfe6b8', fg: '#1d3208', soft: '#ecf3e1' },
  events: { icon: 'calendar', bg: '#f0c1c9', fg: '#3a0e1a', soft: '#fae7eb' },
  partnership: { icon: 'handshake', bg: '#7da19a', fg: '#0e2420', soft: '#dee9e6', dark: true },
};

export function Avatar({ user, size = 32, ring = false }) {
  if (!user) return null;
  const fontSize = Math.round(size * 0.42);
  const bg = `oklch(0.6 0.18 ${user.hue || 60})`;
  const ringStyle = ring ? { boxShadow: '0 0 0 3px var(--bg-0)' } : {};

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize, background: bg, borderRadius: '50%', ...ringStyle }}
    >
      {user.avatar}
    </div>
  );
}

export function AvatarStack({ handles, resolveUser, size = 24, max = 4 }) {
  const shown = handles.slice(0, max);
  return (
    <div className="avatar-stack" style={{ display: 'flex' }}>
      {shown.map((handle, index) => (
        <div key={handle} style={{ marginLeft: index === 0 ? 0 : -8, position: 'relative', zIndex: max - index }}>
          <Avatar user={resolveUser(handle)} size={size} ring />
        </div>
      ))}
    </div>
  );
}

export function CategoryPill({ cat, onClick }) {
  if (!cat) return null;
  const meta = CAT_META[cat.id];
  const bg = meta?.soft || 'var(--bg-3)';
  const fg = meta?.dark ? meta.bg : meta?.fg || 'var(--text-1)';

  return (
    <button className="cat-pill" onClick={onClick} style={{ background: bg, color: fg }}>
      <span className="cat-pill-dot" style={{ background: meta?.bg || '#888' }} />
      <span>{cat.name}</span>
    </button>
  );
}

const TIER_STYLES = {
  Explorer: { c: '#3a4878', bg: '#dde2f0' },
  Scout: { c: '#1d4329', bg: '#d9ecdf' },
  Pathfinder: { c: '#5a4a2a', bg: '#f4e8c1' },
  Navigator: { c: '#6b3f00', bg: '#fbedcc' },
  Wayfinder: { c: '#7a1f06', bg: '#fde2dc' },
  Trailblazer: { c: '#241540', bg: '#ece5fb' },
  Vanguard: { c: '#4e2a1d', bg: '#f8d9da' },
  'Compass Elite': { c: '#0c2a1f', bg: '#d6f0e8' },
  'Compass Legend': { c: '#7a006d', bg: '#f5e1f7' },
};

export function TierBadge({ tier }) {
  const s = TIER_STYLES[tier] || TIER_STYLES.Cadet;
  return <span className="tier-badge" style={{ color: s.c, background: s.bg }}>{tier}</span>;
}

export function CompassLogo({ size = 28 }) {
  return (
    <div className="logo" style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}>
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 10l-2.5 4.5L9 14l2.5-4.5z" fill="currentColor" />
        <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}

export function Dot() {
  return <span className="dot">·</span>;
}

export function FadeUp({ children, delay = 0, className = '' }) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setShown(true), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [delay]);

  return <div ref={ref} className={cx('fade-up', shown && 'in', className)}>{children}</div>;
}

export { formatNum };
