import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole]   = useState(() => localStorage.getItem('role') || null);

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  const login = (userData, tok, r) => {
    setUser(userData); setToken(tok); setRole(r);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tok);
    localStorage.setItem('role', r);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
  };

  const logout = () => {
    setUser(null); setToken(null); setRole(null);
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
