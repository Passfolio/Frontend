import { useNavigate } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';

type ErrorLayoutProps = {
    code: string;
    label: string;
    title: string;
    description: string;
    primaryAction?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick: () => void };
};

export function ErrorLayout({
    code,
    label,
    title,
    description,
    primaryAction,
    secondaryAction,
}: ErrorLayoutProps) {
    const navigate = useNavigate();

    const defaultPrimary = primaryAction ?? {
        label: '홈으로',
        onClick: () => navigate('/'),
    };

    return (
        <div
            className="flex min-h-screen flex-col bg-[#0d0d0f] text-white"
            style={{
                backgroundImage: [
                    'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    'linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
                ].join(', '),
                backgroundSize: '40px 40px',
            }}
        >
            {/* 배경 글로우 */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: [
                        'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(255,255,255,0.04) 0%, transparent 70%)',
                        'radial-gradient(ellipse 40% 30% at 80% 85%, rgba(255,255,255,0.025) 0%, transparent 70%)',
                    ].join(', '),
                }}
            />

            <main className="relative z-[1] mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
                {/* 에러 코드 */}
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                    {label}
                </p>

                <h1
                    className="mt-4 font-bold leading-none tracking-tight text-white"
                    style={{ fontSize: 'clamp(5rem, 20vw, 8rem)' }}
                    aria-label={code}
                >
                    {code}
                </h1>

                <div
                    className="mt-6 w-full overflow-hidden rounded-2xl border border-white/[0.09] px-6 py-6"
                    style={{
                        background: 'rgba(18,18,22,0.92)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                    }}
                >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={defaultPrimary.onClick}
                        className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors"
                        style={{
                            background: 'rgba(255,255,255,0.09)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                        }}
                    >
                        {defaultPrimary.label}
                    </button>

                    {secondaryAction && (
                        <button
                            type="button"
                            onClick={secondaryAction.onClick}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            </main>

            <LanderFooter />
        </div>
    );
}
