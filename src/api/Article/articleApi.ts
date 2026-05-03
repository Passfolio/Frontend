import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    ArticleType,
    ArticleListResponseType,
    ArticleCreateRequestType,
    ArticleUpdateRequestType,
} from '@/types/article.type';

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
    return data;
};

export const createArticle = async (body: ArticleCreateRequestType) => {
    const { data } = await axiosInstance.post<ArticleType>(
        API_ENDPOINTS.articles.create,
        body,
    );
    return data;
};

export const updateArticle = async (id: number, body: ArticleUpdateRequestType) => {
    const { data } = await axiosInstance.patch<ArticleType>(
        API_ENDPOINTS.articles.update(id),
        body,
    );
    return data;
};

export const deleteArticle = async (id: number) => {
    await axiosInstance.delete(API_ENDPOINTS.articles.delete(id));
};
