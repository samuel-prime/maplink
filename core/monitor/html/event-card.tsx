import type { _SDK } from "core/maplink/types";
import * as elements from "typed-html";
import type { FetchEvent } from "../fetch-event";
import { EventStatus } from "./event-status";

export function EventCard(fetchEvent: FetchEvent<any, any>, status?: _SDK.Api.Event.Data) {
  const { id, name, data } = fetchEvent;
  const { request, response, timestamp, duration } = data;

  const htmlId = id.replaceAll("-", "");

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
          <div class="flex gap-6 items-center">
            {status && (status.description === "TERMINATE" || status.description === "SOLVED") ? (
              <EventStatus
                type={status.type}
                createdAt={status.createdAt}
                description={status.description}
                id={status.id}
                jobId={status.jobId}
              />
            ) : (
              data.jobId && (
                <div hx-ext="sse" sse-connect="/fetch-stream/callback/html" sse-swap={data.jobId}>
                  {status && (
                    <EventStatus
                      type={status.type}
                      createdAt={status.createdAt}
                      description={status.description}
                      id={status.id}
                      jobId={status.jobId}
                    />
                  )}
                </div>
              )
            )}

            <span class="flex gap-2 items-center">
              <strong>id:</strong> {id}
            </span>
          </div>
        </summary>

        <div class="mt-4 grid grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">Request</h3>

              <div class="flex items-center gap-2">
                <input
                  class="text-sm border border-slate-300 rounded-md px-2 py-0.5 w-40"
                  placeholder="filter"
                  onkeydown={`(({key, target: {value}}) => {if (key === 'Enter') document.querySelector('#request-${htmlId}').filter(new RegExp(".*" + value + ".*"))})(event)`}
                />

                <input
                  class="text-sm border border-slate-300 rounded-md px-2 py-0.5 w-40"
                  placeholder="search"
                  onkeydown={`((e) => {if (e.key === 'Enter') document.querySelector('#request-${htmlId}').search(e.target.value).next();})(event)`}
                />

                {
                  // biome-ignore lint:
                  <button
                    class="bg-slate-100 rounded-md px-2 py-0.5 text-sm"
                    onclick={`document.querySelector('#request-${htmlId}').collapseAll()`}
                  >
                    collapse
                  </button>
                }

                {
                  // biome-ignore lint:
                  <button
                    class="bg-slate-100 rounded-md px-2 py-0.5 text-sm"
                    onclick={`document.querySelector('#request-${htmlId}').expandAll()`}
                  >
                    expand
                  </button>
                }

                {
                  // biome-ignore lint:
                  <button
                    class="bg-slate-800 rounded-md px-2 py-0.5 text-sm text-white"
                    _={`on click writeText('${JSON.stringify(request)}') on navigator.clipboard
                  put 'copied!' into me
                  wait 1s
                  put 'copy' into me`}
                  >
                    copy
                  </button>
                }
              </div>
            </div>
            <json-viewer id={`request-${htmlId}`} class="px-4 py-2 rounded-lg text-sm" data={JSON.stringify(request)} />
          </div>
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">Response</h3>

              <div class="flex items-center gap-2">
                <input
                  class="text-sm border border-slate-300 rounded-md px-2 py-0.5 w-40"
                  placeholder="filter"
                  onkeydown={`(({key, target: {value}}) => {if (key === 'Enter') document.querySelector('#response-${htmlId}').filter(new RegExp(".*" + value + ".*"))})(event)`}
                />

                <input
                  class="text-sm border border-slate-300 rounded-md px-2 py-0.5 w-40"
                  placeholder="search"
                  onkeydown={`((e) => {if (e.key === 'Enter') document.querySelector('#response-${htmlId}').search(e.target.value).next();})(event)`}
                />

                {
                  // biome-ignore lint:
                  <button
                    class="bg-slate-100 rounded-md px-2 py-0.5 text-sm"
                    onclick={`document.querySelector('#response-${htmlId}').collapseAll()`}
                  >
                    collapse
                  </button>
                }

                {
                  // biome-ignore lint:
                  <button
                    class="bg-slate-100 rounded-md px-2 py-0.5 text-sm"
                    onclick={`document.querySelector('#response-${htmlId}').expandAll()`}
                  >
                    expand
                  </button>
                }

                {
                  // biome-ignore lint:
                  <button
                    class="bg-slate-800 rounded-md px-2 py-0.5 text-sm text-white"
                    _={`on click writeText('${JSON.stringify(response)}') on navigator.clipboard
                  put 'copied!' into me
                  wait 1s
                  put 'copy' into me`}
                  >
                    copy
                  </button>
                }
              </div>
            </div>

            <json-viewer
              id={`response-${htmlId}`}
              class="px-4 py-2 rounded-lg text-sm"
              data={JSON.stringify(response)}
            />
          </div>
        </div>
      </details>
    </li>
  );
}
