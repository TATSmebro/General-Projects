import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import UserCredentialsAPI from "../api/UserCredentialsAPI"; // adjust import as needed

const UserCredentialsContext = createContext();

export const UserCredentialsProvider = ({ credentialsID, children }) => {
    const [userCredentials, setUserCredentials] = useState([]);
    const [userCredentialsLoading, setLoading] = useState(true);
    const [userCredentialsError, setError] = useState(null);

    const fetchUserCredentials = useCallback(async () => {
        try {        
            setLoading(true);
            const response = await new UserCredentialsAPI().getUserCredentials(credentialsID);
            if (response?.ok) {
                setUserCredentials(response.data);
            } else {
                console.error(response.statusMessage);
                setError(response.statusMessage);
            }
        } catch (err) {
            console.error("Error fetching user credentials:", err);
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [credentialsID]);

    useEffect(() => {
        fetchUserCredentials();
    }, [fetchUserCredentials]);

    return (
        <UserCredentialsContext.Provider value={{ userCredentials, userCredentialsLoading, userCredentialsError, refresh: fetchUserCredentials }}>
            {children}
        </UserCredentialsContext.Provider>
    );
};

// Custom hook for easier use
export const useUserCredentials = () => useContext(UserCredentialsContext);