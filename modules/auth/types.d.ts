/**
 * Configuration for the auth module.
 */
declare type AuthConfig = {
  /**
   *  The client ID for authentication.
   */
  clientId: string;
  /**
   * The client secret for authentication.
   */
  clientSecret: string;
  /**
   * The interval (in **minutes**) at which the refresh token should be renewed.
   */
  refreshTokenInterval: number;
};

/**
 * Response received after a successful authentication attempt.
 */
declare type AuthResponse = {
  refresh_token_expires_in: string;
  api_product_list: string;
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
