import { useState, useEffect } from "react";

function useOffer(offerId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!offerId) return;

    async function fetchOffer() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/offer/${offerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch offer data");
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOffer();
  }, [offerId]);

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

export { useOffer, useBusiness };


export async function getOffers() {
  const response = await fetch("http://localhost:8000/api/offer");
  if (!response.ok) throw new Error("Failed to fetch offers");
  return await response.json();
}

export async function getBusinesses() {
  const response = await fetch("http://localhost:8000/api/business");
  if (!response.ok) throw new Error("Failed to fetch businesses");
  return await response.json();
}
