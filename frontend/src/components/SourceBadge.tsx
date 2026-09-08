import React from 'react';

interface SourceBadgeProps {
  source: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className = '', size = 'sm' }) => {
  const cleanSource = source.replace(/[[\]]/g, '').trim().toUpperCase();

  let badgeStyle = 'bg-slate-900 text-slate-400 border-slate-700';

  if (cleanSource.includes('AI') || cleanSource.includes('MODEL') || cleanSource.includes('ESTIMATION')) {
    badgeStyle = 'bg-[#0f1d2e] text-cyan-300 border-[#1e3a5f]';
  } else if (cleanSource.includes('TCIR') || cleanSource.includes('GROUND TRUTH') || cleanSource.includes('OBSERVATION')) {
    badgeStyle = 'bg-[#0e241b] text-emerald-300 border-[#1b4332]';
  } else if (cleanSource.includes('NOAA') || cleanSource.includes('HURSAT')) {
    badgeStyle = 'bg-[#261f10] text-amber-300 border-[#4a3b1c]';
  } else if (cleanSource.includes('DERIVED') || cleanSource.includes('KINEMATIC')) {
    badgeStyle = 'bg-[#1b172a] text-purple-300 border-[#382f56]';
  } else if (cleanSource.includes('LIVE') || cleanSource.includes('WINDY') || cleanSource.includes('ECMWF')) {
    badgeStyle = 'bg-[#291319] text-rose-300 border-[#4d1f2b]';
  } else if (cleanSource.includes('TEST') || cleanSource.includes('VALIDATION')) {
    badgeStyle = 'bg-[#101b2b] text-blue-300 border-[#1f3554]';
  } else if (cleanSource.includes('ADVISORY') || cleanSource.includes('ALERT') || cleanSource.includes('WARNING')) {
    badgeStyle = 'bg-[#2e1014] text-red-300 border-[#571c24]';
  }

  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border tracking-wider uppercase ${sizeClasses} ${badgeStyle} ${className}`}
    >
      [{cleanSource}]
    </span>
  );
};
