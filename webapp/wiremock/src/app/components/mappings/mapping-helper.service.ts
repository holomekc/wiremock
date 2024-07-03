import { Injectable } from "@angular/core";
import { StubMapping } from "../../model/wiremock/stub-mapping";
import { UtilService } from "../../services/util.service";

@Injectable()
export class MappingHelperService {
  // private static COPY_FAILURE = 'Was not able to copy. Details in log';

  static helperAddFolder(mapping?: StubMapping): StubMapping | undefined {
    if (mapping) {
      if (UtilService.isUndefined(mapping.metadata)) {
        mapping.metadata = {};
      }
      if (UtilService.isUndefined(mapping.metadata[UtilService.WIREMOCK_GUI_KEY])) {
        mapping.metadata[UtilService.WIREMOCK_GUI_KEY] = {};
      }
      if (UtilService.isUndefined(mapping.metadata[UtilService.WIREMOCK_GUI_KEY][UtilService.DIR_KEY])) {
        mapping.metadata[UtilService.WIREMOCK_GUI_KEY][UtilService.DIR_KEY] = "/some/path";
      }
    }
    return mapping;
  }

  static helperAddDelay(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response && !mapping.response.fixedDelayMilliseconds) {
      mapping.response.fixedDelayMilliseconds = 2000;
      return mapping;
    }
    return undefined;
  }

  static helperAddPriority(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && !mapping.priority) {
      mapping.priority = 1;
      return mapping;
    }
    return undefined;
  }

  static helperAddHeaderRequest(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.request && !mapping.request.headers) {
      mapping.request.headers = {
        "Content-Type": {
          matches: ".*/xml",
        },
      };
      return mapping;
    }
    return undefined;
  }

  static helperAddHeaderResponse(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response && !mapping.response.headers) {
      mapping.response.headers = { "Content-Type": "application/json" };
      return mapping;
    }
    return undefined;
  }

  static helperAddScenario(mapping?: StubMapping): StubMapping | undefined {
    if (mapping) {
      if (UtilService.isUndefined(mapping.scenarioName)) {
        mapping.scenarioName = "";
      }

      if (UtilService.isUndefined(mapping.newScenarioState)) {
        mapping.newScenarioState = "";
      }

      if (UtilService.isUndefined(mapping.requiredScenarioState)) {
        mapping.requiredScenarioState = "";
      }
    }

    return mapping;
  }

  static helperToJsonBody(mapping?: StubMapping): StubMapping | undefined {
    if (!mapping || !mapping.response || mapping.response.jsonBody || !mapping.response.body) {
      return;
    }

    mapping.response.jsonBody = JSON.parse(mapping.response.body);
    delete mapping.response.body;

    return mapping;
  }

  static helperAddProxyBaseUrl(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response && !mapping.response.proxyBaseUrl) {
      mapping.response.proxyBaseUrl = "https://";
      return mapping;
    }
    return undefined;
  }

  static helperAddRemoveProxyPathPrefix(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response && !mapping.response.proxyUrlPrefixToRemove) {
      mapping.response.proxyUrlPrefixToRemove = "/other/service/";
      return mapping;
    }
    return undefined;
  }

  static helperAddAdditionalProxyRequestHeaders(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response && !mapping.response.additionalProxyRequestHeaders) {
      mapping.response.additionalProxyRequestHeaders = {
        "User-Agent": "Mozilla/5.0 (iPhone; U; CPU iPhone)",
      };
      return mapping;
    }
    return undefined;
  }

  static helperAddResponseTemplatingTransformer(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response) {
      if (!mapping.response.transformers) {
        mapping.response.transformers = ["response-template"];
      } else if (
        typeof mapping.response.transformers.includes === "function" &&
        typeof mapping.response.transformers.push === "function"
      ) {
        const transformers = mapping.response.transformers as string[];
        if (!transformers.includes("response-template")) {
          transformers.push("response-template");
        }
      }
      return mapping;
    }
    return undefined;
  }

  static helperSetBodyFileName(mapping?: StubMapping, fileName?: string): StubMapping | undefined {
    if (mapping && mapping.response) {
      mapping.response.bodyFileName = fileName || "some-file.txt";
      return mapping;
    }
    return undefined;
  }

  static helperRemoveBodyFileName(mapping?: StubMapping): StubMapping | undefined {
    if (mapping && mapping.response && mapping.response.bodyFileName) {
      delete mapping.response.bodyFileName;
      return mapping;
    }
    return undefined;
  }

  static helperAddWebhook(mapping?: StubMapping): StubMapping | undefined {
    if (mapping) {
      if (UtilService.isUndefined(mapping.serveEventListeners)) {
        mapping.serveEventListeners = [];
      }
      mapping.serveEventListeners.push({
        name: "webhook",
        parameters: {
          method: "POST",
          url: "https://localhost",
          headers: {
            "Content-Type": "application/json",
          },
          body: "{}",
        },
      });
      return mapping;
    }

    return undefined;
  }
}
