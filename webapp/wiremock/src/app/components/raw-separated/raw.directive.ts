import { Directive, HostBinding } from "@angular/core";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "wm-raw-separated-raw",
  standalone: false,
})
export class RawDirective {
  @HostBinding("class") classes = "wmHolyGrailScroll";

  constructor() {}
}
