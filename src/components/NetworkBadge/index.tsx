type Props = {
  online: boolean;
  updatedAt: number | null;
};

export function NetworkBadge({ online, updatedAt }: Props): JSX.Element {
  const status = online ? 'Online' : 'Offline';
  const hasTimestamp = typeof updatedAt === 'number';
  const formatted = hasTimestamp ? new Date(updatedAt).toLocaleString() : null;

  return (
    <div className="network-badge" role="status" aria-live="polite">
      <strong>{status}</strong>
      {formatted ? <span className="network-badge__time">{formatted}</span> : null}
      {!online && formatted ? (
        <span className="network-badge__hint">Using cached rates from {formatted}</span>
      ) : null}
    </div>
  );
}
