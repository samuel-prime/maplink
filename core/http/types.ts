export namespace _Http {
  export type Methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  type CommonHeaders = {
    authorization: string;
    "content-type":
      | "application/x-www-form-urlencoded"
      | "application/json"
      | "multipart/form-data"
      | "text/event-stream"
      | "text/plain"
      | "text/html"
      | (string & {});
  };

  export type Headers = { [x: string]: string } & Partial<CommonHeaders>;
}
