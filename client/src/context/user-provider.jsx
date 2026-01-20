import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { apiFetch } from "../api/client.js";



const UserContext = createContext({ user: null, refreshUser: async () => {} });

// Toggle detailed logging by setting this to true during debugging only
const DEBUG = false;

function getAccessToken() {
  return localStorage.getItem("access_token");
}


export default function UserProvider({children}){
    const [user, setUser] = useState(null)

        const refreshUser = useCallback(async () => {
        try {
            if (DEBUG) console.log("refreshUser: fetching /api/me");

            const token = getAccessToken();

        const res = await apiFetch(`/api/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });


        if (res.ok) {
            const userData = await res.json();
            if (DEBUG) console.log("refreshUser: success, user data:", userData);
            setUser(userData);
        } else if (res.status === 401 || res.status === 403) {
            if (DEBUG) console.warn("refreshUser: 401 Unauthorized, user not logged in");
            localStorage.removeItem("access_token");
            setUser(null);
        }

        else {
            console.error("refreshUser failed:", res.status);
            setUser(null);
        }
    } catch (error) {
        console.error("refreshUser network error:", error);
        setUser(null);
    }
    }, []);

    // On mount, fetch the current user to initialize auth state.
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Clear user immediately when auth is invalidated globally
    useEffect(() => {
    const onLogout = () => setUser(null);

    window.addEventListener("fc:logout", onLogout);
    return () => window.removeEventListener("fc:logout", onLogout);
    }, []);

    return (
        <UserContext.Provider value={{ user, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}



export function useUser() {
    return useContext(UserContext);
}
