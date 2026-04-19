import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD_PX = 20;

export function useNavbarScroll() {
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isNavScrolled };
}
