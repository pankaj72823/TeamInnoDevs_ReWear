import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token && !user) {
      fetchUserFromToken(token);
    }
  }, [token]);

  const fetchUserFromToken = async (jwt) => {
   try {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  console.log(res);
  setUser(res.data);
} catch (err) {
  console.error("Invalid token or fetch failed");
  setToken(null);
  setUser(null);
  localStorage.removeItem("token");
}
  };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    fetchUserFromToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ token, user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
