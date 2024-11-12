// biome-ignore lint:
import * as elements from "typed-html";

export function EventMonitor({ url, children }: { url: string } & elements.Children) {
  return (
    <div>
      <div
        hx-ext="sse"
        sse-connect={url}
        sse-swap="auth,geocode,planning,trip"
        hx-swap="afterbegin"
        hx-target="#events-list"
      />
      <ul id="events-list" class="flex flex-col gap-4">
        {children}
      </ul>
    </div>
  );
}
