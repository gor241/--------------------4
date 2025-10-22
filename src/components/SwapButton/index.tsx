type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function SwapButton({ onClick, disabled }: Props): JSX.Element {
  return (
    <button
      type="button"
      className="swap-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Поменять валюты местами"
    >
      ⇄
    </button>
  );
}
