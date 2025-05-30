import { useState, useEffect } from "react";

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
              if (!res.ok) {
                const errorText = await res.text();
                throw new Error("Could not load business");
              }
              const data = await res.json();
              setBusiness(data);
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

export { useInvestment, useBusiness, useBusinessForUser };


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
