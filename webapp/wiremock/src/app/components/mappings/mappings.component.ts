import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { WiremockService } from "../../services/wiremock.service";
import { ListStubMappingsResult } from "../../model/wiremock/list-stub-mappings-result";
import { UtilService } from "../../services/util.service";
import { StubMapping } from "../../model/wiremock/stub-mapping";
import { WebSocketService } from "../../services/web-socket.service";
import { WebSocketListener } from "../../interfaces/web-socket-listener";
import { debounceTime, filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { MappingHelperService } from "./mapping-helper.service";
import { Message, MessageService, MessageType } from "../message/message.service";
import { Item } from "../../model/wiremock/item";
import { Subject } from "rxjs/internal/Subject";
import { ProxyConfig } from "../../model/wiremock/proxy-config";
import { Tab, TabSelectionService } from "../../services/tab-selection.service";
import { AutoRefreshService } from "../../services/auto-refresh.service";
import { CodeEditorComponent } from "../code-editor/code-editor.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FileNameComponent } from "../../dialogs/file-name/file-name.component";
import { fromPromise } from "rxjs/internal/observable/innerFrom";

@Component({
  selector: "wm-mappings",
  templateUrl: "./mappings.component.html",
  styleUrls: ["./mappings.component.scss"],
  standalone: false,
})
export class MappingsComponent implements OnInit, OnDestroy, WebSocketListener {
  private static COPY_FAILURE = "Was not able to copy. Details in log";
  private static ACTION_FAILURE_PREFIX = "Action not possible: ";

  @HostBinding("class") classes = "wmHolyGrailBody column";

  @ViewChild("editor") editor!: CodeEditorComponent;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  result?: ListStubMappingsResult;

  activeItemId?: string;
  bodyFileName?: string;

  editorText?: string;
  currentMappingText?: string;

  editMode?: State;
  State = State;

  codeOptions = UtilService.aceWriteOptions();
  codeReadOnlyOptions = UtilService.aceReadOnlyOptions();

  RAW = Tab.RAW;

  NEW = State.NEW;
  NORMAL = State.NORMAL;
  EDIT = State.EDIT;

  constructor(
    private wiremockService: WiremockService,
    private webSocketService: WebSocketService,
    private messageService: MessageService,
    private tabSelectionService: TabSelectionService,
    private autoRefreshService: AutoRefreshService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.webSocketService
      .observe("mappings")
      .pipe(
        filter(() => this.autoRefreshService.isAutoRefreshEnabled()),
        takeUntil(this.ngUnsubscribe),
        debounceTime(100)
      )
      .subscribe(() => {
        this.loadMappings();
      });

    this.editMode = State.NORMAL;
    this.loadMappings();
  }

  private loadMappings() {
    this.wiremockService.getProxyConfig().subscribe({
      next: proxyData => {
        this.loadActualMappings(new ProxyConfig().deserialize(proxyData));
      },
      error: () => {
        console.log("Could not load proxy config. Proxy feature deactivated");
        this.loadActualMappings();
      },
    });
  }

  private loadActualMappings(proxyConfig?: ProxyConfig) {
    this.wiremockService.getMappings().subscribe({
      next: data => {
        this.result = new ListStubMappingsResult().deserialize(data, proxyConfig);
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  editorValueChange(value: string) {
    this.editorText = value;
  }

  newMapping() {
    this.currentMappingText = this.editorText;
    this.editMode = State.NEW;
    this.tabSelectionService.selectTab(Tab.RAW);
    this.editorText = UtilService.prettify(UtilService.itemModelStringify(StubMapping.createEmpty()));
  }

  saveNewMapping() {
    if (this.editorText) {
      this.wiremockService.saveNewMapping(this.editorText).subscribe({
        next: data => {
          this.activeItemId = data.getId();
          this.messageService.setMessage(new Message("save successful", MessageType.INFO));
        },
        error: err => {
          UtilService.showErrorMessage(this.messageService, err);
        },
      });
      this.editMode = State.NORMAL;
    }
  }

  editMapping(item: Item) {
    this.currentMappingText = this.editorText;
    this.editorText = UtilService.prettify(item.getCode());
    this.editMode = State.EDIT;
    this.tabSelectionService.selectTab(Tab.RAW);
  }

  saveEditMapping(item: Item) {
    if (this.editorText) {
      this.wiremockService.saveMapping(item.getId(), this.editorText).subscribe({
        next: data => {
          this.activeItemId = data.getId();
          this.messageService.setMessage(new Message("save successful", MessageType.INFO));
        },
        error: err => {
          UtilService.showErrorMessage(this.messageService, err);
        },
      });
      this.editMode = State.NORMAL;
    }
  }

  onActiveItemChange(item: Item) {
    if (item) {
      this.editorText = item.getCode();
      this.bodyFileName = item.getBodyFileName();
    } else {
      this.editorText = "";
      this.bodyFileName = undefined;
    }
    this.editMode = State.NORMAL;
  }

  removeMapping(item: Item) {
    this.wiremockService.deleteMapping(item.getId()).subscribe({
      next: () => {
        // do nothing
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  saveMappings() {
    this.wiremockService.saveMappings().subscribe({
      next: () => {
        // do nothing
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  resetMappings() {
    this.wiremockService.resetMappings().subscribe({
      next: () => {
        // do nothing
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  removeAllMappings() {
    this.wiremockService.deleteAllMappings().subscribe({
      next: () => {
        this.messageService.setMessage(new Message("All mappings removed", MessageType.INFO));
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  resetAllScenarios() {
    this.wiremockService.resetScenarios().subscribe({
      next: () => {
        this.messageService.setMessage(new Message("Reset of all scenarios successful", MessageType.INFO));
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  onMessage(): void {
    this.loadMappings();
  }

  // ##### HELPER #####
  private showHelperErrorMessage(err: any) {
    this.messageService.setMessage(
      new Message(
        err.name + ": message=" + err.message + ", lineNumber=" + err.lineNumber + ", columnNumber=" + err.columnNumber,
        MessageType.ERROR
      )
    );
  }

  getMappingForHelper(): StubMapping | undefined {
    if (this.editorText) {
      try {
        return JSON.parse(this.editorText);
      } catch (err) {
        this.showHelperErrorMessage(err);
      }
    }
    return undefined;
  }

  private setMappingForHelper(mapping?: StubMapping): void {
    if (UtilService.isUndefined(mapping)) {
      return;
    }
    try {
      this.editorText = UtilService.prettify(UtilService.itemModelStringify(mapping));
    } catch (err) {
      this.showHelperErrorMessage(err);
    }
  }

  helpersAddFolder(): void {
    this.setMappingForHelper(MappingHelperService.helperAddFolder(this.getMappingForHelper()));
  }

  helpersAddDelay(): void {
    this.setMappingForHelper(MappingHelperService.helperAddDelay(this.getMappingForHelper()));
  }

  helpersAddPriority(): void {
    this.setMappingForHelper(MappingHelperService.helperAddPriority(this.getMappingForHelper()));
  }

  helpersAddHeaderRequest(): void {
    this.setMappingForHelper(MappingHelperService.helperAddHeaderRequest(this.getMappingForHelper()));
  }

  helpersAddHeaderResponse(): void {
    this.setMappingForHelper(MappingHelperService.helperAddHeaderResponse(this.getMappingForHelper()));
  }

  helpersAddScenario() {
    this.setMappingForHelper(MappingHelperService.helperAddScenario(this.getMappingForHelper()));
  }

  helpersToJsonBody() {
    try {
      this.setMappingForHelper(MappingHelperService.helperToJsonBody(this.getMappingForHelper()));
    } catch (err) {
      this.messageService.setMessage(
        new Message(MappingsComponent.ACTION_FAILURE_PREFIX + "Probably no json", MessageType.ERROR)
      );
    }
  }

  helpersAddProxyUrl() {
    this.setMappingForHelper(MappingHelperService.helperAddProxyBaseUrl(this.getMappingForHelper()));
  }

  helpersAddRemoveProxyPathPrefix() {
    this.setMappingForHelper(MappingHelperService.helperAddRemoveProxyPathPrefix(this.getMappingForHelper()));
  }

  helpersAddProxyHeader() {
    this.setMappingForHelper(MappingHelperService.helperAddAdditionalProxyRequestHeaders(this.getMappingForHelper()));
  }

  helpersAddTransformer() {
    this.setMappingForHelper(MappingHelperService.helperAddResponseTemplatingTransformer(this.getMappingForHelper()));
  }

  helpersAddWebhook() {
    this.setMappingForHelper(MappingHelperService.helperAddWebhook(this.getMappingForHelper()));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  helpersCopyJsonPath() {
    if (UtilService.copyToClipboard("{{jsonPath request.body '$.'}}")) {
      this.messageService.setMessage(new Message("jsonPath copied to clipboard", MessageType.INFO));
    } else {
      this.messageService.setMessage(new Message(MappingsComponent.COPY_FAILURE, MessageType.ERROR));
    }
  }

  helpersCopyXpath() {
    if (UtilService.copyToClipboard("{{xPath request.body '/'}}")) {
      this.messageService.setMessage(new Message("xPath copied to clipboard", MessageType.INFO));
    } else {
      this.messageService.setMessage(new Message(MappingsComponent.COPY_FAILURE, MessageType.ERROR));
    }
  }

  helpersCopySoap() {
    if (UtilService.copyToClipboard("{{soapXPath request.body '/'}}")) {
      this.messageService.setMessage(new Message("soapXPath copied to clipboard", MessageType.INFO));
    } else {
      this.messageService.setMessage(new Message(MappingsComponent.COPY_FAILURE, MessageType.ERROR));
    }
  }

  editViaKeyboard($event: Event, activeItem?: Item) {
    if (activeItem && (!activeItem.isProxy() || activeItem.isProxyEnabled())) {
      if (this.editMode === State.NORMAL) {
        this.editMapping(activeItem);
      }
    }

    $event.stopPropagation();
    return false;
  }

  abortViaKeyboard($event: Event) {
    if (this.editMode === State.EDIT || this.editMode === State.NEW) {
      this.editMode = State.NORMAL;
    }

    $event.stopPropagation();
    return false;
  }

  saveViaKeyboard($event: Event, activeItem?: Item) {
    if (activeItem) {
      if (this.editMode === State.NEW) {
        this.saveNewMapping();
      } else if (this.editMode === State.EDIT) {
        this.saveEditMapping(activeItem);
      }
    }

    $event.stopPropagation();
    return false;
  }

  cancelEditing() {
    this.editMode = State.NORMAL;
    this.editorText = this.currentMappingText;
  }

  downloadFile() {
    if (this.bodyFileName) {
      this.wiremockService.downloadFile(this.bodyFileName).subscribe({
        error: err => {
          this.messageService.setMessage(new Message(`Download failed.\n${err.message}`, MessageType.ERROR));
        },
      });
    }
  }

  uploadFile(event: any) {
    const fileList = event.target.files as FileList;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      const dialog = this.modalService.open(FileNameComponent);
      dialog.componentInstance.fileName = file.name;

      fromPromise(dialog.result)
        .pipe(
          switchMap(fileName => this.wiremockService.uploadFile(file, fileName).pipe(map(() => fileName))),
          tap(fileName => {
            if (this.editorText) {
              this.setMappingForHelper(
                MappingHelperService.helperSetBodyFileName(this.getMappingForHelper(), fileName)
              );
            }
          })
        )
        .subscribe({
          next: () => {
            this.messageService.setMessage(new Message(`File "${file.name}" uploaded.`, MessageType.INFO));
          },
          error: err => {
            this.messageService.setMessage(
              new Message(`File upload failed.\n${err.message || err}`, MessageType.ERROR)
            );
          },
        });
    }
  }

  deleteFile() {
    if (this.bodyFileName) {
      this.wiremockService.deleteFile(this.bodyFileName).subscribe({
        next: () => {
          this.messageService.setMessage(new Message(`File "${this.bodyFileName}" deleted.`, MessageType.INFO));
          if (this.editorText) {
            this.setMappingForHelper(MappingHelperService.helperRemoveBodyFileName(this.getMappingForHelper()));
          }
        },
        error: err => {
          this.messageService.setMessage(
            new Message(`File deletion failed.\n${err.message || err}`, MessageType.ERROR)
          );
        },
      });
    }
  }
}

export enum State {
  NORMAL,
  EDIT,
  NEW,
}
