import { useEffect, useRef } from 'react';

const REVEAL_SELECTOR = '.reveal, .reveal-left, .reveal-left-how, .reveal-up';

export function useRevealOnScroll<T extends HTMLElement>(watchKey?: string | number) {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elementList = root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove('active');
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );

    elementList.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [watchKey]);

  return rootRef;
}
