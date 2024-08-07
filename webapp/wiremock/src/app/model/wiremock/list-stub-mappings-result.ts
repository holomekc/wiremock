import { StubMapping } from "./stub-mapping";
import { UtilService } from "../../services/util.service";
import { ProxyConfig } from "./proxy-config";

export class ListStubMappingsResult {
  meta: any;
  mappings: StubMapping[] = [];

  public static hasItems(value: ListStubMappingsResult): boolean {
    return UtilService.isDefined(value) && UtilService.isDefined(value.mappings) && value.mappings.length > 0;
  }

  deserialize(unchecked: ListStubMappingsResult, proxyConfig?: ProxyConfig): ListStubMappingsResult {
    this.meta = unchecked.meta;
    this.mappings = [];
    unchecked.mappings.forEach(mapping => {
      this.mappings.push(new StubMapping().deserialize(mapping, proxyConfig));
    });

    return this;
  }
}
