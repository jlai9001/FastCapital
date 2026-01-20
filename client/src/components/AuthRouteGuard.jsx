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
    const token = localStorage.getItem("access_token");

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
        if (!payload?.exp) return true; // no exp = treat as invalid
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

    // ✅ Only protect the PURCHASE flow, not the details page
    const isPurchaseRoute =
      location.pathname.startsWith("/investment-details/") &&
      location.pathname.endsWith("/purchase");

    const isProtected =
      isPurchaseRoute ||
      protectedRoutes.some((path) => location.pathname.startsWith(path));


    // Case 1: JWT exists but expired
    if (token && isExpired(token)) {
      localStorage.removeItem("access_token");
      navigate("/login", { replace: true });
      return;
    }

    // Case 2: No JWT + protected route
    if (!token && isProtected) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}
