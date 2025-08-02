export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (err) {
    console.error("Token decode failed:", err);
    return null;
  }
}
