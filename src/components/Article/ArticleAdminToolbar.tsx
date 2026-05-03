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
                    to="/articles/new"
                    className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
                >
                    새 글 작성
                </Link>
            </div>
        );
    }

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) {
            return;
        }
        await deleteArticle(props.articleId);
        navigate('/articles', { replace: true });
    };

    return (
        <div className="flex gap-2">
            <Link
                to={`/articles/${props.articleId}/edit`}
                className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
            >
                수정
            </Link>
            <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/[0.16]"
            >
                삭제
            </button>
        </div>
    );
}
