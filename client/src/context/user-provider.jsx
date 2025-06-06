import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { base_url } from "../api";


const UserContext = createContext({ user: null, refreshUser: async () => {} });

// Toggle detailed logging by setting this to true during debugging only
const DEBUG = false;

export default function UserProvider({children}){
    const [user, setUser] = useState(null)

    const refreshUser = useCallback(async () => {
       try {
        if (DEBUG) console.log("refreshUser: fetching /api/me");
        const res = await fetch(`${base_url}/api/me`, {
            credentials: "include",
        });

        if (res.ok) {
            const userData = await res.json();
            if (DEBUG) console.log("refreshUser: success, user data:", userData);
            setUser(userData);
        } else if (res.status === 401) {
             if (DEBUG) console.warn("refreshUser: 401 Unauthorized, user not logged in");
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

    return (
        <UserContext.Provider value={{ user, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
