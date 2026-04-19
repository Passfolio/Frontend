import { useState } from 'react';
import { RepositoryColumn } from './RepositorySection';
import type { GitHubRepoType } from '@/apis/githubApi';

type AccordionItem = {
    label: string;
    chipLabel: string;
    type: GitHubRepoType;
};

const ACCORDION_ITEMS: AccordionItem[] = [
    { label: 'Public Repository', chipLabel: 'Public Repo', type: 'public' },
    { label: 'Private Repository', chipLabel: 'Private Repo', type: 'private' },
    { label: 'Organization Repository', chipLabel: 'Organization Repo', type: 'organization' },
];

export const RepositoryAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <div className="flex flex-col gap-3">
            {ACCORDION_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={item.type}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.10] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-shadow duration-300"
                        style={{
                            background: isOpen
                                ? 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.06) 100%)'
                                : 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            boxShadow: isOpen
                                ? '0 8px_32px_-8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)'
                                : undefined,
                        }}
                    >
                        {/* 상단 specular highlight */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                        {/* 아코디언 헤더 버튼 */}
                        <button
                            type="button"
                            onClick={() => handleToggle(index)}
                            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-150 hover:bg-white/[0.04] active:bg-white/[0.02]"
                        >
                            <span className={`text-sm font-semibold transition-colors duration-200 ${isOpen ? 'text-white' : 'text-white/80'}`}>
                                {item.label}
                            </span>
                            <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 ${
                                    isOpen ? 'rotate-180 border-white/25 bg-white/10' : 'bg-white/[0.05]'
                                }`}
                            >
                                <svg
                                    className="h-3.5 w-3.5 text-zinc-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {/* 아코디언 구분선 */}
                        {isOpen && (
                            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        )}

                        {/* 아코디언 본문 */}
                        {isOpen && (
                            <div className="px-3 pb-3 pt-1">
                                <RepositoryColumn chipLabel={item.chipLabel} type={item.type} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
