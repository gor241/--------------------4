type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function SwapButton({ onClick, disabled }: Props): JSX.Element {
  return (
    <button
      type="button"
      className="btn"
      onClick={onClick}
      disabled={disabled}
      aria-label="Swap currencies"
    >
      ⇄
    </button>
  );
}
