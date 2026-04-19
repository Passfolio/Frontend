import { useEffect } from 'react';

export function useClickOutside(
    ref: React.RefObject<HTMLElement | null>,
    handler: () => void,
    enabled = true,
) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (e: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(e.target as Node)) return;
            handler();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handler();
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [ref, handler, enabled]);
}
