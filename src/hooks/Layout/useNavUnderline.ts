import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';

export type NavUnderlineStateType = {
  width: number;
  left: number;
  opacity: number;
};

export function useNavUnderline() {
  const [underline, setUnderline] = useState<NavUnderlineStateType>({
    width: 0,
    left: 0,
    opacity: 0,
  });

  const handleLinkMouseEnter = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const { currentTarget } = event;
    setUnderline({
      width: currentTarget.offsetWidth,
      left: currentTarget.offsetLeft,
      opacity: 1,
    });
  }, []);

  const handleLinksMouseLeave = useCallback(() => {
    setUnderline((previous) => ({ ...previous, opacity: 0 }));
  }, []);

  return { underline, handleLinkMouseEnter, handleLinksMouseLeave };
}
