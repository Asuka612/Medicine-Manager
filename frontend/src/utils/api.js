const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("access_token");

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(
        `${API_BASE_URL}${path}`,
        {
            ...options,
            headers
        }
    );
}

export { API_BASE_URL };