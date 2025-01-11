import { ElementRef, Injectable, QueryList } from "@angular/core";
import { Item } from "../model/wiremock/item";
import { Message, MessageService, MessageType } from "../components/message/message.service";
import { StubMapping } from "../model/wiremock/stub-mapping";
import { v4 as uuidv4 } from "uuid";
import xmlFormat from "xml-formatter";
import { Ace } from "ace-builds";
import EditorOptions = Ace.EditorOptions;

@Injectable()
export class UtilService {
  public static WIREMOCK_GUI_KEY = "wiremock-gui";
  public static DIR_KEY = "folder";

  public static copyToClipboard(text: string): boolean {
    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

    const textArea = document.createElement("textarea");

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = "2em";
    textArea.style.height = "2em";

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = "0";

    // Clean up any borders.
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = "transparent";

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        return true;
      } else {
        console.error("Was not able to copy. No exception was thrown. Result=" + successful);
      }
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(textArea);
    }

    return false;
  }

  public static showErrorMessage(messageService: MessageService, err: any): void {
    if (UtilService.isDefined(err)) {
      let message = err.statusText + "\nstatus=" + err.status + "\nmessage:\n" + err.message;
      if (UtilService.isDefined(err.error) && err.error instanceof ProgressEvent) {
        if (err.status === 0) {
          message = "Wiremock not started?\n------------------------------\n" + message;
        }
        messageService.setMessage(new Message(message, MessageType.ERROR, 10000));
      } else {
        messageService.setMessage(
          new Message(err.statusText + ": status=" + err.status + ", message=", MessageType.ERROR, 10000, err.message)
        );
      }
    } else {
      messageService.setMessage(new Message("Ups! Unknown error :(", MessageType.ERROR, 10000));
    }
  }

  public static getSoapRecognizeRegex(): RegExp {
    return /<([^/][^<> ]*?):Envelope[^<>]*?>\s*?<([^/][^<> ]*?):Body[^<>]*?>/;
  }

  public static getSoapNamespaceRegex(): RegExp {
    return /xmlns:([^<> ]+?)="([^<> ]+?)"/g;
  }

  public static getSoapMethodRegex(): RegExp {
    return /<[^/][^<> ]*?:Body[^<>]*?>\s*?<([^/][^<> ]*?):([^<> ]+)[^<>]*?>/;
  }

  public static getSoapXPathRegex(): RegExp {
    return /\/.*?Envelope\/.*?Body\/([^: ]+:)?(.+)/;
  }

  public static isDefined(value: any): boolean {
    return !(value === null || typeof value === "undefined");
  }

  public static isGuiDefined(value: StubMapping): boolean {
    return UtilService.isDefined(value.metadata) && UtilService.isDefined(value.metadata[UtilService.WIREMOCK_GUI_KEY]);
  }

  public static isFolderDefined(value: StubMapping): boolean {
    return (
      UtilService.isGuiDefined(value) &&
      UtilService.isDefined(value.metadata[UtilService.WIREMOCK_GUI_KEY][UtilService.DIR_KEY])
    );
  }

  public static isUndefined(value: any): boolean {
    return !UtilService.isDefined(value);
  }

  public static isBlank(value: string): boolean {
    return UtilService.isUndefined(value) || value.length === 0;
  }

  public static isNotBlank(value: string): boolean {
    return !this.isBlank(value);
  }

  public static itemModelStringify(item: any): string {
    if (item._code === null || typeof item._code === "undefined") {
      Object.defineProperty(item, "_code", {
        enumerable: false,
        writable: true,
      });
      item._code = JSON.stringify(item);
    }
    return item._code;
  }

  public static getParametersOfUrl(url: string) {
    if (UtilService.isUndefined(url)) {
      return "";
    }

    const uri_dec = decodeURIComponent(url);

    const paramStart = uri_dec.indexOf("?");

    if (paramStart < 0) {
      return "";
    }

    return UtilService.extractQueryParams(uri_dec.substring(paramStart + 1));
  }

  private static extractQueryParams(queryParams: string) {
    if (UtilService.isUndefined(queryParams)) {
      return [];
    }

    const decodeQueryParams = decodeURIComponent(queryParams);

    const result = [];

    const array = decodeQueryParams.split("&");
    let splitKeyValue;
    for (let i = 0; i < array.length; i++) {
      splitKeyValue = array[i].split("=");
      result.push({ key: splitKeyValue[0], value: splitKeyValue[1] });
    }

    return result;
  }

  public static deepSearch(items: Item[], search: string, caseSensitive: boolean): Item[] {
    if (UtilService.isBlank(search)) {
      return items;
    }

    let toSearch: any;

    let func: any = UtilService.eachRecursiveRegex;

    try {
      if (caseSensitive) {
        toSearch = new RegExp(search);
      } else {
        toSearch = new RegExp(search, "i");
      }
    } catch (err) {
      toSearch = search;
      func = UtilService.eachRecursive;
    }

    const result: Item[] = [];

    for (const item of items) {
      if (func(item, toSearch)) {
        result.push(item);
      }
    }

    return result;
  }

  public static isFunction(obj: any): boolean {
    return typeof obj === "function";
  }

  public static eachRecursiveRegex(obj: any, regex: string): boolean {
    for (const k of Object.keys(obj)) {
      // hasOwnProperty check not needed. We are iterating over properties of object
      if (typeof obj[k] === "object" && UtilService.isDefined(obj[k])) {
        if (UtilService.eachRecursiveRegex(obj[k], regex)) {
          return true;
        }
      } else {
        if (!UtilService.isFunction(obj[k])) {
          const toCheck = obj[k] ? "" + obj[k] : "";
          if (toCheck.search(regex) > -1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public static eachRecursive(obj: any, text: string): boolean {
    for (const k of Object.keys(obj)) {
      // hasOwnProperty check not needed. We are iterating over properties of object
      if (typeof obj[k] === "object" && UtilService.isDefined(obj[k])) {
        if (UtilService.eachRecursive(obj[k], text)) {
          return true;
        }
      } else {
        if (!UtilService.isFunction(obj[k])) {
          const toCheck = obj[k] ? "" + obj[k] : "";
          if (toCheck.includes(text)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public static prettifyObject(code?: object): string {
    // some ts-ignore, because if(code) fails with ''.
    if (UtilService.isUndefined(code)) {
      return "";
    }

    try {
      return JSON.stringify(code, null, 2);
    } catch (err) {
      return String(code);
    }
  }

  public static prettify(code?: any): string {
    // some ts-ignore, because if(code) fails with ''.
    if (UtilService.isUndefined(code)) {
      return "";
    }

    if (typeof code === "object") {
      return this.prettifyObject(code);
    }

    try {
      const parsedJson = JSON.parse(code);

      return JSON.stringify(parsedJson, null, 2);
    } catch (err) {
      // Try to escape single quote
      try {
        const replaced = code.replace(new RegExp(/\\'/, "g"), "%replaceMyQuote%");
        const parsedJson = JSON.parse(replaced);

        const pretty = JSON.stringify(parsedJson, null, 2);
        return pretty.replace(new RegExp(/%replaceMyQuote%/, "g"), "'");
      } catch (err2) {
        try {
          return xmlFormat(code, {
            indentation: "  ",
            collapseContent: true,
            lineSeparator: "\n",
          });
        } catch (err3) {
          return code + "";
        }
      }
    }
  }

  public static toJson(value: any): string {
    if (UtilService.isUndefined(value)) {
      return "";
    } else {
      return JSON.stringify(value);
    }
  }

  public static transient(obj: any, key: string, value: any) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // move key to transient layer
      delete obj[key];
    }
    if (!obj.__proto__.__transient__) {
      // create transient layer
      obj.__proto__ = {
        __proto__: obj.__proto__,
        __tansient__: true,
      };
    }
    obj.__proto__[key] = value;
  }

  public static generateUUID(): string {
    return uuidv4();
  }

  constructor() {}

  static getActiveItem(items?: Item[], activeItemId?: string): Item | undefined {
    if (items && items.length > 0) {
      if (activeItemId) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].getId() === activeItemId) {
            return items[i];
          }
        }
      }
      return items[0];
    } else {
      return undefined;
    }
  }

  public static scrollIntoView(container: ElementRef, children: QueryList<ElementRef>, activeItem?: Item) {
    if (activeItem && activeItem.getId()) {
      setTimeout(() => {
        children.forEach(item => {
          if (item.nativeElement.id === activeItem.getId()) {
            const rectElem = item.nativeElement.getBoundingClientRect();
            const rectContainer = container.nativeElement.getBoundingClientRect();
            if (rectElem.bottom > rectContainer.bottom) {
              item.nativeElement.scrollIntoView({
                behavior: "smooth",
                block: "end",
              });
            } else if (rectElem.top < rectContainer.top) {
              item.nativeElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }
        });
      }, 0);
    }
  }

  public static downloadFileContent(fileName: string, content: string) {
    const blob = new Blob([content]);

    const downloadURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadURL;
    link.download = fileName;
    link.click();
  }

  public static aceReadOnlyOptions(): Partial<EditorOptions> {
    return {
      selectionStyle: "text",
      highlightActiveLine: true, // readOnly
      highlightSelectedWord: true,
      readOnly: true, // readOnly
      cursorStyle: "ace",
      mergeUndoDeltas: true,
      behavioursEnabled: true,
      wrapBehavioursEnabled: true,
      copyWithEmptySelection: true,
      autoScrollEditorIntoView: true, // we need that
      useSoftTabs: true,
      // ...
      highlightGutterLine: false,
      showPrintMargin: false,
      printMarginColumn: 0,
      printMargin: false,
      showGutter: true,
      displayIndentGuides: true,
      fontSize: 14,
      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      showLineNumbers: true,
      // ..
      wrap: true,
      enableMultiselect: true,
    };
  }

  public static aceWriteOptions(): Partial<EditorOptions> {
    return {
      selectionStyle: "text",
      highlightActiveLine: true,
      highlightSelectedWord: true,
      readOnly: false,
      cursorStyle: "ace",
      mergeUndoDeltas: true,
      behavioursEnabled: true,
      wrapBehavioursEnabled: true,
      copyWithEmptySelection: true,
      autoScrollEditorIntoView: true, // we need that
      useSoftTabs: true,
      // ...
      highlightGutterLine: false,
      showPrintMargin: false,
      printMarginColumn: 0,
      printMargin: false,
      showGutter: true,
      displayIndentGuides: true,
      fontSize: 14,
      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      showLineNumbers: true,
      // ..
      wrap: true,
      enableMultiselect: true,
    };
  }
}
