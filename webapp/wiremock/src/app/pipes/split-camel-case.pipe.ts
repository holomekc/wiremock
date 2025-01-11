import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "splitCamelCase",
  standalone: false,
})
export class SplitCamelCasePipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) {
      return "";
    }
    // return value.split(/(?=[A-Z])/).join(' ');
    return value.replace(/([a-z](?=[A-Z]))/g, "$1 ");
  }
}
