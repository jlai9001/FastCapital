import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Global auth guard that runs on EVERY route change.
 * - If JWT exists but is expired → redirect to /login
 * - If no JWT and route is protected → redirect to /login
 */
export default function AuthRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();

useEffect(() => {
  // Helper: keep UI state in sync when we force-log out client-side
  const broadcastLogout = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("fc:logout"));
    }
  };

  // Decode + expiry check (frontend-only, UX guard)
  const isExpired = (jwt) => {
    try {
      const base64Url = jwt.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      if (!payload?.exp) return true;
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const protectedRoutes = [
    "/portfolio",
    "/business-profile",
    "/add-business",
    "/create-investment",
    "/create-financials",
  ];

  const checkAuth = () => {
    const token = localStorage.getItem("access_token");

    const path = location.pathname;
    const isPurchaseRoute =
      path.startsWith("/investment-details/") &&
      path.endsWith("/purchase");


    const isProtected =
      isPurchaseRoute ||
      protectedRoutes.some((p) => path.startsWith(p));


    // Case 1: JWT exists but expired/invalid
    if (token && isExpired(token)) {
      localStorage.removeItem("access_token");
      broadcastLogout();
      navigate("/login", { replace: true });
      return;
    }

    // Case 2: No JWT + protected route
    if (!token && isProtected) {
      broadcastLogout();
      navigate("/login", { replace: true });
    }
  };

  // Run on route change
  checkAuth();

  // ✅ Also run on “manual token delete” situations (no route change)
  const onFocus = () => checkAuth();
  const onVisibility = () => {
    if (!document.hidden) checkAuth();
  };
  const onAnyClick = () => checkAuth();

  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("click", onAnyClick, true);

  return () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
    document.removeEventListener("click", onAnyClick, true);
  };
}, [location.pathname, navigate]);


  return null;
}
