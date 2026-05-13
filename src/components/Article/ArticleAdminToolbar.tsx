import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';
import { deleteArticle } from '@/api/Article/articleApi';

type ArticleAdminToolbarProps =
    | { mode: 'list' }
    | { mode: 'detail'; articleId: number };

export function ArticleAdminToolbar(props: ArticleAdminToolbarProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.role !== 'ADMIN') {
        return null;
    }

    if (props.mode === 'list') {
        return (
            <div className="flex justify-end">
                <Link
                    to="/articles/create"
                    className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
                >
                    새 글 작성
                </Link>
            </div>
        );
    }

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

    const handleDelete = async () => {
        if (isDeleting) return;
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        setIsDeleting(true);
        setDeleteErrorMessage(null);
        try {
            await deleteArticle(props.articleId);
            // 성공 시 페이지 언마운트되므로 isDeleting 해제 불필요
            navigate('/articles', { replace: true });
        } catch {
            setDeleteErrorMessage('삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
                <Link
                    to={`/articles/${props.articleId}/edit`}
                    aria-disabled={isDeleting}
                    className={`rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10] ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}
                >
                    수정
                </Link>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-4 py-2 text-sm font-medium text-red-400 transition-colors enabled:hover:bg-red-500/[0.16] disabled:opacity-60"
                >
                    {isDeleting ? '삭제 중…' : '삭제'}
                </button>
            </div>
            {deleteErrorMessage && (
                <p role="alert" className="text-xs text-red-400">
                    {deleteErrorMessage}
                </p>
            )}
        </div>
    );
}
