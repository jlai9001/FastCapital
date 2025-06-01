import { useState, useEffect } from "react";
import axios from "axios";

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
        const response = await fetch(`http://localhost:8000/api/investment/${investmentId}`);
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

function useInvestmentPurchases(investmentId) {
  const [purchases, setPurchases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!investmentId) return;

    async function fetchPurchases() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/purchases`, {
          params: { investment_id: investmentId },
          withCredentials: true,
        });
        setPurchases(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, [investmentId]);

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
        const response = await fetch(`http://localhost:8000/api/business/${businessId}`);
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
              const res = await fetch('http://localhost:8000/api/my_business', { credentials: "include" });

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

function useFinancialsForBusiness(businessId) {
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      async function fetchData() {
        try {
          const res = await axios.get(`http://localhost:8000/api/financials/${businessId}`);
          setFinancials(res.data);
          } catch (err) {
            if (err.response.status === 404) {
              setFinancials(null);
            } else {
              setError(err);
            }
          } finally {
              setLoading(false);
          }
      };

      if (businessId) {
        fetchData();
      }
  }, [businessId]);

  return { financials, loading, error };
}

function useInvestmentsForBusiness(businessId) {
    const [investments, setInvestments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
          try {
            const res = await axios.get(`http://localhost:8000/api/business_investments`, {
                params: { business_id: businessId },
                withCredentials: true,
                });
                setInvestments(res.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setInvestments(null);
                } else {
                    setError(err);
                }
            } finally {
                setLoading(false);
            }
        }

        if (businessId) {
          fetchData();
        }
    }, [businessId]);

    return { investments, loading, error };
}

export { useInvestment, useBusiness, useBusinessForUser, useFinancialsForBusiness,
  useInvestmentsForBusiness, useInvestmentPurchases };


export async function getInvestments() {
  const response = await fetch("http://localhost:8000/api/investment");
  if (!response.ok) throw new Error("Failed to fetch investments");
  return await response.json();
}

export async function getBusinesses() {
  const response = await fetch("http://localhost:8000/api/business");
  if (!response.ok) throw new Error("Failed to fetch businesses");
  return await response.json();
}
