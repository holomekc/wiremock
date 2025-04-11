export class RequestPattern {
  url?: string;
  urlPattern?: string;
  urlPath?: string;
  urlPathPattern?: string;
  urlPathTemplate?: string;
  method?: string;

  headers: any;

  queryParameters: any;

  cookies: any;

  basicAuth: any;

  bodyPatterns?: any[];

  customMatcher: any;

  deserialize(unchecked: RequestPattern): RequestPattern {
    return unchecked;
  }
}
