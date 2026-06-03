import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { FileUploadView } from '@/components/AdminPortal/FileUploadView';
import { MyFilesView } from '@/components/AdminPortal/MyFilesView';
import { AdminRoadmapTestView } from '@/components/AdminPortal/AdminRoadmapTestView';
import { useMyFileCdnUrls } from '@/hooks/AdminPortal/useMyFileCdnUrls';
import { ADMIN_PORTAL_PROFILE_PATH } from '@/constants/adminPortal';
import '@/pages/Lander/landerPage.css';

const TEST_VIEW_LIST = ['files', 'upload', 'roadmap'] as const;
type TestViewType = (typeof TEST_VIEW_LIST)[number];

const VIEW_LABEL: Record<TestViewType, string> = {
    files: 'My Files',
    upload: 'Upload',
    roadmap: '로드맵 테스트',
};

const DEFAULT_VIEW: TestViewType = 'files';

const isTestView = (value: string | null): value is TestViewType =>
    value !== null && (TEST_VIEW_LIST as readonly string[]).includes(value);

export const AdminTestPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeView: TestViewType = useMemo(() => {
        const raw = searchParams.get('view');
        return isTestView(raw) ? raw : DEFAULT_VIEW;
    }, [searchParams]);

    const setActiveView = useCallback(
        (view: TestViewType) => {
            setSearchParams({ view }, { replace: true });
        },
        [setSearchParams],
    );

    const { cdnUrlList, isFetching, errorMessage, refresh } = useMyFileCdnUrls();

    return (
        <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
            <main className="relative z-[1] mx-auto w-full max-w-[960px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Admin · Test
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        File Upload Test
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        PDF·이미지를 업로드하고 본인 계정으로 업로드한 파일 목록을 열람합니다.
                    </p>
                </header>

                <div
                    className="mb-6 flex flex-wrap gap-2"
                    role="tablist"
                    aria-label="File Upload Test 보기 전환"
                >
                    {TEST_VIEW_LIST.map((view) => {
                        const isActive = view === activeView;
                        return (
                            <button
                                key={view}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveView(view)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'border-white/30 bg-white/[0.10] text-white'
                                        : 'border-white/[0.10] bg-transparent text-zinc-400 hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
                                }`}
                            >
                                {VIEW_LABEL[view]}
                            </button>
                        );
                    })}
                </div>

                <section
                    aria-labelledby="admin-test-active-view"
                    className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-6"
                >
                    <h2 id="admin-test-active-view" className="sr-only">
                        {VIEW_LABEL[activeView]}
                    </h2>
                    {activeView === 'files' && (
                        <MyFilesView
                            cdnUrlList={cdnUrlList}
                            isFetching={isFetching}
                            errorMessage={errorMessage}
                        />
                    )}
                    {activeView === 'upload' && <FileUploadView onUploaded={refresh} />}
                    {activeView === 'roadmap' && <AdminRoadmapTestView />}
                </section>

                <div className="mt-12">
                    <Link
                        to={ADMIN_PORTAL_PROFILE_PATH}
                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                        ← 관리자 홈으로
                    </Link>
                </div>
            </main>

            <LanderFooter />
        </div>
    );
};
