export function getApiBase() {
  return process.env.REACT_APP_API_URL || "http://localhost:4000";
}

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem("leaftrack_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
