import type { CSSProperties } from 'react';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
};

export function Skeleton({
  width = '100%',
  height = '1rem',
}: SkeletonProps): JSX.Element {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: '0.5rem',
    background:
      'linear-gradient(90deg, rgba(148,163,184,0.16) 25%, rgba(148,163,184,0.32) 37%, rgba(148,163,184,0.16) 63%)',
    animation: 'pulse 1.4s ease infinite',
  };

  return <div aria-hidden="true" style={style} />;
}
