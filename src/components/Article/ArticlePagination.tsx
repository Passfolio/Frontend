type ArticlePaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export function ArticlePagination({ page, totalPages, onPageChange }: ArticlePaginationProps) {
    if (totalPages <= 1) return null;

    // page is 0-based; display is 1-based
    const currentDisplay = page + 1;

    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | '...')[] = [];

        if (currentDisplay <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentDisplay >= totalPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentDisplay - 1; i <= currentDisplay + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const buttonBase =
        'flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl border px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-40';
    const inactiveStyle = 'border-white/[0.09] text-zinc-400 hover:border-white/[0.18] hover:text-white';
    const activeStyle = 'border-white/[0.24] bg-white/[0.09] text-white';

    return (
        <nav
            role="navigation"
            aria-label="페이지 탐색"
            className="flex items-center justify-center gap-1.5"
        >
            {/* 이전 버튼 */}
            <button
                type="button"
                className={`${buttonBase} ${inactiveStyle}`}
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                aria-label="이전 페이지"
            >
                ‹
            </button>

            {/* 페이지 번호 */}
            {pageNumbers.map((num, idx) =>
                num === '...' ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="flex h-9 w-6 items-center justify-center text-sm text-zinc-600"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={num}
                        type="button"
                        className={`${buttonBase} ${num === currentDisplay ? activeStyle : inactiveStyle}`}
                        onClick={() => onPageChange((num as number) - 1)}
                        aria-label={`${num} 페이지`}
                        aria-current={num === currentDisplay ? 'page' : undefined}
                        disabled={num === currentDisplay}
                    >
                        {num}
                    </button>
                ),
            )}

            {/* 다음 버튼 */}
            <button
                type="button"
                className={`${buttonBase} ${inactiveStyle}`}
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="다음 페이지"
            >
                ›
            </button>
        </nav>
    );
}
