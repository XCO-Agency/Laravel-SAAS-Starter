type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

async function request<T = unknown>(method: HttpMethod, url: string, options: RequestOptions = {}): Promise<{ data: T; response: Response }> {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': csrfToken(),
        ...options.headers,
    };

    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data: T = undefined as T;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        data = await response.json();
    }

    return { data, response };
}

const http = {
    get: <T = unknown>(url: string, options?: RequestOptions) => request<T>('GET', url, options),
    post: <T = unknown>(url: string, options?: RequestOptions) => request<T>('POST', url, options),
    put: <T = unknown>(url: string, options?: RequestOptions) => request<T>('PUT', url, options),
    patch: <T = unknown>(url: string, options?: RequestOptions) => request<T>('PATCH', url, options),
    delete: <T = unknown>(url: string, options?: RequestOptions) => request<T>('DELETE', url, options),
};

export default http;
