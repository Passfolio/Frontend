import { PROFILE_CHIP_SURFACE_CLASS } from '@/constants/profile';

type JobLink = {
  id: number;
  label: string;
  href: string;
};

const JOB_LINK_LIST: JobLink[] = [
  { id: 1, label: '사람인', href: 'https://www.saramin.co.kr' },
  { id: 2, label: '잡코리아', href: 'https://www.jobkorea.co.kr' },
  { id: 3, label: '원티드', href: 'https://www.wanted.co.kr' },
  { id: 4, label: '링크드인', href: 'https://www.linkedin.com/jobs' },
  { id: 5, label: '잡플래닛', href: 'https://www.jobplanet.co.kr' },
  { id: 6, label: '슈퍼루키', href: 'https://www.superookie.com' },
  { id: 7, label: '자소설닷컴', href: 'https://jasoseol.com' },
  { id: 8, label: '워크넷', href: 'https://www.work.go.kr' },
  { id: 9, label: '인크루트', href: 'https://www.incruit.com' },
  { id: 10, label: '로켓펀치', href: 'https://www.rocketpunch.com' },
];

const jobChipClass = [
  PROFILE_CHIP_SURFACE_CLASS,
  'inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-zinc-300',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]',
  'transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-zinc-200',
].join(' ');

type ProfileJobLinksSectionProps = {
  className?: string;
};

export const ProfileJobLinksSection = ({ className }: ProfileJobLinksSectionProps) => {
  return (
    <section
      aria-label="채용 사이트 바로가기"
      className={[
        'relative flex w-full min-w-0 max-w-[190px] flex-col overflow-hidden rounded-2xl border border-white/[0.09] px-3.5 pt-6 pb-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: 'rgba(18,18,22,0.92)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="mb-5 shrink-0 pl-2 text-left text-[0.78rem] font-semibold leading-snug tracking-wide text-zinc-300">
        채용 사이트
      </p>

      <div className="flex flex-wrap gap-1.5 pl-2">
        {JOB_LINK_LIST.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={jobChipClass}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
};
