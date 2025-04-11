import { RequestPattern } from "./request-pattern";
import { ResponseDefinition } from "./response-definition";
import { Item } from "./item";
import { UtilService } from "../../services/util.service";
import { Proxy } from "./proxy";
import { ProxyConfig } from "./proxy-config";
import { ServeEventListenerDefinition } from "./serve-event-listener-definition";

export class StubMapping extends Proxy implements Item {
  uuid!: string;
  name!: string;
  persistent!: boolean;
  request!: RequestPattern;
  response!: ResponseDefinition;
  priority!: number;
  scenarioName!: string;
  requiredScenarioState!: string;
  newScenarioState!: string;

  postServeActions!: Map<string, any>;

  serveEventListeners!: ServeEventListenerDefinition[];

  metadata: any;

  constructor() {
    super();
  }

  static createEmpty(): StubMapping {
    const mapping: StubMapping = new StubMapping();

    mapping.request = new RequestPattern();
    mapping.request.method = "GET";
    mapping.request.url = "";

    mapping.response = new ResponseDefinition();
    mapping.response.status = 200;
    mapping.response.jsonBody = {
      some: "value",
    };
    mapping.response.headers = {
      "Content-Type": "application/json",
    };

    return mapping;
  }

  deserialize(unchecked: StubMapping, proxyConfig?: ProxyConfig): StubMapping {
    this.uuid = unchecked.uuid;
    this.name = unchecked.name;
    this.persistent = unchecked.persistent;
    this.request = new RequestPattern().deserialize(unchecked.request);
    this.response = new ResponseDefinition().deserialize(unchecked.response);
    this.priority = unchecked.priority;
    this.scenarioName = unchecked.scenarioName;
    this.requiredScenarioState = unchecked.requiredScenarioState;
    this.newScenarioState = unchecked.newScenarioState;
    this.metadata = unchecked.metadata;
    this.postServeActions = unchecked.postServeActions;
    this.serveEventListeners = unchecked.serveEventListeners;

    if (proxyConfig && (this.response.proxyBaseUrl || proxyConfig.proxyConfig.has(this.uuid))) {
      this.setProxy(true);
      this.setProxyEnabled(!proxyConfig.proxyConfig.has(this.uuid));
    }

    return this;
  }

  getTitle(): string {
    return (
      this.name ??
      this.request.url ??
      this.request.urlPattern ??
      this.request.urlPath ??
      this.request.urlPathPattern ??
      this.request.urlPathTemplate
    );
  }

  getSubtitle(): string {
    const soapResult = this.extractSoapResult();
    let result = "";
    if (soapResult.length > 0) {
      result = soapResult;
    } else {
      result = "method=" + this.request.method;
    }

    result = result + `, status=${this.response.status}`;

    if (this.name) {
      if (this.request.url) {
        result = result + `, url=${this.request.url}`;
      } else if (this.request.urlPattern) {
        result = result + `, urlPattern=${this.request.urlPattern}`;
      } else if (this.request.urlPath) {
        result = result + `, urlPath=${this.request.urlPath}`;
      } else if (this.request.urlPathPattern) {
        result = result + `, url=${this.request.urlPathPattern}`;
      }
    }
    return result;
  }

  private extractSoapResult(): string {
    let soapResult = "";
    let soap: RegExpExecArray | null;
    if (this.request && this.request.bodyPatterns && this.request.bodyPatterns) {
      for (const bodyPattern of this.request.bodyPatterns) {
        if (
          UtilService.isDefined(bodyPattern.matchesXPath) &&
          UtilService.isDefined((soap = UtilService.getSoapXPathRegex().exec(bodyPattern.matchesXPath))) &&
          soap
        ) {
          if (soapResult.length !== 0) {
            soapResult += ", ";
          }
          soapResult += soap[2];
        }
      }
    }
    return soapResult;
  }

  getId(): string {
    return this.uuid;
  }

  getCode(): string {
    return UtilService.itemModelStringify(this);
  }

  hasFolderDefinition(): boolean {
    return UtilService.isDefined(this.getFolderName());
  }

  getFolderName(): string | undefined {
    if (UtilService.isFolderDefined(this)) {
      return this.metadata[UtilService.WIREMOCK_GUI_KEY][UtilService.DIR_KEY];
    }
    return undefined;
  }

  getBodyFileName(): string | undefined {
    return this.response.bodyFileName;
  }

  hasFile(): boolean {
    return this.response.bodyFileName !== undefined;
  }

  isPersistent(): boolean {
    return this.persistent;
  }

  isHighPrio(): boolean {
    return this.priority !== undefined && this.priority < 5;
  }
  isLowPrio(): boolean {
    return this.priority !== undefined && this.priority > 5;
  }
}
