import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "wm-file-name",
  templateUrl: "./file-name.component.html",
  styleUrl: "./file-name.component.scss",
  standalone: false,
})
export class FileNameComponent {
  fileName!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
