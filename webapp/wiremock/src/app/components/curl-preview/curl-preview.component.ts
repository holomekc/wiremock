import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { Curl } from "../../services/curl-extractor";
import { CodeEditorComponent } from "../code-editor/code-editor.component";
import { UtilService } from "../../services/util.service";
import { Message, MessageService, MessageType } from "../message/message.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "wm-curl-preview",
  templateUrl: "./curl-preview.component.html",
  styleUrls: ["./curl-preview.component.scss"],
  standalone: false,
})
export class CurlPreviewComponent implements AfterViewInit {
  @ViewChild("editor")
  private codeEditor!: CodeEditorComponent;

  private _curl?: Curl;
  curlString = "";

  private visible = false;

  set curl(value: Curl) {
    const toString = value.toString();
    if (this.curlString !== toString) {
      this.visible = false;
      this._curl = value;
      this.curlString = toString;
    }
  }

  constructor(
    private elementRef: ElementRef,
    private messageService: MessageService,
    public activeModal: NgbActiveModal
  ) {}

  copyCurl() {
    this.activeModal.dismiss();
    const code = this.codeEditor.getCode();

    if (code && UtilService.copyToClipboard(code)) {
      this.messageService.setMessage(new Message("Curl copied to clipboard", MessageType.INFO));
    } else {
      this.messageService.setMessage(new Message("Was not able to copy. Details in log", MessageType.ERROR));
    }
  }

  ngAfterViewInit(): void {
    const offsetParent = this.elementRef.nativeElement.offsetParent;

    if (!this.visible && UtilService.isDefined(offsetParent) && offsetParent.offsetParent !== document.body) {
      this.visible = true;
      this.codeEditor.resize();
    }
  }
}
