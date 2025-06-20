import { Item } from "./item";
import { UtilService } from "../../services/util.service";
import { Proxy } from "./proxy";
import { format, Locale } from "date-fns";

let allLocales: { [key: string]: Locale };
import("date-fns/locale").then(locales => {
  allLocales = locales;
});

export class LoggedRequest extends Proxy implements Item {
  url!: string;
  absoluteUrl!: string;
  clientIp!: string;
  method!: string;
  headers: any;
  cookies: any;
  queryParams: any;
  body!: string;
  bodyAsBase64!: string;
  browserProxyRequest!: boolean;
  loggedDate: any;
  date!: string;
  protocol!: string;
  multiparts!: any[];

  constructor() {
    super();
  }

  getTitle(): string {
    return this.url;
  }

  getSubtitle(): string {
    let soap;
    if (UtilService.isDefined(this.body) && (soap = UtilService.getSoapMethodRegex().exec(this.body))) {
      return soap[2];
    }
    return "method=" + this.method;
  }

  getId(): string {
    // value exists in transient layer. This way we skip typescripts type safety.

    return (this as any).id;
  }

  getCode(): string {
    return UtilService.itemModelStringify(this);
  }

  hasFolderDefinition(): boolean {
    return false;
  }

  getFolderName(): string | undefined {
    return undefined;
  }

  deserialize(unchecked: LoggedRequest): LoggedRequest {
    // We hide a generated id in a "transient" layer
    UtilService.transient(this, "id", UtilService.generateUUID());
    this.url = unchecked.url;
    this.absoluteUrl = unchecked.absoluteUrl;
    this.clientIp = unchecked.clientIp;
    this.method = unchecked.method;
    this.headers = unchecked.headers;
    this.cookies = unchecked.cookies;
    this.queryParams = unchecked.queryParams;
    this.body = unchecked.body;
    this.bodyAsBase64 = unchecked.bodyAsBase64;
    this.browserProxyRequest = unchecked.browserProxyRequest;
    this.loggedDate = unchecked.loggedDate;

    this.date = format(this.loggedDate, "P pppp", {
      locale: this.getLocale(),
    });
    this.protocol = unchecked.protocol;
    this.multiparts = unchecked.multiparts;

    return this;
  }

  private getLocale(): Locale {
    const locale = navigator.language.replace("-", "");
    const rootLocale = locale.substring(0, 2);

    return allLocales[locale] || allLocales[rootLocale] || allLocales["enUS"];
  }

  getBodyFileName(): string | undefined {
    return undefined;
  }

  hasFile(): boolean {
    return false;
  }

  isPersistent(): boolean {
    return false;
  }

  isHighPrio(): boolean {
    return false;
  }

  isLowPrio(): boolean {
    return false;
  }
}
