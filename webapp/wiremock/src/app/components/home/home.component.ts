import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { WiremockService } from "../../services/wiremock.service";
import { UtilService } from "../../services/util.service";
import { Message, MessageService, MessageType } from "../message/message.service";
import { RecordSpec } from "../../model/wiremock/record-spec";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DialogRecordingComponent } from "../../dialogs/dialog-recording/dialog-recording.component";
import { SearchService } from "../../services/search.service";
import { RecordingStatus } from "../../model/wiremock/recording-status";
import { Subject } from "rxjs/internal/Subject";
import { WebSocketService } from "../../services/web-socket.service";
import { debounceTime, takeUntil } from "rxjs/operators";
import { AutoRefreshService } from "../../services/auto-refresh.service";
import { Theme, ThemeService } from "../../services/theme.service";

@Component({
  selector: "wm-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  @HostBinding("class") classes = "wmHolyGrailBody column";

  protected readonly window = window;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  isCollapsed = true;

  currentRecordingStatus?: RecordingStatus;
  version?: string;
  guiVersion?: string;

  RecordingStatus = RecordingStatus;

  autoRefreshEnabled = true;

  theme: Theme = "auto";

  constructor(
    private wiremockService: WiremockService,
    private messageService: MessageService,
    private webSocketService: WebSocketService,
    private searchService: SearchService,
    private autoRefreshService: AutoRefreshService,
    private modalService: NgbModal,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.autoRefreshService.autoRefresh$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(enabled => {
      this.autoRefreshEnabled = enabled;
    });

    this.webSocketService
      .observe("recording")
      .pipe(takeUntil(this.ngUnsubscribe), debounceTime(100))
      .subscribe(() => {
        this.loadRecordingStatus();
      });

    this.loadRecordingStatus();
    this.loadVersion();

    this.themeService.setTheme(this.themeService.getPreferredTheme());
    this.theme = this.themeService.getPreferredTheme();
  }

  private loadRecordingStatus() {
    this.wiremockService.getRecordingStatus().subscribe({
      next: data => {
        this.currentRecordingStatus = data;
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  private loadVersion() {
    this.wiremockService.getVersion().subscribe({
      next: version => {
        this.version = `Version: ${version.version}`;
        this.guiVersion = `GUI Version: ${version.guiVersion}`;
      },
    });
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, false);
  }

  resetAll() {
    this.wiremockService.resetAll().subscribe({
      next: () => {
        this.messageService.setMessage(new Message("Reset all successful", MessageType.INFO));
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  startRecording() {
    const dialog = this.modalService.open(DialogRecordingComponent);
    dialog.result.then(
      url => {
        this.actualStartRecording(url);
      },
      () => {
        // nothing to do
      }
    );
  }

  private actualStartRecording(url: string): void {
    const recordSpec: RecordSpec = new RecordSpec();
    recordSpec.targetBaseUrl = url;

    this.wiremockService.startRecording(recordSpec).subscribe({
      next: () => {
        this.messageService.setMessage(new Message("Recording started", MessageType.INFO));
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  stopRecording() {
    this.wiremockService.stopRecording().subscribe({
      next: results => {
        if (UtilService.isDefined(results) && UtilService.isDefined(results.getIds()) && results.getIds().length > 0) {
          const result = results.getIds().join("|");

          this.router.navigate(["/mappings"]).then(
            () => {
              this.searchService.setValue(result);
              this.messageService.setMessage(new Message("Recording stopped", MessageType.INFO));
            },
            () => {
              // do nothing
            }
          );
        } else {
          this.messageService.setMessage(
            new Message("Recording stopped but no new mappings created", MessageType.INFO)
          );
        }
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  snapshot() {
    this.wiremockService.snapshot().subscribe({
      next: results => {
        if (UtilService.isDefined(results) && UtilService.isDefined(results.mappings) && results.getIds().length > 0) {
          const result = results.getIds().join("|");

          this.router.navigate(["/mappings"]).then(
            () => {
              this.searchService.setValue(result);
              this.messageService.setMessage(new Message("Snapshot stopped", MessageType.INFO));
            },
            () => {
              // do nothing
            }
          );
        } else {
          this.messageService.setMessage(new Message("Snapshot taken but no new mappings created", MessageType.INFO));
        }
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  setAutoRefresh(enabled: boolean) {
    this.autoRefreshService.setAutoRefresh(enabled);
  }

  shutdown() {
    this.wiremockService.shutdown().subscribe({
      next: () => {
        this.messageService.setMessage(new Message("Shutdown successful", MessageType.INFO));
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  changeTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.theme = this.themeService.getPreferredTheme();
  }
}
