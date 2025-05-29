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
        // Call the backend to get current user info. 'credentials: "include"' sends cookies for session auth.
        const res = await fetch(`http://localhost:8000/api/me`, {
            credentials: "include",
        });
        if (res.ok) {
            setUser(await res.json());
        } else {
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
