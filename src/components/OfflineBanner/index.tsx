type Props = {
  updatedAt: number | null;
};

export function OfflineBanner({ updatedAt }: Props): JSX.Element {
  const formatted =
    typeof updatedAt === 'number' ? new Date(updatedAt).toLocaleString() : null;

  return (
    <aside className="offline-banner" role="status" aria-live="polite">
      {formatted ? (
        <span>Using cached rates from {formatted}</span>
      ) : (
        <span>Offline — using cached data</span>
      )}
    </aside>
  );
}
