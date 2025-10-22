import type { CSSProperties } from 'react';

type Props = {
  lines?: number;
};

export function Skeleton({ lines = 1 }: Props): JSX.Element {
  const count = Number.isFinite(lines) && lines > 0 ? Math.ceil(lines) : 1;

  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const style = {
          animationDelay: `${index * 0.15}s`,
          marginTop: index === 0 ? 0 : '0.5rem',
        } satisfies CSSProperties;

        return <div key={index} className="skeleton__line" style={style} />;
      })}
    </div>
  );
}
