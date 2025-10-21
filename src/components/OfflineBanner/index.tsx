type OfflineBannerProps = {
  visible: boolean;
  timestamp: number | null;
};

export function OfflineBanner({
  visible,
  timestamp,
}: OfflineBannerProps): JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <aside role="status" aria-live="assertive">
      <p>Offline mode enabled.</p>
      {timestamp && (
        <small>Using cached rates from {new Date(timestamp).toLocaleString()}</small>
      )}
    </aside>
  );
}
