export type ArticleType = {
    id: number;
    title: string;
    contents: string;
    fileUrls: string[];
    thumbnail: string | null;
    writerId: number;
    writerNickname: string | null;
    createdAt: string;
    lastModifiedAt: string;
};

export type ArticlePageItemType = {
    id: number;
    title: string;
    thumbnail: string | null;
    createdAt: string;
    writerId: number;
};

export type PageInfoType = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export type ArticleListResponseType = {
    title: string;
    page: PageInfoType;
    content: ArticlePageItemType[];
};

export type ArticleCreateRequestType = {
    title: string;
    contents: string;
    fileUrls?: string[];
};

export type ArticleUpdateRequestType = {
    title?: string;
    contents?: string;
    fileUrls?: string[];
};
