import { useCallback, useState, type KeyboardEvent } from 'react';

export function useKeyboardListNav(length: number, onSelect: (index: number) => void) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const clampIndex = useCallback(
    (index: number) => {
      if (length === 0) {
        return 0;
      }

      if (index < 0) {
        return length - 1;
      }

      if (index >= length) {
        return 0;
      }

      return index;
    },
    [length],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          setHighlightedIndex((index: number) => clampIndex(index + 1));
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setHighlightedIndex((index: number) => clampIndex(index - 1));
          break;
        }
        case 'Enter': {
          event.preventDefault();
          onSelect(highlightedIndex);
          break;
        }
        case 'Escape': {
          event.preventDefault();
          onSelect(-1);
          break;
        }
        default:
          break;
      }
    },
    [clampIndex, highlightedIndex, onSelect],
  );

  return {
    highlightedIndex,
    handleKeyDown,
    setHighlightedIndex,
  };
}
