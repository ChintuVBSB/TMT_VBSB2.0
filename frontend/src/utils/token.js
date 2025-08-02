import {jwtDecode} from "jwt-decode";



export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");



export const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.role || null;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};
