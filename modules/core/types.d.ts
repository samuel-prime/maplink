declare type MaplinkConfig = { url: string; enableLogger?: boolean } & OAuthConfig;

declare type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  refreshTokenInterval: number;
};

declare type MaplinkProductList =
  | "Matrix"
  | "Restriction Zone"
  | "Trip"
  | "Planning"
  | "Maps"
  | "Toll"
  | "Freight"
  | "Tracking"
  | "Place"
  | "Emission"
  | "Geocode";

declare type OAuthResponse = {
  refresh_token_expires_in: string;
  api_product_list: `${MaplinkProductList[]}`;
  api_product_list_json: MaplinkProductList[];
  organization_name: string;
  "developer.email": string;
  token_type: string;
  issued_at: string;
  client_id: string;
  access_token: string;
  application_name: string;
  scope: string;
  expires_in: string;
  refresh_count: string;
  status: string;
};
