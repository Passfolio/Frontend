import { useUserList } from '@/hooks/AdminPortal/useUserList';

// 회원 목록 탭 — 페이지네이션 테이블(우선 ID·닉네임).
export const UserListView = () => {
    const { page, setPage, pageData, isLoading, errorMessage } = useUserList();

    const totalPages = pageData?.page.totalPages ?? 0;
    const totalElements = pageData?.page.totalElements ?? 0;
    const hasPrev = pageData?.page.hasPrev ?? false;
    const hasNext = pageData?.page.hasNext ?? false;
    const rowList = pageData?.content ?? [];

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500">
                    총 <span className="font-semibold tabular-nums text-white">{totalElements}</span>명
                </p>
                <p className="text-xs text-zinc-600">우선 ID·닉네임 (추후 필드 확장)</p>
            </div>

            {isLoading && (
                <div className="flex min-h-[240px] items-center justify-center">
                    <p className="text-sm text-zinc-500">불러오는 중…</p>
                </div>
            )}
            {!isLoading && errorMessage && (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                    <p className="text-sm text-amber-200/90">{errorMessage}</p>
                </div>
            )}
            {!isLoading && !errorMessage && (
                <>
                    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.08] text-zinc-500">
                                    <th className="w-24 px-4 py-3 font-medium">ID</th>
                                    <th className="px-4 py-3 font-medium">닉네임</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowList.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-zinc-500">
                                            회원이 없습니다.
                                        </td>
                                    </tr>
                                )}
                                {rowList.map((user) => (
                                    <tr key={user.userId} className="border-b border-white/[0.05] last:border-0">
                                        <td className="px-4 py-3 tabular-nums text-zinc-400">{user.userId}</td>
                                        <td className="px-4 py-3 text-zinc-200">{user.nickname}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={!hasPrev}
                            onClick={() => setPage(Math.max(0, page - 1))}
                            className="rounded-full border border-white/[0.10] px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            이전
                        </button>
                        <span className="text-xs tabular-nums text-zinc-500">
                            {totalPages === 0 ? 0 : page + 1} / {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={!hasNext}
                            onClick={() => setPage(page + 1)}
                            className="rounded-full border border-white/[0.10] px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
