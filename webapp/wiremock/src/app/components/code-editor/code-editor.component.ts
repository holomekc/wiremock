import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { UtilService } from "../../services/util.service";
import { Subject } from "rxjs";
import * as ace from "ace-builds";
import { Ace } from "ace-builds";
import { takeUntil } from "rxjs/operators";
import { ThemeService } from "../../services/theme.service";
import Editor = Ace.Editor;
import EditorOptions = Ace.EditorOptions;

@Component({
  selector: "wm-code-editor",
  templateUrl: "./code-editor.component.html",
  styleUrls: ["./code-editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CodeEditorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  public static DEFAULT_OPTIONS: Partial<EditorOptions> = {
    selectionStyle: "text",
    highlightActiveLine: true,
    highlightSelectedWord: true,
    readOnly: false,
    cursorStyle: "ace",
    mergeUndoDeltas: true,
    behavioursEnabled: true,
    wrapBehavioursEnabled: true,
    autoScrollEditorIntoView: true, // we need that
    copyWithEmptySelection: true,
    useSoftTabs: true,
    // navigateWithinSoftTabs: true, // not working anymore
    // ...
    highlightGutterLine: false,
    showPrintMargin: false,
    printMarginColumn: 0,
    printMargin: false,
    showGutter: true,
    displayIndentGuides: true,
    fontSize: 14,
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    showLineNumbers: true,
    // ..
    // firstLineNumber: 1
    wrap: true,
    enableMultiselect: true,
    // maxLines: 100
    // minLines: 10
  };

  @ViewChild("editorCanvas")
  editorCanvas!: ElementRef;

  private editor?: Editor;

  private ngUnsubscribe: Subject<boolean> = new Subject();

  private editorChanges: Subject<string> = new Subject();

  _code!: string;

  @Input()
  set code(value: any | undefined) {
    if (this._code !== value) {
      this._code = UtilService.prettify(value);
      this.setEditorValue();
    }
  }

  @Input()
  language!: string;

  @Input()
  options = CodeEditorComponent.DEFAULT_OPTIONS;

  @Output()
  valueChange = new EventEmitter<string>();

  constructor(
    private zone: NgZone,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // debounce fast changes which occur in copy / paste scenarios and make ace crash if value is changed during paste scenario.
    this.editorChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this._code = value;
      this.valueChange.emit(this._code);
    });

    this.themeService.changes$.subscribe(theme => {
      this.setTheme();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editor) {
      if (changes["options"]) {
        this.zone.runOutsideAngular(() => {
          this.setOptions();
        });
      }

      if (changes["language"]) {
        this.zone.runOutsideAngular(() => {
          if (this.editor) {
            this.editor.session.setMode("ace/mode/" + this.language);
          }
        });
      }
    }
  }

  private setEditorValue() {
    if (this.editor && UtilService.isDefined(this._code)) {
      this.zone.runOutsideAngular(() => {
        if (this.editor && UtilService.isDefined(this._code)) {
          this.editor.setValue(this._code);
          this.editor.selection.clearSelection();
        }
      });
    }
  }

  getCode(): string | undefined {
    return this._code;
  }

  refresh(): void {
    if (this.editor) {
      this.setEditorValue();
    }
  }

  resize(): void {
    if (this.editor) {
      this.editor.resize();
    }
  }

  private setOptions() {
    if (this.editor) {
      this.editor.setOptions(this.options);
      if (this.options.readOnly) {
        (this.editor.renderer as any).$cursorLayer.element.style.display = "none";
      } else {
        (this.editor.renderer as any).$cursorLayer.element.style.display = "block";
      }
    }
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.editor = ace.edit(this.editorCanvas.nativeElement);
      this.setTheme();
      this.editor.container.style.lineHeight = "1.5";
      this.setOptions();
      this.editor.session.setMode("ace/mode/" + this.language);
      this.setEditorValue();

      this.editor.session.on("change", () => {
        // param would be delta but I do not need it
        // delta.start, delta.end, delta.lines, delta.action
        this.zone.run(() => {
          if (this.editor) {
            this.editorChanges.next(this.editor.getValue());
          }
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  setTheme() {
    if (this.editor) {
      const theme = this.themeService.getPreferredResolvedTheme();

      if (theme === "dark") {
        this.editor.setTheme("ace/theme/github_dark");
      } else {
        this.editor.setTheme("ace/theme/github");
      }
    }
  }
}
