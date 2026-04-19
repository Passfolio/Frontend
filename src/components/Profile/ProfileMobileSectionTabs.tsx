import type { ProfileMenuItem } from '@/constants/profile';
import { MENU_LIST } from '@/constants/profile';

type ProfileMobileSectionTabsProps = {
  activeMenu: ProfileMenuItem;
  onSelect: (menu: ProfileMenuItem) => void;
};

export const ProfileMobileSectionTabs = ({ activeMenu, onSelect }: ProfileMobileSectionTabsProps) => {
  return (
    <div className="lg:hidden">
      <div
        className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="프로필 섹션"
      >
        {MENU_LIST.map((item) => {
          const selected = activeMenu === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(item)}
              className={[
                'shrink-0 rounded-full border px-3.5 py-2 text-[0.78rem] font-medium transition-colors',
                selected
                  ? 'border-white/25 bg-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                  : 'border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/15 hover:text-zinc-300',
              ].join(' ')}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};
