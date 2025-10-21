type CurrencySelectProps = {
  label: string;
  value: string;
  onOpenModal: () => void;
};

export function CurrencySelect({
  label,
  value,
  onOpenModal,
}: CurrencySelectProps): JSX.Element {
  return (
    <button type="button" onClick={onOpenModal} aria-label={label}>
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  );
}
