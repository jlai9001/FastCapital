import { useState, useEffect } from "react";
import { apiFetch } from "../api/client.js";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function authHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function useInvestment(investmentId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!investmentId) return;
    async function fetchInvestment() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/api/investment/${investmentId}`, {
          headers: authHeader(),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch investment data");
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvestment();
  }, [investmentId]);
  return { loading, error, data };
}

function useInvestmentPurchases(investmentId, enabled = true) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !investmentId) return;

    async function fetchPurchases() {
      setLoading(true);
      setError(null);

      try {
        // ✅ Your backend already returns purchases here:
        // GET /api/investment/{investment_id} -> InvestmentWithPurchasesOut { purchases: [...] }
        const res = await apiFetch(`/api/investment/${investmentId}`, {
          headers: authHeader(),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch purchases");
        }

        const json = await res.json();
        const list = Array.isArray(json?.purchases) ? json.purchases : [];
        setPurchases(list);
      } catch (err) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, [investmentId, enabled]);

  return { data: purchases, loading, error };
}


function useBusiness(businessId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!businessId) return;
    async function fetchBusiness() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/api/business/${businessId}`, {
          headers: authHeader(),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch business data");
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [businessId]);
  return { loading, error, data };
}

function useBusinessForUser() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await apiFetch(`/api/my_business`, {
          headers: authHeader(),
        });
        if (res.status === 401 || res.status === 404) {
          setBusiness(null);
        } else if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error fetching business: ${errorText}`);
        } else {
          const data = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);
  return { business, loading, error };
}

async function uploadBusinessImage(businessId, file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiFetch(`/api/business/${businessId}/upload_image`, {
    method: "POST",
    body: formData,
    headers: authHeader(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error uploading image: ${errorText}`);
  }

  return await res.json();
}

function useFinancialsForBusiness(businessId) {
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessId) {
      setFinancials([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(`/api/financials/${businessId}`, {
          headers: authHeader(),
        });

        if (res.status === 404) {
          if (!isCancelled) setFinancials(null);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch financials");
        }

        const json = await res.json();
        if (!isCancelled) setFinancials(json);
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [businessId]);

  return { financials, loading, error };
}


function useInvestmentsForBusiness(businessId) {
  const [investments, setInvestments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessId) {
      setInvestments(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams({ business_id: businessId }).toString();
        const res = await apiFetch(`/api/business_investments?${qs}`, {
          headers: authHeader(),
        });

        if (res.status === 404) {
          if (!isCancelled) setInvestments(null);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch business investments");
        }

        const json = await res.json();
        if (!isCancelled) setInvestments(json);
      } catch (err) {
        if (!isCancelled) setError(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [businessId]);

  return { investments, loading, error };
}


export async function getBusinesses() {
  const response = await apiFetch(`/api/business`, {
    headers: authHeader(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch businesses");
  }
  return await response.json();
}

export async function getInvestments() {
  const response = await apiFetch(`/api/investment`, {
    headers: authHeader(),
  });
  if (!response.ok) throw new Error("Failed to fetch investments");
  return await response.json();
}

export {
  useInvestment,
  useBusiness,
  useBusinessForUser,
  useFinancialsForBusiness,
  useInvestmentsForBusiness,
  useInvestmentPurchases,
  uploadBusinessImage,
};
