import { formatCurrency } from '@/lib/format';

type ResultBlockProps = {
  amount: number;
  from: string;
  to: string;
  converted: number | null;
  rate: number | null;
};

export function ResultBlock({
  amount,
  from,
  to,
  converted,
  rate,
}: ResultBlockProps): JSX.Element {
  const formattedAmount = formatCurrency(amount, from);
  const formattedConverted = formatCurrency(converted, to);
  const formattedRate = formatCurrency(rate, to);

  return (
    <section aria-live="polite">
      <p>
        {formattedAmount} → {to}
      </p>
      <p>{formattedConverted}</p>
      {rate !== null && (
        <small>
          1 {from} = {formattedRate}
        </small>
      )}
    </section>
  );
}
