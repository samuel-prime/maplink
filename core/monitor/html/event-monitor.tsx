import { join } from "node:path";
// biome-ignore lint:
import * as elements from "typed-html";

export function EventMonitor({ children, serverEndpoint }: { serverEndpoint: string } & elements.Children) {
  return (
    <div>
      <div
        hx-ext="sse"
        sse-connect={join(serverEndpoint, "/fetch-stream/html")}
        sse-swap="geocode,planning,trip"
        hx-swap="afterbegin"
        hx-target="#events-list"
      />
      <ul id="events-list" class="flex flex-col gap-4">
        {children}
      </ul>
    </div>
  );
}
