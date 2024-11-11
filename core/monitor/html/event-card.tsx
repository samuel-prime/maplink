import * as elements from "typed-html";
import type { FetchEvent } from "../fetch-event";

export function EventCard(fetchEvent: FetchEvent<any, any>) {
  const { id, name, data } = fetchEvent;
  const { request, response, timestamp, duration } = data;

  return (
    <li class="bg-gray-50 rounded-md">
      <details class="p-4">
        <summary class="flex justify-between items-center">
          <div class="flex gap-4 items-center">
            <span class="bg-slate-200 rounded-md px-2 py-1">{name}</span>

            {response.type === "success" ? (
              <span class="bg-green-500 rounded-md px-2 py-1 text-white">{response.type}</span>
            ) : response.type === "failure" ? (
              <span class="bg-red-500 rounded-md px-2 py-1 text-white">{response.type}</span>
            ) : (
              <span class="bg-purple-500 rounded-md px-2 py-1 text-white">{response.type}</span>
            )}

            <span class="text-sm">[ {timestamp.toLocaleString("pt-BR")} ]</span>
            <strong>{new URL(request.url).pathname}</strong>

            <span class="rounded-md border border-slate-300 text-sm py-0.5 px-2">{duration} ms</span>
          </div>
          <span>
            <strong>id:</strong> {id}
          </span>
        </summary>

        <div class="mt-4 grid grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-4">Request</h3>
            <json-viewer class="px-4 py-2 rounded-lg text-sm" data={JSON.stringify(request)} />
          </div>
          <div>
            <h3 class="font-semibold mb-4">Response</h3>
            <json-viewer class="px-4 py-2 rounded-lg text-sm" data={JSON.stringify(response)} />
          </div>
        </div>
      </details>
    </li>
  );
}
