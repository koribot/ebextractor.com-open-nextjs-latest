import kunsul from "kunsul";

interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  signal?: AbortSignal;
}

interface ResponseStructure<T = any> {
  success: boolean;
  status: number;
  errorDescription?: string;
  errorType?: string;
  message: string;
  requestsData: T;
  headers: Headers;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const responseHandler = async <T = any>(
  response: Response,
): Promise<ResponseStructure<T>> => {
  if (response.status === 429) {
    return Promise.resolve<ResponseStructure<T>>({
      success: false,
      status: 429,
      message: "Error Occured",
      errorDescription: "Rate limit exceeded",
      headers: response.headers,
      requestsData: null as T,
    });
  }
  let _data: T | string | Blob | null = null;
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    _data = (response && ((await response.json()) as T)) || null;
  } else if (contentType.includes("text/")) {
    _data = (response && (await response.text())) || null;
  } else {
    _data = (response && (await response.blob())) || null; // Handle binary data as a fallback
  }

  /**
   * !(_data as any).success -> this is to check if we use http util to fetch on our own api
   * we follow a certain response structure: {success: boolean, message: string, data: any, error?, errorDescription?}
   */
  if (!response.ok || (_data as any).success === false) {
    return Promise.resolve<ResponseStructure<T>>({
      success: false,
      status: (_data as any)?.status || response.status,
      message: (_data as any)?.message || "Error Occured",
      errorType: (_data as any)?.errorType || "",
      errorDescription:
        (_data as any) !== null
          ? (_data as any).errorDescription
          : "Something Went Wrong",
      requestsData: (_data as any) || (null as T), // we put _data first when we use this util to fetch on our own api that has a differect structure of data
      headers: response.headers,
    });
  }
  return Promise.resolve<ResponseStructure<T>>({
    success: true,
    message: "Sucessful",
    status: response.status,
    requestsData: _data as T,
    headers: response.headers,
  });
};

const http_verbs = {
  get: async <T = any>(
    url: string,
    config?: RequestConfig,
  ): Promise<ResponseStructure<T>> => {
    const response = await fetch(`${url}`, {
      ...config,
      headers: {
        ...config?.headers,
        "e-grant": "ebextractor-20",
      },
    });
    return responseHandler<T>(response);
  },

  post: async <T = any>(
    url: string,
    body: any,
    config?: RequestConfig,
  ): Promise<ResponseStructure<T>> => {
    const _body = typeof body === "string" ? body : JSON.stringify(body);
    const response = await fetch(`${url}`, {
      method: "POST",
      body: _body,
      ...config,
      headers: {
        ...config?.headers,
        "e-grant": "ebextractor-20",
      },
    });
    await sleep(1000);
    return responseHandler<T>(response);
  },
  postFormData: async <T = any>(
    url: string,
    formData: FormData,
    config?: RequestConfig,
  ): Promise<ResponseStructure<T>> => {
    const response = await fetch(`${url}`, {
      method: "POST",
      body: formData,
      ...config,
      headers: {
        ...config?.headers,
        "e-grant": "ebextractor-20",
      },
    });
    await sleep(1000);
    return responseHandler<T>(response);
  },

  put: async <T = any>(
    url: string,
    body: any,
    config?: RequestConfig,
  ): Promise<ResponseStructure<T>> => {
    const response = await fetch(`${url}`, {
      method: "PUT",
      body: JSON.stringify(body),
      ...config,
      headers: {
        ...config?.headers,
        "e-grant": "ebextractor-20",
      },
    });
    await sleep(1000);
    return responseHandler<T>(response);
  },

  delete: async <T = any>(
    url: string,
    config?: RequestConfig,
  ): Promise<ResponseStructure<T>> => {
    const response = await fetch(`${url}`, {
      method: "DELETE",
      ...config,
      headers: {
        ...config?.headers,
        "e-grant": "ebextractor-20",
      },
    });
    return responseHandler<T>(response);
  },
};
const requests = http_verbs;
export default requests;
