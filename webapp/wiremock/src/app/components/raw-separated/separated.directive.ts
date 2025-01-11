import { Directive, HostBinding } from "@angular/core";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "wm-raw-separated-separated",
  standalone: false,
})
export class SeparatedDirective {
  @HostBinding("class") classes = "wmHolyGrailBody";

  constructor() {}
}
