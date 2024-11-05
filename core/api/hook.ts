import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { Api } from ".";
import type { ApiFetch } from "./fetch";
import type { _Api } from "./types";

export class ApiHookManager {
  readonly #hooks = new Map<Api, ApiHook[]>();
  #global: ApiHook[] = [];

  append<T extends _Api.Hooks.Moments>(hook: ApiHook<T>) {
    assert(hook instanceof ApiHook, "Hook must be an instance of the ApiHook class.");
    const { api } = hook;

    if (!api) {
      this.#global.push(hook);
      return;
    }

    assert(api instanceof Api, "Api must be an instance of the Api class.");
    const hooks = this.#hooks.get(api) ?? [];
    hooks.push(hook);

    this.#updateHooks(api, hooks);
  }

  remove(hook: ApiHook) {
    if (!hook.api) {
      this.#global = this.#global.filter((h) => h.id !== hook.id);
      return;
    }

    const hooks = this.#hooks.get(hook.api);
    if (!hooks) return;

    this.#updateHooks(
      hook.api,
      hooks.filter((h) => h.id !== hook.id),
    );
  }

  changeToGlobal(hook: ApiHook) {
    if (hook.api && this.#hooks.has(hook.api)) {
      this.remove(hook);
      this.#global.push(hook);
    }
  }

  beforeFetch(api?: Api) {
    return this.#getHooks(api).filter((hook) => hook.moment === "beforeFetch") as ApiHook<"beforeFetch">[];
  }

  afterFetch(api?: Api) {
    return this.#getHooks(api).filter((hook) => hook.moment === "afterFetch") as ApiHook<"afterFetch">[];
  }

  #getHooks(api?: Api): ApiHook[] {
    this.pruneHooks();
    return [...((api && this.#hooks.get(api)) ?? []), ...this.#global];
  }

  #updateHooks(api: Api, hooks: ApiHook[]) {
    hooks.length > 0 ? this.#hooks.set(api, hooks) : this.#hooks.delete(api);
  }

  pruneHooks() {
    this.#global = this.#global.filter((hook) => hook.isActive);

    for (const [key, value] of this.#hooks) {
      this.#updateHooks(
        key,
        value.filter((hook) => hook.isActive),
      );
    }
  }
}

export class ApiHook<T extends _Api.Hooks.Moments = _Api.Hooks.Moments> {
  readonly execute: _Api.Hooks.Function;
  readonly id = randomUUID();
  #executeOnce = false;
  #isActive = true;

  constructor(
    readonly moment: T,
    hook: _Api.Hooks.Function,
    readonly api?: Api,
  ) {
    this.execute = this.#decorateHook(hook).bind(this);
  }

  get executeOnce() {
    return this.#executeOnce;
  }

  get isActive() {
    return this.#isActive;
  }

  once(): ApiHook<T> {
    this.#executeOnce = true;
    return this;
  }

  disable() {
    this.#isActive = false;
  }

  #decorateHook(hook: _Api.Hooks.Function) {
    return async <T, E>(fetch: ApiFetch<T, E>) => {
      if (!this.isActive) return;
      if (this.#executeOnce) this.disable();
      await hook(fetch);
    };
  }
}
