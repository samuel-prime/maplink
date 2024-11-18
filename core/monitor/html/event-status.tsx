import type { _SDK } from "core/maplink/types";
import * as elements from "typed-html";

export function EventStatus({ createdAt, description, type }: _SDK.Api.Event.Data) {
  const timestamp = new Date(createdAt);

  return (
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="font-medium">{type}</span>

        {description === "TERMINATE" || description === "SOLVED" ? (
          <span class="text-green-500 font-medium">{description}</span>
        ) : typeof description === "string" && description.includes("%") ? (
          <span class="text-orange-500">{description}</span>
        ) : (
          <span class="text-blue-500">{description}</span>
        )}
      </div>

      <span class="text-sm">[ {timestamp.toLocaleString("pt-BR")} ]</span>
    </div>
  );
}
