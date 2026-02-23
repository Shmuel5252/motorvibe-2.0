/**
 * useAppState — Custom Hook מרכזי של האפליקציה.
 * מכיל את כל ה-State, ה-Side Effects וה-Logic שהיו ב-App.jsx.
 * מוחזר כאובייקט אחד גדול ומועבר לרכיבי העמוד דרך Props.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useJsApiLoader } from "@react-google-maps/api";

/* ─── קבועים גלובליים (זהים לאלה שהיו ב-App.jsx) ─── */
export const ISRAEL_DEFAULT_CENTER = { lat: 32.0853, lng: 34.7818 };
export const ISRAEL_DEFAULT_ZOOM = 11;
const MAP_LOADER_ID = "motovibe-maps";
/** ספריות טעינת מפה יציבות (כולל Places להצעות אוטומטיות). */
const MAP_LIBRARIES = ["maps", "places"];
/** תיקון 404: בסיס ה-API חייב להצביע לשרת backend ולא ל-origin של Vite. */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "mv_token";

export default function useAppState() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* יצירת apiClient פעם אחת בלבד לשימוש בכל הקריאות לשרת. */
  const apiClient = useMemo(() => axios.create({ baseURL: API_BASE_URL }), []);
  const api = apiClient;

  const LOADER_OPTIONS = useMemo(
    () => ({
      id: MAP_LOADER_ID,
      googleMapsApiKey,
      libraries: MAP_LIBRARIES,
      language: "he",
      region: "IL",
      authReferrerPolicy: "origin",
    }),
    [googleMapsApiKey],
  );

  /* טוענים את Google Maps פעם אחת בלבד כדי למנוע קונפליקט אופציות. */
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsLoadError } =
    useJsApiLoader(LOADER_OPTIONS);

  /* ─── State: פילטרים גלובליים ─── */
  const [selectedChip, setSelectedChip] = useState("הכל");

  /*
   * המסלול הנבחר לתצוגת פרטים בתוך מסך המסלולים.
   * כאשר null מוצגת רשימת המסלולים, וכאשר יש ערך מוצג Route Details.
   */
  const [selectedRoute, setSelectedRoute] = useState(null);

  /*
   * כלל תצוגה: מסלול נבחר יוצג ב־Ride רק אם ההתחלה הייתה ממסך מסלולים.
   */
  const [didStartFromRoute, setDidStartFromRoute] = useState(false);

  /*
   * פילטר מקומי למסך היסטוריה (UI בלבד ללא סינון נתונים אמיתי בשלב זה).
   */
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState("הכל");
  const [isHistoryFilterMenuOpen, setIsHistoryFilterMenuOpen] = useState(false);

  /* רכיבה נבחרת לתצוגת פרטי היסטוריה במודל מקומי. */
  const [selectedHistoryRide, setSelectedHistoryRide] = useState(null);

  /* הערות מקומיות למסך פרטי רכיבה (ללא שמירה לשרת). */
  const [historyRideNotes, setHistoryRideNotes] = useState("");

  /*
   * טקסט חיפוש מקומי למסך היסטוריה (ללא API).
   */
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * מצבי UI מקומיים למסך מסלולים (חיפוש + פילטר טווח).
   */
  const [routesSearchQuery, setRoutesSearchQuery] = useState("");
  const [selectedRoutesFilter, setSelectedRoutesFilter] = useState("הכל");
  const [isRoutesFilterMenuOpen, setIsRoutesFilterMenuOpen] = useState(false);

  /* תצוגה פנימית למסך Routes: רשימה או פרטי מסלול. */
  const [routesView, setRoutesView] = useState("routes");

  const goToRoutesListView = () => setRoutesView("routes");

  useEffect(() => {
    if (routesView !== "routeDetails") {
      return undefined;
    }

    /* תיקון ניווט: לחיצה על "מסלולים" בניווט מחזירה תמיד לרשימת המסלולים. */
    const handleRoutesNavClick = (event) => {
      const targetElement = event.target;
      if (!(targetElement instanceof Element)) {
        return;
      }

      const clickedButton = targetElement.closest("button");
      if (!clickedButton) {
        return;
      }

      if (clickedButton.textContent?.includes("מסלולים")) {
        goToRoutesListView();
      }
    };

    document.addEventListener("click", handleRoutesNavClick, true);

    return () => {
      document.removeEventListener("click", handleRoutesNavClick, true);
    };
  }, [routesView]);

  /*
   * תצוגה מקומית של תמונת האופנוע שנבחרה (ללא העלאה לשרת בשלב זה).
   */
  const [bikePhotoPreview, setBikePhotoPreview] = useState("");
  const bikePhotoInputRef = useRef(null);

  /*
   * נתוני מסלולים מקומיים כולל metadata בסיסי לתצוגת פרטים.
   */
  const [routes, setRoutes] = useState([
    {
      id: "route-1",
      title: "רמת השרון → תל אביב",
      from: "רמת השרון",
      to: "תל אביב",
      distanceKm: 42,
      etaMin: 45,
      routeType: "עירוני",
      difficulty: "בינוני",
      isTwisty: false,
      tags: ["כביש", "לילה", "מהיר"],
    },
    {
      id: "route-2",
      title: "כביש החוף → חיפה",
      from: "כביש החוף",
      to: "חיפה",
      distanceKm: 96,
      etaMin: 70,
      routeType: "בין־עירוני",
      difficulty: "בינוני",
      isTwisty: false,
      tags: ["כביש", "לילה", "מהיר"],
    },
    {
      id: "route-3",
      title: "הרי ירושלים → בית שמש",
      from: "הרי ירושלים",
      to: "בית שמש",
      distanceKm: 38,
      etaMin: 52,
      routeType: "נוף",
      difficulty: "קשה",
      isTwisty: true,
      tags: ["כביש", "לילה", "מהיר"],
    },
  ]);

  /* ─── State: Auth ─── */
  const [authToken, setAuthToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  /* ─── State: Routes loading ─── */
  const [isRoutesLoading, setIsRoutesLoading] = useState(false);
  const [routesLoadError, setRoutesLoadError] = useState("");

  /* ─── State: Bikes ─── */
  const [bikes, setBikes] = useState([]);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [bikesError, setBikesError] = useState("");

  /* טופס יצירה מקומי למסלול חדש במסך Routes. */
  const [newRouteTitle, setNewRouteTitle] = useState("");
  const [newOriginLabel, setNewOriginLabel] = useState("");
  const [newOriginLatLng, setNewOriginLatLng] = useState(null);
  const [newDestinationLabel, setNewDestinationLabel] = useState("");
  const [newDestinationLatLng, setNewDestinationLatLng] = useState(null);
  const [newRouteType, setNewRouteType] = useState("עירוני");
  const [newRouteDifficulty, setNewRouteDifficulty] = useState("בינוני");
  const [newRouteIsTwisty, setNewRouteIsTwisty] = useState(false);
  const [isAddRouteExpanded, setIsAddRouteExpanded] = useState(false);
  /* מצב בחירה מהמפה בתוך הטופס עבור מוצא/יעד. */
  const [activeMapPickField, setActiveMapPickField] = useState(null);
  /* מרכז דינמי לפיקר: נקודה קיימת/גיאוקוד/ברירת מחדל. */
  const [mapPickCenter, setMapPickCenter] = useState(ISRAEL_DEFAULT_CENTER);
  /* סטטוס חיפוש מיקום לפתיחת פיקר ליד טקסט שהוקלד. */
  const [mapPickStatus, setMapPickStatus] = useState("");
  const mapPickRequestIdRef = useRef(0);

  /* שירות הצעות למוצא/יעד (AutocompleteService). */
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [newRouteLocationError, setNewRouteLocationError] = useState("");

  const isPlacesSuggestionsReady =
    isGoogleMapsLoaded &&
    !googleMapsLoadError &&
    typeof window !== "undefined" &&
    Boolean(window.google?.maps?.places);

  /* ─── Auth Handlers ─── */

  /* טיפול מרכזי ב-401: ניקוי טוקן, מעבר למצב אורח ותצוגת מסך אימות. */
  const handleUnauthorized = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    delete apiClient.defaults.headers.common.Authorization;
    setAuthToken("");
    setIsAuthenticated(false);
    setShowAuthScreen(true);
  };

  // התנתקות: ניקוי טוקן ואיפוס מצב התחברות
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY || "mv_token");
      // בהתנתקות מנקים גם את פרטי המשתמש
      window.localStorage.removeItem("mv_user");
    }

    delete apiClient.defaults.headers.common.Authorization;
    setAuthToken("");
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowAuthScreen(true);
  };

  /* הצלחת אימות: שמירה ב-localStorage, חיבור Bearer ועדכון סטייט התחברות. */
  const applyAuthSuccess = (token, user = null) => {
    if (!token) {
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      // שמירת המשתמש כדי להציג שם אמיתי גם אחרי רענון
      if (user && typeof user === "object") {
        window.localStorage.setItem("mv_user", JSON.stringify(user));
      }
    }

    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    setAuthToken(token);
    if (user && typeof user === "object") {
      setCurrentUser(user);
    }
    setIsAuthenticated(true);
    setShowAuthScreen(false);
  };

  /* חילוץ טוקן מתשובת Auth (תומך גם ב-response עם user+token). */
  const extractTokenFromAuthResponse = (data) =>
    data?.token || data?.data?.token || "";

  const extractUserFromAuthResponse = (data) =>
    data?.user || data?.data?.user || null;

  /* ─── Routes Logic ─── */

  const toLatLngPoint = (point) => {
    const lat = Number(point?.lat);
    const lng = Number(point?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  };

  const normalizeRouteFromServer = (route, index) => {
    const originPoint = toLatLngPoint(route?.start);
    const destinationPoint = toLatLngPoint(route?.end);

    return {
      ...route,
      id: route?._id || route?.id || `route-${Date.now()}-${index}`,
      from: route?.start?.label || route?.from || "מוצא",
      to: route?.end?.label || route?.to || "יעד",
      etaMin: route?.etaMin ?? route?.etaMinutes ?? 0,
      ...(originPoint ? { fromLatLng: originPoint, origin: originPoint } : {}),
      ...(destinationPoint
        ? { toLatLng: destinationPoint, destination: destinationPoint }
        : {}),
    };
  };

  /* טעינת מסלולים מהשרת לפי משתמש מחובר ושמירה ב-state של המסך. */
  const fetchRoutesFromServer = async (tokenOverride) => {
    const effectiveToken = tokenOverride || authToken;
    if (!effectiveToken) {
      return;
    }

    setIsRoutesLoading(true);
    setRoutesLoadError("");

    try {
      const response = await apiClient.get("/routes", {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });

      const serverRoutes = Array.isArray(response.data?.routes)
        ? response.data.routes
        : [];
      setRoutes(serverRoutes.map(normalizeRouteFromServer));
    } catch (error) {
      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      console.error("Failed to load routes", error);
      setRoutesLoadError("טעינת מסלולים נכשלה");
    } finally {
      setIsRoutesLoading(false);
    }
  };

  // טעינת רשימת אופנועים מהשרת
  const fetchBikesFromServer = async (tokenOverride) => {
    const effectiveToken = tokenOverride || authToken;
    if (!effectiveToken) {
      return;
    }

    setBikesLoading(true);
    setBikesError("");

    try {
      const response = await api.get("/bikes", {
        headers: { Authorization: `Bearer ${effectiveToken}` },
      });

      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setBikes(Array.isArray(list) ? list : []);
    } catch (error) {
      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      if (error?.response?.status === 404) {
        setBikesError("עדיין אין API לאופנועים בשרת");
        return;
      }

      setBikesError("טעינת אופנועים נכשלה");
    } finally {
      setBikesLoading(false);
    }
  };

  /* שליחת התחברות/הרשמה לשרת ועדכון מצב מאומת באפליקציה. */
  const submitAuthForm = async ({ onNavigate }) => {
    const email = authEmail.trim();
    const password = authPassword.trim();
    const name = authName.trim();

    if (!email || !password || (authMode === "register" && !name)) {
      setAuthError("נא למלא את כל השדות הנדרשים");
      return;
    }

    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      /* הנתיב יחסי ל-baseURL שכבר כולל /api, לכן נשאר /auth/... */
      const endpoint =
        authMode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        authMode === "register"
          ? { name, email, password }
          : { email, password };

      const response = await apiClient.post(endpoint, payload);
      const token = extractTokenFromAuthResponse(response.data);
      const user = extractUserFromAuthResponse(response.data);
      if (!token) {
        setAuthError("לא התקבל טוקן מהשרת");
        return;
      }

      applyAuthSuccess(token, user);
      await fetchRoutesFromServer(token);
      onNavigate("home");
    } catch (error) {
      console.error("Auth failed", error);
      setAuthError("התחברות נכשלה. בדוק פרטים ונסה שוב");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  /* הידרציה בטעינה: הגדרת Authorization לפני fetchRoutes ואז טעינת מסלולים. */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    if (!storedToken) {
      setIsAuthenticated(false);
      setShowAuthScreen(true);
      return;
    }

    // אתחול משתמש מה-localStorage כדי שהשם יוצג גם אחרי רענון
    const rawStoredUser = window.localStorage.getItem("mv_user");
    if (rawStoredUser) {
      try {
        const parsedUser = JSON.parse(rawStoredUser);
        if (parsedUser && typeof parsedUser === "object") {
          setCurrentUser(parsedUser);
        }
      } catch {
        window.localStorage.removeItem("mv_user");
      }
    }

    applyAuthSuccess(storedToken);
    fetchRoutesFromServer(storedToken);
  }, []);

  /* קטגוריות ופילטרים קבועים */
  const filterChips = ["הכל", "קצר", "בינוני", "ארוך", "שטח"];
  const routesFilterOptions = ["הכל", "קצר", "בינוני", "ארוך"];
  const historyFilters = ["הכל", "שבוע", "חודש", "שנה"];

  /*
   * נתוני דמו למסך היסטוריית רכיבות.
   * בהמשך יוחלפו בנתונים אמיתיים מהשרת.
   */
  const historyRides = [
    {
      id: "ride-1",
      title: "טיול רכיבה ביום שבת",
      date: "03.12.25",
      duration: "1:45",
      distance: "72 ק״מ",
    },
    {
      id: "ride-2",
      title: "נסיעה לעבודה",
      date: "28.11.25",
      duration: "0:55",
      distance: "21 ק״מ",
    },
    {
      id: "ride-3",
      title: "טיול לילה בהרים",
      date: "21.11.25",
      duration: "2:10",
      distance: "94 ק״מ",
    },
    {
      id: "ride-4",
      title: "סיבוב חוף ערב",
      date: "18.11.25",
      duration: "1:20",
      distance: "48 ק״מ",
    },
  ];

  /* 3 המסלולים האחרונים לתצוגת דף הבית. */
  const recentRoutes = useMemo(() => {
    if (!Array.isArray(routes) || routes.length === 0) {
      return [];
    }

    const hasCreatedAt = routes.some((route) => Boolean(route?.createdAt));
    const sourceRoutes = [...routes];

    if (hasCreatedAt) {
      sourceRoutes.sort((a, b) => {
        const aTimestamp = Date.parse(a?.createdAt || "");
        const bTimestamp = Date.parse(b?.createdAt || "");

        if (Number.isNaN(aTimestamp) && Number.isNaN(bTimestamp)) {
          return 0;
        }

        if (Number.isNaN(aTimestamp)) {
          return 1;
        }

        if (Number.isNaN(bTimestamp)) {
          return -1;
        }

        return bTimestamp - aTimestamp;
      });
    }

    return sourceRoutes.slice(0, 3);
  }, [routes]);

  /**
   * מחזיר קטגוריית אורך למסלול לפי מרחק ק"מ.
   */
  const getRouteLengthCategory = (distanceKm) => {
    if (distanceKm <= 40) {
      return "קצר";
    }

    if (distanceKm <= 80) {
      return "בינוני";
    }

    return "ארוך";
  };

  /**
   * מחזיר קושי מעודכן כאשר מסלול מוגדר כמפותל.
   */
  const getAdjustedDifficultyForTwisty = (difficulty) => {
    if (difficulty === "קל") {
      return "בינוני";
    }

    return difficulty;
  };

  /* ניקוי הצעות כאשר שירות המקומות לא זמין. */
  useEffect(() => {
    if (isPlacesSuggestionsReady) {
      return;
    }

    setOriginSuggestions([]);
    setDestinationSuggestions([]);
  }, [isPlacesSuggestionsReady]);

  /* הצעות למוצא: קריאה מדובנסת ל-AutocompleteService. */
  useEffect(() => {
    if (!isPlacesSuggestionsReady) {
      setOriginSuggestions([]);
      return;
    }

    const input = newOriginLabel.trim();
    if (!input) {
      setOriginSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      /* הגנת שירות: מריצים Autocomplete רק כאשר Places זמין בפועל. */
      if (!window.google?.maps?.places) {
        setOriginSuggestions([]);
        return;
      }

      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "il" },
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
            setOriginSuggestions([]);
            return;
          }

          setOriginSuggestions(predictions || []);
        },
      );
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [newOriginLabel, isPlacesSuggestionsReady]);

  /* הצעות ליעד: קריאה מדובנסת ל-AutocompleteService. */
  useEffect(() => {
    if (!isPlacesSuggestionsReady) {
      setDestinationSuggestions([]);
      return;
    }

    const input = newDestinationLabel.trim();
    if (!input) {
      setDestinationSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      /* הגנת שירות: מריצים Autocomplete רק כאשר Places זמין בפועל. */
      if (!window.google?.maps?.places) {
        setDestinationSuggestions([]);
        return;
      }

      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "il" },
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
            setDestinationSuggestions([]);
            return;
          }

          setDestinationSuggestions(predictions || []);
        },
      );
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [newDestinationLabel, isPlacesSuggestionsReady]);

  /* ─── Map Utilities (exported for page use) ─── */

  /**
   * מחזיר נתיב למסלול עבור Polyline במפת פרטי מסלול.
   */
  const getRoutePolylinePath = (route) => {
    if (route?.points?.length >= 2) {
      return route.points;
    }

    return [
      { lat: 32.0853, lng: 34.7818 },
      { lat: 32.0951, lng: 34.7894 },
      { lat: 32.1063, lng: 34.8012 },
      { lat: 32.1148, lng: 34.8155 },
      { lat: 32.1222, lng: 34.8291 },
    ];
  };

  /**
   * בודק שנקודת מפה תקינה.
   */
  const isValidMapPoint = (point) => {
    if (!point || typeof point !== "object") {
      return false;
    }

    const lat = Number(point.lat);
    const lng = Number(point.lng);
    return Number.isFinite(lat) && Number.isFinite(lng);
  };

  /**
   * מסנן נתיב למסלול לנקודות חוקיות בלבד עבור Polyline.
   */
  const getSafePolylinePath = (path) => {
    if (!Array.isArray(path)) {
      return [];
    }

    return path.filter(isValidMapPoint);
  };

  /* ─── Return: כל ה-state וה-handlers כאובייקט אחד ─── */
  return {
    /* Google Maps */
    googleMapsApiKey,
    isGoogleMapsLoaded,
    googleMapsLoadError,
    isPlacesSuggestionsReady,

    /* Auth */
    authToken,
    isAuthenticated,
    currentUser,
    showAuthScreen,
    authMode, setAuthMode,
    authName, setAuthName,
    authEmail, setAuthEmail,
    authPassword, setAuthPassword,
    authError, setAuthError,
    isAuthSubmitting,
    handleLogout,
    handleUnauthorized,
    submitAuthForm,

    /* Routes */
    routes, setRoutes,
    selectedRoute, setSelectedRoute,
    routesView, setRoutesView,
    goToRoutesListView,
    isRoutesLoading,
    routesLoadError,
    routesSearchQuery, setRoutesSearchQuery,
    selectedRoutesFilter, setSelectedRoutesFilter,
    isRoutesFilterMenuOpen, setIsRoutesFilterMenuOpen,
    fetchRoutesFromServer,
    normalizeRouteFromServer,
    routesFilterOptions,
    filterChips,
    recentRoutes,
    getRouteLengthCategory,
    getAdjustedDifficultyForTwisty,
    getRoutePolylinePath,
    isValidMapPoint,
    getSafePolylinePath,

    /* New Route Form */
    newRouteTitle, setNewRouteTitle,
    newOriginLabel, setNewOriginLabel,
    newOriginLatLng, setNewOriginLatLng,
    newDestinationLabel, setNewDestinationLabel,
    newDestinationLatLng, setNewDestinationLatLng,
    newRouteType, setNewRouteType,
    newRouteDifficulty, setNewRouteDifficulty,
    newRouteIsTwisty, setNewRouteIsTwisty,
    isAddRouteExpanded, setIsAddRouteExpanded,
    activeMapPickField, setActiveMapPickField,
    mapPickCenter, setMapPickCenter,
    mapPickStatus, setMapPickStatus,
    mapPickRequestIdRef,
    originSuggestions, setOriginSuggestions,
    destinationSuggestions, setDestinationSuggestions,
    activeSuggestionField, setActiveSuggestionField,
    newRouteLocationError, setNewRouteLocationError,

    /* Bikes */
    bikes,
    bikesLoading,
    bikesError,
    fetchBikesFromServer,
    bikePhotoPreview, setBikePhotoPreview,
    bikePhotoInputRef,

    /* History */
    historyRides,
    historyFilters,
    selectedHistoryFilter, setSelectedHistoryFilter,
    isHistoryFilterMenuOpen, setIsHistoryFilterMenuOpen,
    selectedHistoryRide, setSelectedHistoryRide,
    historyRideNotes, setHistoryRideNotes,
    searchQuery, setSearchQuery,

    /* Ride */
    didStartFromRoute, setDidStartFromRoute,

    /* Misc */
    selectedChip, setSelectedChip,
    apiClient,
  };
}
