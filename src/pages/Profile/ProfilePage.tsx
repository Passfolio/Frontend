import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UpdateProfileModal } from '@/components/Profile/UpdateProfileModal/UpdateProfileModal';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ProfileSidebar } from '@/components/Profile/ProfileSidebar';
import { TechStackSection } from '@/components/Profile/TechStackSection';
import { MyCompetenciesSection } from '@/components/Profile/MyCompetenciesSection';
import { ProfileComingSoonSection } from '@/components/Profile/ProfileComingSoonSection';
import { ProjectAnalysisSection } from '@/components/Profile/ProjectAnalysisSection';
import { ProfileMobileSectionTabs } from '@/components/Profile/ProfileMobileSectionTabs';
import { RepositorySection } from '@/components/Profile/RepositorySection';
import { MobileProfileHeader } from '@/components/Profile/MobileProfileHeader';
import { RepositoryAccordion } from '@/components/Profile/RepositoryAccordion';
import { useAuth } from '@/context/Auth/AuthContext';
import {
  MENU_LIST,
  MENU_SECTION_SLUG,
  SECTION_SLUG_TO_MENU,
  type ProfileMenuItemType,
} from '@/constants/profile';
import { JOB_KEYWORD_PREVIEW_MAX } from '@/constants/ui';
import type {
  CareerInfoType,
  CareerReadResponseType,
  DevSpecUpdateResponseType,
  EducationHistoryItemType,
} from '@/api/Spec/specApi';
import { getMyCareer, getMyEducationHistory } from '@/api/Spec/specApi';
import '@/pages/Lander/landerPage.css';

const RoadmapTabSection = lazy(() => import('@/components/Profile/RoadmapTabSection'));

function RoadmapSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <i className="fa-solid fa-spinner animate-spin text-2xl text-zinc-500" />
      <p className="text-sm text-zinc-500">로드맵을 불러오는 중...</p>
    </div>
  );
}

function formatJobKeywordsPreview(keywords: string[]): string {
  const list = keywords.filter(Boolean);
  if (list.length === 0) return '직무 미입력';
  if (list.length <= JOB_KEYWORD_PREVIEW_MAX) return list.join(', ');
  const head = list.slice(0, JOB_KEYWORD_PREVIEW_MAX).join(', ');
  const rest = list.length - JOB_KEYWORD_PREVIEW_MAX;
  return `${head} (외 ${rest}개)`;
}

const EMPTY_SPEC = {
  jobLine: '직무 미입력',
  educationSchool: '학력 미입력',
  educationDepartment: undefined as string | undefined,
  educationDegree: undefined as string | undefined,
  educationDuration: undefined as string | undefined,
  educationHistory: [] as EducationHistoryItemType[],
  careerYearsLabel: '경력 0년',
  techRoles: [] as string[],
  techMajors: [] as string[],
  techSkills: [] as string[],
};

function buildProfileSpecState(
  experience: number,
  career: Pick<CareerReadResponseType, 'careerKeywords' | 'careerMajors' | 'careerSkills'>,
  educationHistory: EducationHistoryItemType[],
) {
  const jobLine = formatJobKeywordsPreview(career.careerKeywords ?? []);
  const firstEdu = educationHistory[0];
  const educationSchool = firstEdu?.name?.trim() ? firstEdu.name : '학력 미입력';
  const educationDepartment = firstEdu?.department?.trim() || undefined;
  const educationDegree = firstEdu?.degree?.trim() || undefined;
  const educationDuration = firstEdu?.duration?.trim() || undefined;
  return {
    jobLine,
    educationSchool,
    educationDepartment,
    educationDegree,
    educationDuration,
    educationHistory,
    careerYearsLabel: `경력 ${experience}년`,
    techRoles: [...(career.careerKeywords ?? [])],
    techMajors: [...(career.careerMajors ?? [])],
    techSkills: [...(career.careerSkills ?? [])],
  };
}

const EMPTY_CAREER: CareerInfoType = {
  careerKeywords: [],
  careerMajors: [],
  careerSkills: [],
};

function pickCareerFromPatch(patch: DevSpecUpdateResponseType): CareerInfoType {
  const list = patch.careers;
  if (!Array.isArray(list) || list.length === 0) return EMPTY_CAREER;
  const first = list[0];
  return {
    careerKeywords: first.careerKeywords ?? [],
    careerMajors: first.careerMajors ?? [],
    careerSkills: first.careerSkills ?? [],
  };
}

function specFromPatch(patch: DevSpecUpdateResponseType) {
  return buildProfileSpecState(
    patch.experience,
    pickCareerFromPatch(patch),
    patch.educationHistory ?? [],
  );
}

export const ProfilePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [spec, setSpec] = useState(EMPTY_SPEC);
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);

  const activeMenu: ProfileMenuItemType = useMemo(() => {
    const slug = searchParams.get('section');
    if (slug && SECTION_SLUG_TO_MENU[slug]) return SECTION_SLUG_TO_MENU[slug];
    return MENU_LIST[0];
  }, [searchParams]);

  const setActiveMenu = useCallback(
    (menu: ProfileMenuItemType) => {
      setSearchParams({ section: MENU_SECTION_SLUG[menu] }, { replace: true });
    },
    [setSearchParams],
  );

  const refreshProfileSpec = useCallback(
    async (
      patchResult?: DevSpecUpdateResponseType,
      options?: { isCancelled?: () => boolean },
    ) => {
      const isCancelled = () => options?.isCancelled?.() === true;
      if (!user?.id) {
        if (!isCancelled()) setSpec(EMPTY_SPEC);
        return;
      }
      try {
        if (patchResult != null && !isCancelled()) {
          setSpec(specFromPatch(patchResult));
        }
        if (isCancelled()) return;
        const [career, educationHistory] = await Promise.all([
          getMyCareer(),
          getMyEducationHistory({ cacheBust: true }),
        ]);
        if (isCancelled()) return;
        setSpec(buildProfileSpecState(career.experience, career, educationHistory));
      } catch {
        if (!isCancelled() && patchResult == null) setSpec(EMPTY_SPEC);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    let cancelled = false;
    void refreshProfileSpec(undefined, { isCancelled: () => cancelled });
    return () => { cancelled = true; };
  }, [refreshProfileSpec]);

  const openUpdateProfile = () => setUpdateProfileOpen(true);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
      <main className="relative z-1 mx-auto flex w-full flex-1 max-w-[1200px] flex-col gap-10 px-4 pb-16 pt-24 md:px-6 md:pt-28 lg:flex-none lg:flex-row lg:items-stretch lg:gap-10 lg:px-10">

        {/* 모바일 */}
        <div className="flex flex-col gap-5 lg:hidden">
          <MobileProfileHeader
            user={user}
            jobLine={spec.jobLine}
            educationSchool={spec.educationSchool}
            careerYearsLabel={spec.careerYearsLabel}
            onUpdateProfile={openUpdateProfile}
          />
          <ProfileMobileSectionTabs activeMenu={activeMenu} onSelect={setActiveMenu} />
          <div className="flex flex-col gap-10">
            {activeMenu === '프로필' ? (
              <>
                <TechStackSection roles={spec.techRoles} majors={spec.techMajors} skills={spec.techSkills} />
                <RepositoryAccordion />
              </>
            ) : activeMenu === '나의 보유 역량' ? (
              <MyCompetenciesSection
                educationHistory={spec.educationHistory}
                jobLine={spec.jobLine}
                careerYearsLabel={spec.careerYearsLabel}
                roles={spec.techRoles}
                majors={spec.techMajors}
                skills={spec.techSkills}
              />
            ) : activeMenu === '프로젝트 분석' ? (
              <ProjectAnalysisSection />
            ) : activeMenu === '로드맵' ? (
              <Suspense fallback={<RoadmapSpinner />}>
                <RoadmapTabSection />
              </Suspense>
            ) : (
              <ProfileComingSoonSection title={activeMenu} />
            )}
          </div>
        </div>

        <ProfileSidebar
          user={user}
          jobLine={spec.jobLine}
          educationSchool={spec.educationSchool}
          careerYearsLabel={spec.careerYearsLabel}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onUpdateProfile={openUpdateProfile}
        />

        {/* 데스크탑 */}
        <section className="hidden min-h-0 w-full flex-1 flex-col gap-11 lg:flex lg:min-h-0">
          {activeMenu === '프로필' ? (
            <>
              <TechStackSection roles={spec.techRoles} majors={spec.techMajors} skills={spec.techSkills} />
              <RepositorySection />
            </>
          ) : activeMenu === '나의 보유 역량' ? (
            <MyCompetenciesSection
              educationHistory={spec.educationHistory}
              jobLine={spec.jobLine}
              careerYearsLabel={spec.careerYearsLabel}
              roles={spec.techRoles}
              majors={spec.techMajors}
              skills={spec.techSkills}
            />
          ) : activeMenu === '프로젝트 분석' ? (
            <ProjectAnalysisSection />
          ) : activeMenu === '로드맵' ? (
            <Suspense fallback={<RoadmapSpinner />}>
              <RoadmapTabSection />
            </Suspense>
          ) : (
            <ProfileComingSoonSection title={activeMenu} />
          )}
        </section>
      </main>

      <LanderFooter />

      {user?.id ? (
        <UpdateProfileModal
          open={updateProfileOpen}
          onClose={() => setUpdateProfileOpen(false)}
          userId={user.id}
          onProfileUpdated={(result) => void refreshProfileSpec(result)}
        />
      ) : null}
    </div>
  );
};
