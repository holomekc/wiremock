import { Pipe, PipeTransform } from "@angular/core";
import { UtilService } from "../services/util.service";

@Pipe({
  name: "prettify",
  standalone: false,
})
export class PrettifyPipe implements PipeTransform {
  transform(value: any): string {
    if (typeof value === "object") {
      return UtilService.prettifyObject(value);
    }
    return UtilService.prettify(value) + "";
  }
}
