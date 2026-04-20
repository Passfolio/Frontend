import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ANNOUNCEMENT_LIST } from '@/data/announcements';
import '@/pages/Lander/landerPage.css';

function formatDisplayDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${y}.${m}.${d}`;
}

export function AnnouncementsPage() {
  const sorted = [...ANNOUNCEMENT_LIST].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

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

      <main className="relative z-[1] mx-auto w-full max-w-[720px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
        <header className="mb-10 md:mb-12">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Notice</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">공지사항</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            서비스 업데이트·약관·점검 등 중요 안내를 게시합니다.
          </p>
        </header>

        <ul className="flex flex-col gap-5">
          {sorted.map((item) => (
            <li key={item.id}>
              <article
                className="relative overflow-hidden rounded-2xl border border-white/[0.09] px-5 py-5 md:px-6 md:py-6"
                style={{
                  background: 'rgba(18,18,22,0.92)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {item.pinned ? (
                    <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[0.65rem] font-medium text-zinc-400">
                      고정
                    </span>
                  ) : null}
                  <time
                    className="text-[0.8rem] tabular-nums text-zinc-500"
                    dateTime={item.date}
                  >
                    {formatDisplayDate(item.date)}
                  </time>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{item.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{item.summary}</p>
                <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                  {item.paragraphs.map((p, i) => (
                    <p key={i} className="text-[0.92rem] leading-relaxed text-zinc-300">
                      {p}
                    </p>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>

      <LanderFooter />
    </div>
  );
}
