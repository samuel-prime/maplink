// biome-ignore lint:
import * as elements from "typed-html";

export function BaseHtml({ children }: elements.Children) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MaplinkSDK Monitor</title>
        <script src="https://cdn.tailwindcss.com" />
        <script
          integrity="sha384-0895/pl2MU10Hqc6jd4RvrthNlDiE9U1tWmX7WRESftEDRosgxNsQG/Ze9YMRzHq"
          src="https://unpkg.com/htmx.org@2.0.3"
          crossorigin="anonymous"
        />
        <script src="https://unpkg.com/htmx-ext-sse@2.2.2/sse.js" />
        <script src="https://unpkg.com/hyperscript.org@0.9.13" />
        <script src="https://unpkg.com/@alenaksu/json-viewer@2.1.0/dist/json-viewer.bundle.js" />
      </head>
      <body class="text-slate-800 size-full bg-gray-50 flex flex-col p-10 gap-8">
        <header class="flex gap-6 justify-between">
          <h1 class="text-2xl font-bold">MaplinkSDK Monitor</h1>
        </header>

        <main class="bg-gray-100 p-6 rounded-lg flex-1">{children}</main>
      </body>
    </html>
  );
}
