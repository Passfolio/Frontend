import { LanderFooter } from '@/components/Lander/landerFooter';
import { FAQ_LIST } from '@/data/faq';
import '@/pages/Lander/landerPage.css';

export function FaqPage() {
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
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Help</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">자주 묻는 질문</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            서비스 이용 전 알아 두면 좋은 내용을 정리했습니다.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {FAQ_LIST.map((item) => (
            <li key={item.id}>
              <details
                className="group rounded-2xl border border-white/[0.09] px-5 py-4 md:px-6 md:py-5 open:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_4px_24px_-6px_rgba(0,0,0,0.5)]"
                style={{ background: 'rgba(18,18,22,0.92)' }}
              >
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold tracking-tight text-white marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="relative block">
                    {item.question}
                    <span
                      className="pointer-events-none absolute right-0 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    >
                      <i className="fa-solid fa-chevron-down text-[0.65rem]" />
                    </span>
                  </span>
                </summary>
                <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                  {item.paragraphs.map((p, i) => (
                    <p key={i} className="text-[0.92rem] leading-relaxed text-zinc-300">
                      {p}
                    </p>
                  ))}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </main>

      <LanderFooter />
    </div>
  );
}
