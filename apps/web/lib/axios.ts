import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";

/**
 * FLAG FOR ARCHITECT / BACKEND:
 * This file only configures the client — it does not call any endpoint.
 * Per "never connect to an unbuilt API endpoint," no page/component should
 * import this until Backend confirms the routes it will hit actually exist.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_API_URL is not set — apiClient will fail on first request.",
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    const accessToken = (session as { accessToken?: string } | null)
      ?.accessToken;

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

export interface ApiErrorShape {
  status: number | null;
  message: string;
  code?: string;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status ?? null;

    if (status === 401) {
      // Session is invalid/expired server-side — force a clean re-login.
      await signOut({ callbackUrl: "/login" });
    }

    const normalized: ApiErrorShape = {
      status,
      message:
        error.response?.data?.message ??
        error.message ??
        "An unexpected error occurred.",
      code: error.response?.data?.code,
    };

    return Promise.reject(normalized);
  },
);
