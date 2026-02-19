import { useState } from "react";
import BottomNav from "../ui/nav/BottomNav";
import SideDrawer from "../ui/nav/SideDrawer";
import TopNav from "../ui/nav/TopNav";

/*
 * תצורת לשוניות הניווט הראשית.
 * נשמרת כקונפיגורציה אחת כדי לשמור עקביות בין TopNav, BottomNav ו־SideDrawer.
 */
const NAV_ITEMS = [
  { key: "home", label: "בית", icon: "⌂" },
  { key: "routes", label: "מסלולים", icon: "⌁" },
  { key: "ride", label: "רכיבה", icon: "●" },
  { key: "history", label: "היסטוריה", icon: "◷" },
  { key: "bike", label: "האופנוע שלי", icon: "⚙" },
];

/**
 * מעטפת הניווט הראשית של האפליקציה.
 * מרנדרת TopNav עליון, מגירת צד, ניווט תחתון למובייל ואזור תוכן מרכזי.
 * @param {Object} props - מאפייני הקומפוננטה.
 * @param {React.ReactNode | ((state: {
 * activeTab: "home" | "routes" | "ride" | "history" | "bike",
 * isRideActive: boolean,
 * setIsRideActive: (value: boolean) => void,
 * onNavigate: (tabKey: "home" | "routes" | "ride" | "history" | "bike") => void,
 * }) => React.ReactNode)} props.children
 * - תוכן העמוד הפעיל או פונקציית render prop עם מצב ניווט ורכיבה פעילה.
 * @returns {JSX.Element} שלד ניווט מלא עם תמיכה ב־RTL.
 */
function AppShell({ children }) {
  const [activeTab, setActiveTab] = useState("home");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  /*
   * מצב רכיבה פעילה גלובלי לשכבת ה־UI.
   * כשהוא פעיל, המסך עובר ל־Fullscreen HUD ומסתיר ניווט עליון/תחתון.
   */
  const [isRideActive, setIsRideActive] = useState(false);

  /*
   * עדכון לשונית פעילה וסגירת המגירה לאחר בחירה.
   * אין כאן החלפת מסכים עדיין — רק סטייט תצוגה.
   */
  const onNavigate = (tabKey) => {
    setActiveTab(tabKey);
    setIsDrawerOpen(false);
  };

  /*
   * מעטפת עדכון למצב רכיבה: סוגרת מגירה כדי למנוע חפיפה ב־Fullscreen.
   * @param {boolean} isActive - האם רכיבה פעילה כרגע.
   */
  const handleRideActiveChange = (isActive) => {
    setIsRideActive(isActive);
    if (isActive) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <div dir="rtl" className="mv-bg">
      {/* ניווט עליון מוצג רק כשאין רכיבה פעילה */}
      {!isRideActive && (
        <TopNav
          items={NAV_ITEMS}
          activeTab={activeTab}
          onNavigate={onNavigate}
          onMenuClick={() => setIsDrawerOpen(true)}
        />
      )}

      {/* מגירת צד מבוטלת בזמן רכיבה פעילה כדי למנוע הסחות */}
      {!isRideActive && (
        <SideDrawer
          open={isDrawerOpen}
          items={NAV_ITEMS}
          activeTab={activeTab}
          onNavigate={onNavigate}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* אזור תוכן עם ריווח תחתון כדי למנוע חפיפה עם BottomNav במובייל */}
      <main className={isRideActive ? "p-0" : "pb-24 md:pb-8"}>
        {typeof children === "function"
          ? children({
              activeTab,
              isRideActive,
              setIsRideActive: handleRideActiveChange,
              onNavigate,
            })
          : children}
      </main>

      {/* פס ניווט תחתון מוסתר בזמן רכיבה פעילה */}
      {!isRideActive && (
        <BottomNav
          items={NAV_ITEMS}
          activeTab={activeTab}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

export default AppShell;
