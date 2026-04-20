export type UserType = {
    id: string;
    nickname: string;
    profileImageUrl: string;
    githubLogin: string;
    role: string;
};

export type AuthContextType = {
    user: UserType | null;
    loginUser: (userData: UserType) => void;
    logoutUser: () => void;
};
