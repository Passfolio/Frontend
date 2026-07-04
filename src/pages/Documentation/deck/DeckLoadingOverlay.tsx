import './deckLoadingOverlay.css';

type DeckLoadingOverlayProps = {
    loaded: number;
    total: number;
    /** true가 되면 페이드아웃 시작 — 언마운트는 부모가 페이드 후 수행 */
    dismissed: boolean;
};

/** 덱 진입 게이트 오버레이 — 덱 폰트 로드 전이므로 시스템 폰트로만 표기한다 */
export function DeckLoadingOverlay({ loaded, total, dismissed }: DeckLoadingOverlayProps) {
    const ratio = total > 0 ? Math.min(loaded / total, 1) : 0;
    return (
        <div
            className={`pf-deck-loading${dismissed ? ' is-dismissed' : ''}`}
            role="status"
            aria-busy={!dismissed}
            aria-label="발표 자료 로드 중"
        >
            <p className="label">Loading Presentation</p>
            <div className="track">
                <div className="fill" style={{ transform: `scaleX(${ratio})` }} />
            </div>
            <p className="count">
                {Math.min(loaded, total)} / {total}
            </p>
        </div>
    );
}
