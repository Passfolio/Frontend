import { createPortal } from 'react-dom';
import { PROFILE_CHIP_SURFACE_CLASS } from '@/constants/profile';

const defaultChipClass = `${PROFILE_CHIP_SURFACE_CLASS} shrink-0 rounded-full px-3 py-1 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]`;

type AllChipsOverlayProps = {
  open: boolean;
  sectionLabel: string;
  chips: string[];
  onClose: () => void;
  /** 기본 칩 스타일 대신 사용 */
  chipClassName?: string;
  titleId?: string;
};

export const AllChipsOverlay = ({
  open,
  sectionLabel,
  chips,
  onClose,
  chipClassName = defaultChipClass,
  titleId = 'all-chips-overlay-title',
}: AllChipsOverlayProps) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={onClose} aria-label="닫기" />
      <div
        className="relative z-[301] mx-auto flex max-h-[min(85dvh,560px)] w-full max-w-[min(100%,420px)] flex-col overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_16px_64px_-8px_rgba(0,0,0,0.55)]"
        style={{
          background: 'linear-gradient(165deg, rgba(28,28,32,0.98) 0%, rgba(12,12,14,0.99) 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
          <div>
            <h3 id={titleId} className="text-sm font-semibold text-white">
              {sectionLabel}
            </h3>
            <p className="text-[0.72rem] text-zinc-500">총 {chips.length}개</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
          >
            닫기
          </button>
        </header>
        <div className="pf-scroll-y min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span key={chip} className={chipClassName}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
