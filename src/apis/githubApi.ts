import { axiosInstance } from '@/utils/Auth/axiosInstance';

export type GitHubRepoType = 'public' | 'private' | 'organization';

export type GitHubRepoItem = {
  name: string;
  description: string | null;
  language: string | null;
  /** GitHub 웹 UI 주소 (`https://github.com/owner/repo`). 캐시 구버전 등으로 없을 수 있음 */
  htmlUrl: string | null;
  /** `owner/repo`. htmlUrl이 없을 때 링크 조합용 (구 캐시 응답에는 없을 수 있음) */
  fullName?: string | null;
};

export type GitHubRepoListResponse = {
  type: GitHubRepoType;
  perPage: number;
  nextCursor: string | null;
  repos: GitHubRepoItem[];
};

type GitHubRepoItemWire = GitHubRepoItem & {
  html_url?: string | null;
  full_name?: string | null;
};

const normalizeRepoItem = (r: GitHubRepoItemWire): GitHubRepoItem => ({
  name: r.name,
  description: r.description,
  language: r.language,
  htmlUrl: r.htmlUrl ?? r.html_url ?? null,
  fullName: r.fullName ?? r.full_name ?? null,
});

export const fetchGitHubRepos = async (
  type: GitHubRepoType,
  cursor?: string | null,
): Promise<GitHubRepoListResponse> => {
  const { data } = await axiosInstance.get<GitHubRepoListResponse & { repos: GitHubRepoItemWire[] }>(
    '/api/v1/github/repos',
    {
      params: {
        type,
        ...(cursor ? { cursor } : {}),
      },
    },
  );

  return {
    ...data,
    repos: data.repos.map(normalizeRepoItem),
  };
};
