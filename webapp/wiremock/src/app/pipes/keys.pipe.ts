import { Pipe, PipeTransform } from "@angular/core";
import { UtilService } from "../services/util.service";

@Pipe({
  name: "keys",
  standalone: false,
})
export class KeysPipe implements PipeTransform {
  transform(value: any): any {
    const result: KeyValue[] = [];

    if (UtilService.isUndefined(value)) {
      return result;
    }

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key) && !key.startsWith("_") && value[key]) {
        result.push(new KeyValue(key, value[key]));
      }
    }
    return result;
  }
}

export class KeyValue {
  key: string;

  value: any;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
  }
}
