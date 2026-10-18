import { fonts } from '@/lib/theme';
import { useState } from 'react';

interface Props {
  hue?: number;
  label?: string;
  ratio?: string;
  radius?: number;
  theme?: 'light' | 'dark';
  imageUrl?: string;
  fit?: 'cover' | 'contain';
}

export default function PhotoBlock({ hue = 30, label = '', ratio = '16/9', radius = 0, theme, imageUrl, fit = 'cover' }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>(imageUrl ? 'loading' : 'failed');

  if (imageUrl && status !== 'failed') {
    return (
      <div style={{
        width: '100%',
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        background: theme === 'dark' ? '#161616' : '#F0F0ED',
      }}>
        {status === 'loading' && (
          <Fallback hue={hue} label={label} radius={0} theme={theme} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={label}
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            display: 'block',
            position: 'absolute',
            inset: 0,
            opacity: status === 'loaded' ? 1 : 0,
            transition: 'opacity 140ms ease',
          }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('failed')}
        />
      </div>
    );
  }

  return <Fallback hue={hue} label={label} ratio={ratio} radius={radius} theme={theme} />;
}

function Fallback({ hue, label, ratio, radius, theme }: Required<Pick<Props, 'hue' | 'label' | 'radius'>> & Pick<Props, 'ratio' | 'theme'>) {
  const c1 = `oklch(0.78 0.04 ${hue})`;
  const c2 = `oklch(0.70 0.05 ${hue})`;
  const c3 = `oklch(0.62 0.05 ${hue})`;
  return (
    <div style={{
      width: '100%',
      aspectRatio: ratio,
      borderRadius: radius,
      background: `repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 6px), linear-gradient(160deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      height: ratio ? undefined : '100%',
      boxShadow: theme === 'dark' ? 'inset 0 0 0 1px rgba(255,255,255,0.04)' : 'inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {label && (
        <div style={{
          position: 'absolute', left: 8, bottom: 6,
          fontFamily: fonts.mono, fontSize: 9, letterSpacing: 0.3,
          color: 'rgba(20,15,5,0.55)', textTransform: 'lowercase',
        }}>┃ {label}</div>
      )}
    </div>
  );
}
