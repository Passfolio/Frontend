import type { UserType } from '@/types/auth.type';
import { ADMIN_DEFAULT_PROFILE_IMAGE_URL } from '@/constants/adminPortal';

export type UserMeResponseType = {
    id: number;
    nickname?: string | null;
    profileImageUrl?: string | null;
    githubLogin?: string | null;
    role?: string | null;
};

export const mapMeToUserType = (me: UserMeResponseType): UserType => ({
    id: String(me.id),
    nickname: me.nickname?.trim() || '',
    githubLogin: me.githubLogin?.trim() || '',
    profileImageUrl: me.profileImageUrl?.trim() || ADMIN_DEFAULT_PROFILE_IMAGE_URL,
    role: me.role || 'USER',
});
