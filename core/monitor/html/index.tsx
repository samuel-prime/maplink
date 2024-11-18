// biome-ignore lint:
import * as elements from "typed-html";
import { BaseHtml } from "./base-html";
import { EventMonitor } from "./event-monitor";

export function MonitorPage({ children }: elements.Children) {
  return (
    <BaseHtml>
      <EventMonitor>{children}</EventMonitor>
    </BaseHtml>
  );
}
