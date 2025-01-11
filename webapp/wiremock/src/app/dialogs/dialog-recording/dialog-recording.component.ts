import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "wm-dialog-recording",
  templateUrl: "./dialog-recording.component.html",
  styleUrls: ["./dialog-recording.component.scss"],
  standalone: false,
})
export class DialogRecordingComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
