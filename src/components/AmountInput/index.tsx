import type { ChangeEvent } from 'react';

type AmountInputProps = {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export function AmountInput({
  value,
  onChange,
  disabled,
}: AmountInputProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder="Enter amount"
      aria-label="Amount"
    />
  );
}
