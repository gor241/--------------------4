type Props = {
  online: boolean;
  updatedAt: number | null;
};

export function NetworkBadge({ online, updatedAt }: Props): JSX.Element {
  const status = online ? 'Онлайн' : 'Офлайн';
  const hasTimestamp = typeof updatedAt === 'number';
  const formatted = hasTimestamp ? new Date(updatedAt).toLocaleString('ru-RU') : null;

  return (
    <div
      className="network-badge card"
      role="status"
      aria-live="polite"
      aria-label={status}
    >
      <strong>{status}</strong>
      {formatted ? <span className="muted">{formatted}</span> : null}
    </div>
  );
}
