// FastCapital-main/client/src/context/protected-data-provider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { base_url } from "../api";
import { useUser } from "./user-provider.jsx";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function authHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, { allow404 = false } = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: authHeader(),
  });

  if (allow404 && res.status === 404) return null;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Fetch failed ${res.status} for ${url}${text ? `: ${text}` : ""}`
    );
  }

  return await res.json();
}

const ProtectedDataContext = createContext({
  status: "idle", // "idle" | "loading" | "ready" | "error"
  error: null,

  // cached data
  myBusiness: null,
  businessFinancials: null,
  businessInvestments: null,

  purchasesPending: [],
  pendingInvestments: [], // investment details for pending purchases
  purchasesCompleted: [],

  // actions
  refreshProtectedData: async () => {},
  clearProtectedData: () => {},
});

export default function ProtectedDataProvider({ children }) {
  const { user } = useUser();

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const [myBusiness, setMyBusiness] = useState(null);
  const [businessFinancials, setBusinessFinancials] = useState(null);
  const [businessInvestments, setBusinessInvestments] = useState(null);

  const [purchasesPending, setPurchasesPending] = useState([]);
  const [pendingInvestments, setPendingInvestments] = useState([]);
  const [purchasesCompleted, setPurchasesCompleted] = useState([]);

  const clearProtectedData = useCallback(() => {
    setStatus("idle");
    setError(null);

    setMyBusiness(null);
    setBusinessFinancials(null);
    setBusinessInvestments(null);

    setPurchasesPending([]);
    setPendingInvestments([]);
    setPurchasesCompleted([]);
  }, []);

  const refreshProtectedData = useCallback(async () => {
    // Don’t fetch protected data unless we’re logged in
    if (!user) {
      clearProtectedData();
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      // 1) Load business + purchases in parallel
      const [business, pending, completed] = await Promise.all([
        fetchJson(`${base_url}/api/my_business`, { allow404: true }),
        fetchJson(`${base_url}/api/purchases?status=pending`, { allow404: true }).then(
          (d) => (Array.isArray(d) ? d : [])
        ),
        fetchJson(`${base_url}/api/purchases?status=completed`, { allow404: true }).then(
          (d) => (Array.isArray(d) ? d : [])
        ),
      ]);

      setMyBusiness(business);
      setPurchasesPending(pending);
      setPurchasesCompleted(completed);

      // 2) Load investment details for pending purchases (so Portfolio is instant)
      const uniqueInvestmentIds = Array.from(
        new Set((pending || []).map((p) => p.investment_id).filter(Boolean))
      );

      const pendingInvestmentDetails = uniqueInvestmentIds.length
        ? (
            await Promise.all(
              uniqueInvestmentIds.map((id) =>
                fetchJson(`${base_url}/api/investment/${id}`, { allow404: true })
              )
            )
          ).filter(Boolean)
        : [];

      setPendingInvestments(pendingInvestmentDetails);

      // 3) If user has a business, load its financials + investments in parallel
      if (business?.id) {
        const [fin, bizInv] = await Promise.all([
          fetchJson(`${base_url}/api/financials/${business.id}`, { allow404: true }),
          fetchJson(
            `${base_url}/api/business_investments?business_id=${business.id}`,
            { allow404: true }
          ),
        ]);

        setBusinessFinancials(fin);
        setBusinessInvestments(bizInv);
      } else {
        setBusinessFinancials(null);
        setBusinessInvestments(null);
      }

      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(e);
    }
  }, [user, clearProtectedData]);

  // Auto-load everything once right after login (when `user` becomes truthy)
  useEffect(() => {
    if (user) refreshProtectedData();
    else clearProtectedData();
  }, [user, refreshProtectedData, clearProtectedData]);

  const value = useMemo(
    () => ({
      status,
      error,

      myBusiness,
      businessFinancials,
      businessInvestments,

      purchasesPending,
      pendingInvestments,
      purchasesCompleted,

      refreshProtectedData,
      clearProtectedData,
    }),
    [
      status,
      error,
      myBusiness,
      businessFinancials,
      businessInvestments,
      purchasesPending,
      pendingInvestments,
      purchasesCompleted,
      refreshProtectedData,
      clearProtectedData,
    ]
  );

  return (
    <ProtectedDataContext.Provider value={value}>
      {children}
    </ProtectedDataContext.Provider>
  );
}

export function useProtectedData() {
  return useContext(ProtectedDataContext);
}
