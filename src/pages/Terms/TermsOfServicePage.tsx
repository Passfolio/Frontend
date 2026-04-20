import { LanderFooter } from '@/components/Lander/LanderFooter';
import { TERMS_EFFECTIVE_DATE, TERMS_SECTION_LIST } from '@/data/termsOfService';
import '@/pages/Lander/landerPage.css';

function formatEffectiveDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${y}년 ${m}월 ${d}일`;
}

export function TermsOfServicePage() {
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
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">이용약관</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Passfolio 서비스 이용에 관한 기본 규정입니다.
          </p>
          <p className="mt-2 text-[0.85rem] tabular-nums text-zinc-500">
            시행일 {formatEffectiveDate(TERMS_EFFECTIVE_DATE)}
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {TERMS_SECTION_LIST.map((section) => (
            <section key={section.id} aria-labelledby={`terms-${section.id}`}>
              <h2 id={`terms-${section.id}`} className="text-lg font-semibold tracking-tight text-white md:text-xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-[0.92rem] leading-[1.75] text-zinc-300">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <LanderFooter />
    </div>
  );
}
