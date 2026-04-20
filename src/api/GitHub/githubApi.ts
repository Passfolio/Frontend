import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';

export type GitHubRepoType = 'public' | 'private' | 'organization';

export type GitHubRepoItemType = {
  name: string;
  description: string | null;
  language: string | null;
  htmlUrl: string | null;
  fullName?: string | null;
};

export type GitHubRepoListResponseType = {
  type: GitHubRepoType;
  perPage: number;
  nextCursor: string | null;
  repos: GitHubRepoItemType[];
};

type GitHubRepoItemWire = GitHubRepoItemType & {
  html_url?: string | null;
  full_name?: string | null;
};

const normalizeRepoItem = (r: GitHubRepoItemWire): GitHubRepoItemType => ({
  name: r.name,
  description: r.description,
  language: r.language,
  htmlUrl: r.htmlUrl ?? r.html_url ?? null,
  fullName: r.fullName ?? r.full_name ?? null,
});

export const fetchGitHubRepos = async (
  type: GitHubRepoType,
  cursor?: string | null,
): Promise<GitHubRepoListResponseType> => {
  const { data } = await axiosInstance.get<GitHubRepoListResponseType & { repos: GitHubRepoItemWire[] }>(
    API_ENDPOINTS.github.repos,
    { params: { type, ...(cursor ? { cursor } : {}) } },
  );
  return { ...data, repos: data.repos.map(normalizeRepoItem) };
};
