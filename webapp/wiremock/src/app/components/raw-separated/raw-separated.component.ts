import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { UtilService } from "../../services/util.service";
import { Tab, TabSelectionService } from "../../services/tab-selection.service";
import { Subject } from "rxjs/internal/Subject";

@Component({
  selector: "wm-raw-separated",
  templateUrl: "./raw-separated.component.html",
  styleUrls: ["./raw-separated.component.scss"],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class RawSeparatedComponent implements OnInit, OnDestroy {
  @HostBinding("class") classes = "wmHolyGrailBody column";

  private ngUnsubscribe: Subject<boolean> = new Subject();

  @Input()
  separatedDisabled = false;

  @Input()
  rawDisabled = false;

  @Input()
  testDisabled = false;

  @Input()
  testHidden = true;

  @Output()
  activeIdChanged = new EventEmitter<Tab>();

  @ContentChild("wm-raw-separated-test")
  test!: ElementRef;

  activeId = Tab.RAW;

  RAW = Tab.RAW;
  SEPARATED = Tab.SEPARATED;
  TEST = Tab.TEST;

  constructor(private tabSelectionService: TabSelectionService) {}

  ngOnInit() {
    this.tabSelectionService.tab$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tabToSelect => {
      if (UtilService.isDefined(tabToSelect)) {
        this.activeId = tabToSelect;
        this.activeIdChanged.emit(tabToSelect);
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  onActiveIdChange($event: Tab) {
    this.tabSelectionService.selectTab($event);
  }
}
