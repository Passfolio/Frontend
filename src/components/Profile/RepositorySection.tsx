import { RepositoryColumn, type RepositoryColumnConfigType } from './RepositoryColumn';

const REPOSITORY_COLUMN_LIST: RepositoryColumnConfigType[] = [
    { chipLabel: 'Public Repo', type: 'public' },
    { chipLabel: 'Private Repo', type: 'private' },
    { chipLabel: 'Organization Repo', type: 'organization' },
];

export const RepositorySection = () => {
    return (
        <div className="hidden lg:grid min-h-0 grid-cols-1 gap-4 lg:flex-1 lg:min-h-0 lg:grid-cols-3 lg:items-stretch">
            {REPOSITORY_COLUMN_LIST.map((column) => (
                <RepositoryColumn key={column.type} chipLabel={column.chipLabel} type={column.type} />
            ))}
        </div>
    );
};
