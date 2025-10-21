import { formatMoney } from '@/lib/money';

type Props = {
  value: number | null;
  code: string;
};

export function ResultBlock({ value, code }: Props): JSX.Element {
  const display =
    value === null || Number.isNaN(value) || !Number.isFinite(value)
      ? '—'
      : formatMoney(value, code);

  return (
    <div className="result-block" role="status" aria-live="polite">
      {display}
    </div>
  );
}
