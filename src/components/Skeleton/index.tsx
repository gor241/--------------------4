import type { CSSProperties } from 'react';

type Props = {
  lines?: number;
};

const BASE_STYLE: CSSProperties = {
  width: '100%',
  height: '1rem',
  borderRadius: '0.5rem',
  background:
    'linear-gradient(90deg, rgba(148,163,184,0.16) 25%, rgba(148,163,184,0.32) 37%, rgba(148,163,184,0.16) 63%)',
  animation: 'pulse 1.4s ease-in-out infinite',
};

export function Skeleton({ lines = 1 }: Props): JSX.Element {
  const count = Number.isFinite(lines) && lines > 0 ? Math.ceil(lines) : 1;

  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const style = {
          ...BASE_STYLE,
          animationDelay: `${index * 0.15}s`,
          marginTop: index === 0 ? 0 : '0.5rem',
        } satisfies CSSProperties;

        return <div key={index} className="skeleton__line" style={style} />;
      })}
    </div>
  );
}
