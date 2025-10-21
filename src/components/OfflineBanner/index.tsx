type Props = {
  updatedAt: number | null;
};

export function OfflineBanner({ updatedAt }: Props): JSX.Element {
  const formatted =
    typeof updatedAt === 'number' ? new Date(updatedAt).toLocaleString() : null;

  return (
    <aside className="offline-banner" role="status" aria-live="polite">
      <span>Offline — using cached data</span>
      {formatted ? <span className="offline-banner__time">{formatted}</span> : null}
    </aside>
  );
}
