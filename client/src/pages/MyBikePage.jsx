/**
 * MyBikePage — מסך "האופנוע שלי".
 * רכיב Stateless: מקבל את כל הנתונים וה-Handlers כ-Props מ-App.jsx.
 */

import Button from "../app/ui/components/Button";
import GlassCard from "../app/ui/components/GlassCard";

/**
 * באנר רכיבה פעילה — מוצג בטאבים שאינם מסך הרכיבה.
 */
function ActiveRideBanner({ isRideActive, isRideMinimized, onNavigate }) {
  if (!isRideActive || isRideMinimized) {
    return null;
  }

  return (
    <section className="mv-card mb-5 flex items-center justify-between gap-3 px-4 py-2.5">
      <span className="text-sm text-emerald-200">יש רכיבה פעילה</span>
      <Button variant="ghost" size="md" onClick={() => onNavigate("ride")}>
        חזור לרכיבה
      </Button>
    </section>
  );
}

/**
 * @param {Object} props
 * @param {boolean} props.isRideActive
 * @param {boolean} props.isRideMinimized
 * @param {Function} props.onNavigate
 * @param {Array} props.bikes - רשימת אופנועים מהשרת.
 * @param {boolean} props.bikesLoading
 * @param {string} props.bikesError
 * @param {string} props.bikePhotoPreview - URL תצוגה מקדימה לתמונה מקומית.
 * @param {Function} props.setBikePhotoPreview
 * @param {React.RefObject} props.bikePhotoInputRef - Ref ל-input קובץ תמונה.
 */
export default function MyBikePage({
  isRideActive,
  isRideMinimized,
  onNavigate,
  bikes,
  bikesLoading,
  bikesError,
  bikePhotoPreview,
  setBikePhotoPreview,
  bikePhotoInputRef,
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-5 sm:px-6">
      <main className="mt-6 flex-1">
        <ActiveRideBanner
          isRideActive={isRideActive}
          isRideMinimized={isRideMinimized}
          onNavigate={onNavigate}
        />

        {/* כותרת ראשית למסך האופנוע */}
        <section>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            האופנוע שלי
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:text-lg">
            ניהול פרטי האופנוע ותחזוקה
          </p>
        </section>

        {/* תצוגת "האופנוע שלי" עם נתונים אמיתיים */}
        <section className="mt-4">
          {bikesLoading && (
            <p className="text-xs text-slate-300">טוען אופנועים...</p>
          )}
          {!!bikesError && (
            <p className="text-xs text-rose-300">{bikesError}</p>
          )}

          {!bikesLoading && !bikesError && bikes.length === 0 && (
            <GlassCard>
              <p className="text-sm text-slate-200">אין אופנועים עדיין</p>
              <p className="mt-1 text-xs text-slate-400">אפשר להוסיף בהמשך</p>
            </GlassCard>
          )}

          {!bikesLoading && !bikesError && bikes.length > 0 && (
            <div className="space-y-3">
              {bikes.map((bike, index) => (
                <GlassCard key={bike?._id || bike?.id || `bike-${index}`}>
                  <p className="text-sm font-semibold text-slate-100">
                    {bike?.name || bike?.model || "האופנוע שלי"}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    ק״מ: {bike?.mileage ?? bike?.odometer ?? 0}
                  </p>
                  {bike?.nextServiceKm != null && (
                    <p className="mt-1 text-xs text-slate-400">
                      טיפול הבא: {bike.nextServiceKm} ק״מ
                    </p>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Hero ראשי עם תחושת תמונה + פעולות מהירות */}
        <section className="mt-6">
          <GlassCard
            title="Yamaha MT-07"
            right={
              <div className="flex items-center gap-2">
                <span className="mv-pill px-2.5 py-1 text-xs font-medium text-emerald-200">
                  תקין
                </span>
                <Button variant="ghost" size="md" className="text-xs">
                  ערוך
                </Button>
              </div>
            }
          >
            <p className="text-sm text-slate-300">2023 • Matte Black</p>

            <div className="relative mt-4 h-44 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/90 via-slate-800/60 to-emerald-900/25">
              {/* רקע דמוי תמונה עם שכבת גריד עדינה + זוהר ירקרק */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[24px_24px]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(20,184,166,0.18),transparent_55%)]" />

              {bikePhotoPreview ? (
                <img
                  src={bikePhotoPreview}
                  alt="תצוגת אופנוע"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="mv-pill px-2.5 py-1 text-xs text-slate-200">
                    תצוגת תמונת אופנוע
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex justify-start">
              <Button
                variant="ghost"
                size="md"
                onClick={() => bikePhotoInputRef.current?.click()}
              >
                העלה תמונה
              </Button>
            </div>

            {/* input מוסתר לבחירת קובץ תמונה מקומית */}
            <input
              ref={bikePhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                if (bikePhotoPreview.startsWith("blob:")) {
                  URL.revokeObjectURL(bikePhotoPreview);
                }

                const localPreviewUrl = URL.createObjectURL(file);
                setBikePhotoPreview(localPreviewUrl);

                /*
                 * בשלב עתידי נחבר כאן העלאה אמיתית לשרת ונשמור URL קבוע.
                 * כרגע זו תצוגה מקומית בלבד לצורך UX.
                 */
              }}
            />
          </GlassCard>
        </section>

        {/* שורת סטטוסים קצרה במראה פרימיום */}
        <section className="mt-4 flex flex-wrap gap-2">
          <span className="mv-pill px-3 py-1 text-xs text-slate-200">
            ק״מ: 12,450
          </span>
          <span className="mv-pill px-3 py-1 text-xs text-slate-200">
            טיפול הבא: 800 ק״מ
          </span>
          <span className="mv-pill px-3 py-1 text-xs text-slate-200">
            צמיגים: 32 PSI
          </span>
        </section>

        {/* בלוק תחזוקה והתראות */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold text-slate-100">
            התראות ותחזוקה
          </h2>

          <div className="mt-4 space-y-3">
            <GlassCard
              title="לחץ אוויר תקין"
              right={
                <span className="mv-pill px-2.5 py-1 text-xs text-emerald-200">
                  תקין
                </span>
              }
            >
              <p className="text-sm text-slate-300">
                הלחץ בגלגלים מאוזן ומתאים לרכיבה יומית.
              </p>
              <div className="mt-3">
                <Button variant="ghost" size="md">
                  בדיקה
                </Button>
              </div>
            </GlassCard>

            <GlassCard
              title="שימון שרשרת"
              right={
                <span className="mv-pill px-2.5 py-1 text-xs text-amber-200">
                  בקרוב
                </span>
              }
            >
              <p className="text-sm text-slate-300">
                מומלץ לבצע שימון ב־150 הק״מ הקרובים.
              </p>
              <div className="mt-3">
                <Button variant="ghost" size="md">
                  סמן כבוצע
                </Button>
              </div>
            </GlassCard>

            <GlassCard
              title="בלמים"
              right={
                <span className="mv-pill px-2.5 py-1 text-xs text-rose-200">
                  דורש תשומת לב
                </span>
              }
            >
              <p className="text-sm text-slate-300">
                נמצאה שחיקה ברפידות, מומלץ לבצע בדיקה בהקדם.
              </p>
              <div className="mt-3">
                <Button variant="ghost" size="md">
                  בדיקה
                </Button>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
    </div>
  );
}
