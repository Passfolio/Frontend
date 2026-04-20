type DeleteAccountConfirmModalProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export const DeleteAccountConfirmModal = ({
    isOpen,
    onConfirm,
    onCancel,
}: DeleteAccountConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[3000] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-dialog-title"
                style={{
                    background: 'linear-gradient(160deg, rgba(28,28,32,0.97) 0%, rgba(15,16,18,0.99) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
                    maxWidth: 360,
                    width: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pb-6 pt-5">
                    <h2
                        id="delete-dialog-title"
                        className="text-base font-semibold text-white"
                    >
                        계정을 삭제하시겠습니까?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        계정 삭제는 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                    </p>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
                            style={{
                                background: 'linear-gradient(135deg, rgba(220,38,38,0.85) 0%, rgba(185,28,28,0.90) 100%)',
                                border: '1px solid rgba(220,38,38,0.3)',
                                boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
                            }}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
