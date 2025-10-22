import { useId } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import { parseAmount } from '@/lib/format';

type Props = {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

export function AmountInput({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  id,
}: Props): JSX.Element {
  const generatedId = useId();
  const inputId = id ?? `amount-input-${generatedId}`;
  const hintId = `${inputId}-hint`;
  const labelText = label ?? 'Amount';
  const placeholderText = placeholder ?? '0';
  const trimmedValue = value.trim();
  const isInvalid = trimmedValue !== '' && Number.isNaN(parseAmount(value));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    // Limit input to digits plus decimal separators; strip any other characters.
    const withoutSpaces = rawValue.replace(/\s+/g, '');
    const sanitized = withoutSpaces.replace(/[^0-9.,]/g, '');

    onChange(sanitized);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <div className="amount-input">
      <label htmlFor={inputId}>{labelText}</label>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        pattern="[0-9.,]*"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholderText}
        aria-invalid={isInvalid}
        aria-describedby={hintId}
        className="input"
      />
      <p id={hintId} className="amount-input__hint muted">
        Use numbers with optional comma or dot for decimals.
      </p>
    </div>
  );
}
