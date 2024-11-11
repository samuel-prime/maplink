// biome-ignore lint:
import * as elements from "typed-html";
import { BaseHtml } from "./base-html";
import { EventMonitor } from "./event-monitor";

export function MonitorPage({ url, children }: { url: string } & elements.Children) {
  return (
    <BaseHtml>
      <EventMonitor url={url}>{children}</EventMonitor>
    </BaseHtml>
  );
}
