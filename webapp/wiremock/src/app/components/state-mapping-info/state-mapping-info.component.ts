import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { StubMapping } from "../../model/wiremock/stub-mapping";

@Component({
  selector: "wm-state-mapping-info",
  templateUrl: "./state-mapping-info.component.html",
  styleUrls: ["./state-mapping-info.component.scss"],
  standalone: false,
})
export class StateMappingInfoComponent {
  @Input()
  mapping?: StubMapping;

  constructor(public activeModal: NgbActiveModal) {}
}
