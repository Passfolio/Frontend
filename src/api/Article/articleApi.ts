import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    ArticleType,
    ArticleListResponseType,
    ArticleCreateRequestType,
    ArticleUpdateRequestType,
} from '@/types/article.type';

const ARTICLE_FILE_URLS_LOG_PREFIX = '[Passfolio][Article][fileUrls]';

const logArticleFileUrls = (phase: string, payload: Record<string, unknown>) => {
    console.info(ARTICLE_FILE_URLS_LOG_PREFIX, phase, payload);
};

export const listArticles = async (params: {
    page: number;
    size: number;
    sort?: string;
    direction?: string;
}) => {
    const { data } = await axiosInstance.get<ArticleListResponseType>(
        API_ENDPOINTS.articles.list,
        { params },
    );
    return data;
};

export const getArticleById = async (id: number) => {
    const { data } = await axiosInstance.get<ArticleType>(
        API_ENDPOINTS.articles.detail(id),
    );
    logArticleFileUrls('getArticleById:response', {
        articleId: id,
        fileUrls: data.fileUrls,
        fileUrlsLength: data.fileUrls?.length ?? 0,
        thumbnail: data.thumbnail,
    });
    return data;
};

export const createArticle = async (body: ArticleCreateRequestType) => {
    logArticleFileUrls('createArticle:request', {
        fileUrls: body.fileUrls,
        fileUrlsLength: body.fileUrls?.length ?? 0,
        hasFileUrlsKey: Object.prototype.hasOwnProperty.call(body, 'fileUrls'),
    });
    const { data } = await axiosInstance.post<ArticleType>(
        API_ENDPOINTS.articles.create,
        body,
    );
    logArticleFileUrls('createArticle:response', {
        articleId: data.id,
        fileUrls: data.fileUrls,
        fileUrlsLength: data.fileUrls?.length ?? 0,
    });
    return data;
};

export const updateArticle = async (id: number, body: ArticleUpdateRequestType) => {
    logArticleFileUrls('updateArticle:request', {
        articleId: id,
        fileUrls: body.fileUrls,
        fileUrlsLength: body.fileUrls?.length ?? 0,
        hasFileUrlsKey: Object.prototype.hasOwnProperty.call(body, 'fileUrls'),
    });
    const { data } = await axiosInstance.patch<ArticleType>(
        API_ENDPOINTS.articles.update(id),
        body,
    );
    logArticleFileUrls('updateArticle:response', {
        articleId: data.id,
        fileUrls: data.fileUrls,
        fileUrlsLength: data.fileUrls?.length ?? 0,
    });
    return data;
};

export const deleteArticle = async (id: number) => {
    await axiosInstance.delete(API_ENDPOINTS.articles.delete(id));
};
