import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UpdateProfileModal } from '@/components/Profile/UpdateProfileModal';
import { LanderFooter } from '@/components/Lander/landerFooter';
import { ProfileSidebar } from '@/components/Profile/ProfileSidebar';
import { TechStackSection } from '@/components/Profile/TechStackSection';
import { MyCompetenciesSection } from '@/components/Profile/MyCompetenciesSection';
import { ProfileComingSoonSection } from '@/components/Profile/ProfileComingSoonSection';
import { ProfileMobileSectionTabs } from '@/components/Profile/ProfileMobileSectionTabs';
import { RepositorySection } from '@/components/Profile/RepositorySection';
import { MobileProfileHeader } from '@/components/Profile/MobileProfileHeader';
import { RepositoryAccordion } from '@/components/Profile/RepositoryAccordion';
import { useAuth } from '@/context/Auth/AuthContext';
import {
  MENU_LIST,
  MENU_SECTION_SLUG,
  SECTION_SLUG_TO_MENU,
  type ProfileMenuItem,
} from '@/constants/profile';
import type {
  CareerInfo,
  CareerReadResponse,
  DevSpecUpdateResponse,
  EducationHistoryItem,
} from '@/apis/specApi';
import { getMyCareer, getMyEducationHistory } from '@/apis/specApi';
import '@/pages/Lander/landerPage.css';

/** 사이드바·모바일 헤더 직무 한 줄: 상위 N개만 표시, 나머지는 (외 M개) */
const JOB_KEYWORD_PREVIEW_MAX = 3;

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
  educationHistory: [] as EducationHistoryItem[],
  careerYearsLabel: '경력 0년',
  techRoles: [] as string[],
  techMajors: [] as string[],
  techSkills: [] as string[],
};

function buildProfileSpecState(
  experience: number,
  career: Pick<CareerReadResponse, 'careerKeywords' | 'careerMajors' | 'careerSkills'>,
  educationHistory: EducationHistoryItem[],
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

const EMPTY_CAREER: CareerInfo = {
  careerKeywords: [],
  careerMajors: [],
  careerSkills: [],
};

function pickCareerFromPatch(patch: DevSpecUpdateResponse): CareerInfo {
  const list = patch.careers;
  if (!Array.isArray(list) || list.length === 0) return EMPTY_CAREER;
  const first = list[0];
  return {
    careerKeywords: first.careerKeywords ?? [],
    careerMajors: first.careerMajors ?? [],
    careerSkills: first.careerSkills ?? [],
  };
}

/** PATCH 직후 GET 전에 화면에 반영 (서버 응답 본문 기준) */
function specFromPatch(patch: DevSpecUpdateResponse) {
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

  const activeMenu: ProfileMenuItem = useMemo(() => {
    const slug = searchParams.get('section');
    if (slug && SECTION_SLUG_TO_MENU[slug]) return SECTION_SLUG_TO_MENU[slug];
    return MENU_LIST[0];
  }, [searchParams]);

  const setActiveMenu = useCallback(
    (menu: ProfileMenuItem) => {
      setSearchParams({ section: MENU_SECTION_SLUG[menu] }, { replace: true });
    },
    [setSearchParams],
  );

  const refreshProfileSpec = useCallback(async (patchResult?: DevSpecUpdateResponse) => {
    if (!user?.id) {
      setSpec(EMPTY_SPEC);
      return;
    }
    try {
      if (patchResult != null) {
        setSpec(specFromPatch(patchResult));  // 즉각 반영
      }
      const [career, educationHistory] = await Promise.all([
        getMyCareer(),
        getMyEducationHistory({ cacheBust: true }),
      ]);
      setSpec(buildProfileSpecState(career.experience, career, educationHistory));
    } catch {
      if (patchResult == null) setSpec(EMPTY_SPEC);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshProfileSpec();
  }, [refreshProfileSpec]);

  return (
      <div
          className="flex min-h-screen flex-col bg-[#0d0d0f] text-white"
          style={{
            backgroundImage: [
              'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px)',
              'linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '40px 40px',
            backgroundPosition: 'center top',
          }}
      >
        <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
                background: [
                    'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(255,255,255,0.04) 0%, transparent 70%)',
                    'radial-gradient(ellipse 40% 30% at 80% 85%, rgba(255,255,255,0.025) 0%, transparent 70%)',
                ].join(', '),
            }}
        />
        <main className="relative z-[1] mx-auto flex w-full flex-1 max-w-[1200px] flex-col gap-10 px-4 pb-16 pt-24 md:px-6 md:pt-28 lg:flex-none lg:flex-row lg:items-stretch lg:gap-10 lg:px-10">

          <div className="flex flex-col gap-5 lg:hidden">
            <MobileProfileHeader
                user={user}
                jobLine={spec.jobLine}
                educationSchool={spec.educationSchool}
                careerYearsLabel={spec.careerYearsLabel}
                onUpdateProfile={() => setUpdateProfileOpen(true)}
            />
            <ProfileMobileSectionTabs activeMenu={activeMenu} onSelect={setActiveMenu} />
            <div className="flex flex-col gap-10">
              {activeMenu === '프로필' ? (
                <>
                  <TechStackSection
                      roles={spec.techRoles}
                      majors={spec.techMajors}
                      skills={spec.techSkills}
                  />
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
              onUpdateProfile={() => setUpdateProfileOpen(true)}
          />

          <section className="hidden min-h-0 w-full flex-1 flex-col gap-11 lg:flex lg:min-h-0">
            {activeMenu === '프로필' ? (
                <>
                    <TechStackSection
                        roles={spec.techRoles}
                        majors={spec.techMajors}
                        skills={spec.techSkills}
                    />
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
