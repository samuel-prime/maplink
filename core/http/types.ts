export namespace _Http {
  export type Methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  type CommonHeaders = {
    authorization: string;
    "content-type":
      | "application/x-www-form-urlencoded"
      | "multipart/form-data"
      | "application/json"
      | "text/plain"
      | "text/html"
      | (string & {});
  };

  export type Headers = { [x: string]: string } & Partial<CommonHeaders>;
}
