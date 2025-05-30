import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";


const UserContext = createContext({ user: null, refreshUser: async () => {} });

export default function UserProvider({children}){
    const [user, setUser] = useState(null)

    const refreshUser = useCallback(async () => {
       try {
        const res = await fetch(`http://localhost:8000/api/me`, {
            credentials: "include",
        });

        if (res.ok) {
            const userData = await res.json();
            setUser(userData);
        } else if (res.status === 401) {
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
