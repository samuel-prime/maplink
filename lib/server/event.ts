import { stringify } from "utils/stringify";

export class ServerEvent<T> {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly data: T,
  ) {}

  toString() {
    return `id: ${this.id}\nevent: ${this.name}\ndata: ${stringify(this.data)}\n\n`;
  }
}
