type NetworkBadgeProps = {
  online: boolean;
  lastChangedAt: number | null;
};

export function NetworkBadge({ online, lastChangedAt }: NetworkBadgeProps): JSX.Element {
  return (
    <div role="status" aria-live="polite">
      <strong>{online ? 'Online' : 'Offline'}</strong>
      {!online && lastChangedAt && (
        <span>Using cached rates from {new Date(lastChangedAt).toLocaleString()}</span>
      )}
    </div>
  );
}
