import type { _Api } from "lib/api/types";
import type { Http } from "utils/types";

export interface FetchEventData<T, E> {
  jobId?: string;
  timestamp: Date;
  duration?: number;
  request: { method: Http.Methods; url: string; body: _Api.Request.Body };
  response: { ok: boolean; code: number; status: string; data: Error | T | E; type: string };
}
