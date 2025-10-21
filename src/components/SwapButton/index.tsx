type SwapButtonProps = {
  onSwap: () => void;
};

export function SwapButton({ onSwap }: SwapButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onSwap} aria-label="Swap currencies">
      ⇅
    </button>
  );
}
