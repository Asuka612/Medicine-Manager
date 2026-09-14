const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("access_token");

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
            ...options,
            headers
        }
    );

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        localStorage.removeItem("token");
        localStorage.removeItem("admin_id");
        localStorage.removeItem("adminId");

        window.location.href = "/login";
    }

    return response;
}

export { API_BASE_URL };