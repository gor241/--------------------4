type Props = {
  updatedAt: number | null;
};

export function OfflineBanner({ updatedAt }: Props): JSX.Element {
  const formatted =
    typeof updatedAt === 'number' ? new Date(updatedAt).toLocaleString('ru-RU') : null;

  return (
    <aside className="offline-banner" role="status" aria-live="polite">
      {formatted ? (
        <span>Используются курсы из кеша от {formatted}</span>
      ) : (
        <span>Автономный режим — используются кешированные данные</span>
      )}
    </aside>
  );
}
