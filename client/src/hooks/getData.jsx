import { useState, useEffect } from "react"
export  function useOffer(offerId){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    useEffect(() => {
        if (!offerId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:8000/api/offers/${offerId}`);
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
        };

        fetchData();
    }, [offerId]);

    return { loading, error, data };
}

export function useBusiness(bussinessId){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    useEffect(() => {
        if (!bussinessId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:8000/api/offers/${bussinessId}`);
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
        };

        fetchData();
    }, [bussinessId]);

    return { loading, error, data };
}
