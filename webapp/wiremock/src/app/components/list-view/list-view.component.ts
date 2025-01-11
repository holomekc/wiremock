import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Item } from "../../model/wiremock/item";
import { UtilService } from "../../services/util.service";
import { WiremockService } from "../../services/wiremock.service";
import { MessageService } from "../message/message.service";

@Component({
  selector: "wm-list-view",
  templateUrl: "./list-view.component.html",
  styleUrls: ["./list-view.component.scss"],
  standalone: false,
})
export class ListViewComponent implements OnChanges, AfterViewChecked {
  @HostBinding("class") classes = "wmHolyGrailBody column";

  @Input()
  items?: Item[];

  filteredItems?: Item[];

  @Input()
  activeItem?: Item;
  activeItemChanged = false;

  pageSize = 20;

  page = 1;

  @Output()
  activeItemChange: EventEmitter<Item> = new EventEmitter();

  @ViewChild("childrenContainer")
  childrenContainer!: ElementRef;

  @ViewChildren("listChildren")
  listChildren!: QueryList<ElementRef>;

  constructor(
    private wiremockService: WiremockService,
    private messageService: MessageService
  ) {}

  selectActiveItem(item: Item) {
    if (this.activeItem === item) {
      return;
    }
    this.activeItem = item;
    this.activeItemChange.emit(this.activeItem);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let changed = false;

    if (changes["items"] && this.items) {
      if (this.items.length > this.pageSize) {
        const maxPages = Math.ceil(this.items.length / this.pageSize);
        if (maxPages < this.page) {
          this.page = maxPages;
        }
      } else {
        this.page = 1;
      }
      changed = true;
    }

    if (this.activeItem && this.items) {
      const index =
        this.items.findIndex((item: Item) => {
          return item.getId() === this.activeItem?.getId();
        }) + 1;

      this.page = Math.ceil(index / this.pageSize);

      changed = true;
    }

    if (changed) {
      this.setFilteredItems();
    }
    this.activeItemChanged = true;
  }

  private setFilteredItems() {
    if (this.items) {
      this.filteredItems = this.items.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    }
  }

  onPageChange(page: number) {
    this.page = page;
    this.setFilteredItems();
    if (this.filteredItems) {
      this.selectActiveItem(this.filteredItems[0]);
    }
  }

  enableProxy(item: Item) {
    this.wiremockService.enableProxy(item.getId()).subscribe({
      next: () => {
        // do nothing
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  disableProxy(item: Item) {
    this.wiremockService.disableProxy(item.getId()).subscribe({
      next: () => {
        // do nothing
      },
      error: err => {
        UtilService.showErrorMessage(this.messageService, err);
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.activeItemChanged) {
      this.activeItemChanged = false;
      // only once after something changed.
      UtilService.scrollIntoView(this.childrenContainer, this.listChildren, this.activeItem);
    }
  }
}
