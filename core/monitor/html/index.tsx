// biome-ignore lint:
import * as elements from "typed-html";
import { BaseHtml } from "./base-html";
import { EventMonitor } from "./event-monitor";

export function MonitorPage({ children, serverEndpoint }: { serverEndpoint: string } & elements.Children) {
  return (
    <BaseHtml>
      <EventMonitor serverEndpoint={serverEndpoint}>{children}</EventMonitor>
    </BaseHtml>
  );
}
