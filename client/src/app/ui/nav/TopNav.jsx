/**
 * סרגל ניווט עליון של האפליקציה.
 * מציג מיתוג, כפתור תפריט למובייל, וקישורי ניווט בדסקטופ.
 * @param {Object} props - מאפייני הקומפוננטה.
 * @param {Array<{key: string, label: string, icon: string}>} props.items - פריטי ניווט.
 * @param {string} props.activeTab - הלשונית הפעילה.
 * @param {(tabKey: "home" | "routes" | "ride" | "history" | "bike") => void} props.onNavigate
 * - מעבר בין מסכים לפי מפתח לשונית.
 * @param {() => void} props.onMenuClick - פתיחת תפריט צד במובייל.
 * @param {() => void} [props.onLogout] - פעולת התנתקות גלובלית.
 * @param {boolean} [props.isAuthenticated] - האם המשתמש מחובר.
 * @returns {JSX.Element} כותרת עליונה עם ניווט מותאם מסך.
 */
function TopNav({
  items,
  activeTab,
  onNavigate,
  onMenuClick,
  onLogout,
  isAuthenticated,
}) {
  return (
    /* בלוק top bar עליון קבוע עם שקיפות/blur עדינה */
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur-xl">
        {/* רספונסיביות: תמיד יש דרך להגיע להתנתקות/מגירה בכל רוחב מסך */}
        {/* כפתור המבורגר מוצג עד lg */}
        <button
          type="button"
          className="mv-card inline-flex h-10 w-10 items-center justify-center rounded-xl text-2xl leading-none lg:hidden"
          onClick={onMenuClick}
          aria-label="פתח תפריט"
        >
          ≡
        </button>

        {/* מיתוג יחיד באנגלית */}
        <span className="text-base font-semibold tracking-wide text-white/90 sm:text-lg">
          MotoVibe
        </span>

        {/* ניווט אופקי ופעולות עליונות מ-lg ומעלה */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-2">
            {items.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <li key={item.key}>
                  {/* נגישות: aria-current מסמן לל״ק את הטאב הפעיל */}
                  <button
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className={[
                      "rounded-xl px-3 py-1.5 text-sm transition",
                      isActive
                        ? "mv-card text-emerald-200"
                        : "text-slate-300 hover:text-white",
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}

            <li>
              <button
                type="button"
                onClick={() => onNavigate("bike")}
                className="rounded-xl px-3 py-1.5 text-sm transition text-slate-300 hover:text-white"
              >
                הגדרות
              </button>
            </li>

            {isAuthenticated && (
              <li>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl px-3 py-1.5 text-sm transition mv-card text-emerald-200"
                >
                  התנתקות
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default TopNav;
