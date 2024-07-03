export class ResponseDefinition {
  status!: number;
  statusMessage!: string;
  body?: string;

  jsonBody?: any;
  base64Body?: string;
  bodyFileName?: string;

  headers!: any;

  additionalProxyRequestHeaders?: any;

  removeProxyRequestHeaders?: any[];
  fixedDelayMilliseconds?: number;

  delayDistribution: any;

  chunkedDribbleDelay: any;
  proxyBaseUrl?: string;
  proxyUrlPrefixToRemove?: string;

  fault: any;

  transformers: any;

  transformerParameters: any;
  fromConfiguredStub?: boolean;

  deserialize(unchecked: ResponseDefinition): ResponseDefinition {
    return unchecked;
  }
}
