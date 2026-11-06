import { createContext, useState } from "react";
import PropTypes from 'prop-types';
import { jwtDecode } from "jwt-decode";
import { unregisterPush } from "../utils/push";

export const AuthContext = createContext(null);

// Read the saved login synchronously so the first render already knows who
// is logged in. Loading it in an effect left user null for one render, and
// pages that send logged-out visitors home (profiles) redirected on refresh.
function readStoredAuth() {
    try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");
        if (storedToken && storedUser) return { token: storedToken, user: JSON.parse(storedUser) };
    } catch {
        // storage blocked or corrupt: treat as logged out
    }
    return { token: null, user: null };
}

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => readStoredAuth().user);
    const [token, setToken] = useState(() => readStoredAuth().token);

    const login = (authToken) => {
        const decodedUser = jwtDecode(authToken);
        
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("authUser", JSON.stringify(decodedUser)); 

        setToken(authToken);
        setUser(decodedUser);
    };

    const logout = () => {
        // Stop pushes to this device; runs in the background so logout stays instant.
        unregisterPush();
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
