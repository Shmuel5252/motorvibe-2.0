/**
 * מציג כרטיס זכוכית אחיד עם אזור כותרת אופציונלי.
 * @param {Object} props - מאפייני הקומפוננטה.
 * @param {React.ReactNode} [props.title] - כותרת צד ימין/ראש הכרטיס.
 * @param {React.ReactNode} [props.right] - תוכן משלים לכותרת (כפתור/סטטוס).
 * @param {string} [props.className] - קלאסים נוספים להרחבת סגנון.
 * @param {React.ReactNode} props.children - תוכן פנימי של הכרטיס.
 * @returns {JSX.Element} בלוק section בסגנון glass.
 */
function GlassCard({ title, right, className = "", children, onClick }) {
  const isClickable = typeof onClick === "function";
  return (
    <section
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-5 ${
        isClickable
          ? "cursor-pointer transition-all hover:bg-white/8 hover:border-white/15 active:scale-[0.98]"
          : ""
      } ${className}`.trim()}
    >
      {/* כותרת אופציונלית: מוצגת רק אם יש title או right */}
      {(title || right) && (
        <header className="mb-4 flex items-center justify-between">
          {title ? (
            <h2 className="text-base font-semibold">{title}</h2>
          ) : (
            <span />
          )}
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export default GlassCard;
