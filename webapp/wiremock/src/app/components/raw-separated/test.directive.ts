import { Directive, HostBinding } from "@angular/core";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "wm-raw-separated-test",
  standalone: false,
})
export class TestDirective {
  @HostBinding("class") classes = "wmHolyGrailBody";

  constructor() {}
}
