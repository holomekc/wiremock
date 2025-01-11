import { Component, HostBinding, Input } from "@angular/core";
import { UtilService } from "../../services/util.service";

@Component({
  selector: "wm-code-entry",
  templateUrl: "./code-entry.component.html",
  styleUrls: ["./code-entry.component.scss"],
  standalone: false,
})
export class CodeEntryComponent {
  @HostBinding("class") classes = "wmHolyGrailBody";

  _code?: string;
  @Input()
  set code(value: any | undefined) {
    if (value) {
      this._code = UtilService.prettify(value);
    } else {
      this._code = undefined;
    }
  }

  @Input()
  language?: string;

  constructor() {}
}
