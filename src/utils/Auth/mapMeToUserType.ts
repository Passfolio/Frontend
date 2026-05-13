import type { UserType } from '@/types/auth.type';
import { ADMIN_DEFAULT_PROFILE_IMAGE_URL } from '@/constants/adminPortal';

export type UserMeResponseType = {
    id: number;
    nickname?: string | null;
    profileImageUrl?: string | null;
    githubLogin?: string | null;
    role?: string | null;
};

// 백엔드가 신규 admin 가입 시 placeholder 로 채워 보내는 외부 GitHub default avatar URL.
// 빈 값과 동일하게 취급해 FE 의 GitHub Invertocat 로고로 정규화한다.
const BACKEND_PROFILE_IMAGE_PLACEHOLDER_URL = 'https://avatars.githubusercontent.com/u/0?v=4';

const normalizeProfileImageUrl = (raw: string | null | undefined): string => {
    const trimmed = raw?.trim() ?? '';
    if (!trimmed || trimmed === BACKEND_PROFILE_IMAGE_PLACEHOLDER_URL) {
        return ADMIN_DEFAULT_PROFILE_IMAGE_URL;
    }
    return trimmed;
};

export const mapMeToUserType = (me: UserMeResponseType): UserType => ({
    id: String(me.id),
    nickname: me.nickname?.trim() || '',
    githubLogin: me.githubLogin?.trim() || '',
    profileImageUrl: normalizeProfileImageUrl(me.profileImageUrl),
    role: me.role || 'USER',
});
