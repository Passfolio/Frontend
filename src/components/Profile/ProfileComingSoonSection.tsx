type ProfileComingSoonSectionProps = {
  title: string;
  className?: string;
};

export const ProfileComingSoonSection = ({ title, className }: ProfileComingSoonSectionProps) => {
  return (
    <section
      aria-label={`${title} 준비 중`}
      className={[
        'relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.09] px-6 py-16 text-center',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: 'rgba(18,18,22,0.92)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)',
        }}
      />
      <p className="relative text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Passfolio</p>
      <h2 className="relative mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
        이 영역은 곧 제공될 예정입니다. 우선 프로필과 보유 역량을 채워 두시면 이후 기능과 자연스럽게 연결됩니다.
      </p>
    </section>
  );
};
