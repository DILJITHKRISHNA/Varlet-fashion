// Calls to the Varlet backend (../backend). VITE_ variables ship to the browser,
// so only the public API address belongs here.
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const UNREACHABLE = "We couldn't reach Varlet just now. Check your connection and try again.";

function describe(status: number, detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    const field = detail[0].loc?.at(-1);
    return `Please check ${String(field ?? "the form").replace(/_/g, " ")}: ${detail[0].msg}`;
  }
  return status >= 500 ? UNREACHABLE : "Something went wrong. Please try again.";
}

/** Starts a sleeping server early, so it is ready by the time a form is sent. */
export function wakeApi(): void {
  if (API_URL) fetch(`${API_URL}/health`).catch(() => {});
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new ApiError("Store registration isn't available on this site yet.", 0);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // A free server that has been asleep can take about a minute to answer.
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    throw new ApiError(UNREACHABLE, 0);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(describe(response.status, data?.detail), response.status);
  return data as T;
}
