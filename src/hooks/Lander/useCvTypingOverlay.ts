import { useEffect, useRef } from 'react';

const WINDOW_LEN = 5;
const STEP_MS = 54;
const LEVEL_CLASS_LIST = ['is-0', 'is-1', 'is-2', 'is-3', 'is-4'] as const;

function segmentGraphemeList(text: string): string[] {
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' });
      return Array.from(seg.segment(text), (s) => s.segment);
    }
  } catch {
    /* ignore */
  }
  return Array.from(text);
}

export function useCvTypingOverlay() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const baseP = stage.querySelector('p');
    if (!baseP) return;

    const overlay = document.createElement('div');
    overlay.className = 'cv-type-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const graphemeElementList: HTMLSpanElement[] = [];

    for (const node of baseP.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const normalized =
          node.textContent
            ?.replace(/\n+/g, ' ')
            .replace(/\s{2,}/g, ' ') ?? '';
        for (const g of segmentGraphemeList(normalized)) {
          const span = document.createElement('span');
          span.textContent = g;
          overlay.appendChild(span);
          graphemeElementList.push(span);
        }
      } else if (node.nodeName === 'BR') {
        overlay.appendChild(document.createElement('br'));
      }
    }
    stage.appendChild(overlay);

    let isInView = false;
    let isAnimating = false;
    let recentScrollDown = false;
    let scrollDownTimer: ReturnType<typeof setTimeout> | null = null;
    let lastScrollY = window.scrollY;
    let animationFrameId = 0;

    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY) {
        recentScrollDown = true;
        if (scrollDownTimer) clearTimeout(scrollDownTimer);
        scrollDownTimer = setTimeout(() => {
          recentScrollDown = false;
        }, 450);
      }
      lastScrollY = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    function clearLevels(element: HTMLElement) {
      for (const cls of LEVEL_CLASS_LIST) {
        element.classList.remove(cls);
      }
    }

    function clearAll() {
      graphemeElementList.forEach(clearLevels);
    }

    function applyWindow(endIdx: number, prevEndIdx: number) {
      const start = Math.max(0, endIdx - (WINDOW_LEN - 1));
      const prevStart = Math.max(0, prevEndIdx - (WINDOW_LEN - 1));

      for (let i = prevStart; i <= prevEndIdx; i++) {
        if (i >= 0 && i < graphemeElementList.length) clearLevels(graphemeElementList[i]);
      }

      for (let i = endIdx; i >= start; i--) {
        const distance = endIdx - i;
        if (distance < LEVEL_CLASS_LIST.length && i >= 0 && i < graphemeElementList.length) {
          graphemeElementList[i].classList.add(LEVEL_CLASS_LIST[distance]);
        }
      }
    }

    function runTyping() {
      if (isAnimating) return;
      isAnimating = true;
      let end = -1;
      let prevEnd = -1;
      const n = graphemeElementList.length;
      let acc = 0;
      let lastTs: number | null = null;

      function step(ts: number) {
        if (lastTs === null) lastTs = ts;
        acc += ts - lastTs;
        lastTs = ts;

        while (acc >= STEP_MS) {
          acc -= STEP_MS;
          end++;
          if (end >= n) {
            animationFrameId = requestAnimationFrame(() => {
              clearAll();
              isAnimating = false;
            });
            return;
          }
          applyWindow(end, prevEnd);
          prevEnd = end;
        }
        animationFrameId = requestAnimationFrame(step);
      }
      animationFrameId = requestAnimationFrame(step);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (isInView) continue;
            isInView = true;
          } else {
            isInView = false;
            continue;
          }
          const deepEnough = window.scrollY > 120;
          if (!recentScrollDown && !deepEnough) continue;
          runTyping();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (scrollDownTimer) clearTimeout(scrollDownTimer);
      cancelAnimationFrame(animationFrameId);
      overlay.remove();
    };
  }, []);

  return stageRef;
}
