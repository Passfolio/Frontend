import { useCallback, useRef } from 'react';

export const useDebouncedCallback = <T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number,
) => {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    const t = useRef<ReturnType<typeof setTimeout> | null>(null);
    return useCallback(
        (...args: T) => {
            if (t.current) clearTimeout(t.current);
            t.current = setTimeout(() => fnRef.current(...args), delay);
        },
        [delay],
    );
};
