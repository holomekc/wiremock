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
import { Tree } from "../../model/tree/tree";
import { Root } from "../../model/tree/root";
import { TreeNode } from "../../model/tree/tree-node";
import { Folder } from "../../model/tree/folder";
import { TreeHelper } from "./tree-helper";

@Component({
  selector: "wm-tree-view",
  templateUrl: "./tree-view.component.html",
  styleUrls: ["./tree-view.component.scss"],
  standalone: false,
})
export class TreeViewComponent implements OnChanges, AfterViewChecked {
  @HostBinding("class") classes = "wmHolyGrailBody column";

  @Input()
  items?: Item[];

  @Input()
  activeItem?: Item;
  activeItemChanged = false;

  @Output()
  activeItemChange: EventEmitter<Item> = new EventEmitter();

  rootNode?: TreeNode;
  private rootItem: Item;

  treeItems!: TreeNode[];
  private previousTree?: Tree;

  @ViewChild("childrenContainer")
  childrenContainer!: ElementRef;

  @ViewChildren("listChildren")
  listChildren!: QueryList<ElementRef>;

  constructor(
    private wiremockService: WiremockService,
    private messageService: MessageService
  ) {
    this.rootItem = new Root();
  }

  selectActiveItem(node: TreeNode) {
    if (node.value instanceof Folder) {
      node.collapsed = !node.collapsed;
      return;
    }

    if (this.activeItem === node.value) {
      return;
    }
    this.activeItem = node.value;
    this.activeItemChange.emit(this.activeItem);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // only when we actually change items. No need to change when activeItem changes because this would only
    // include expand and this is done by user.
    if (changes["items"] && this.items) {
      // First we sort items by group so that folders are shown first
      TreeHelper.sortItemsByFolderName(this.items);

      // We create a new Tree using our one root value always as basis
      this.rootNode = new TreeNode(this.rootItem, -1);
      const newTree = Tree.createFromNode(this.rootNode);

      // Insert all items into the new tree
      TreeHelper.insertIntoTree(newTree, this.items, this.rootNode);

      // Open folders based on old tree and active item.
      TreeHelper.openFolders(newTree, this.previousTree, this.activeItem);

      // We store tree for next item change
      this.previousTree = newTree;

      // We actually set a list of tree items to render top-down. Everything is Angular and CSS magic.
      this.treeItems = TreeHelper.sortTreeFoldersFirstAndMapToList(this.previousTree);
      this.activeItemChanged = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.activeItemChanged) {
      this.activeItemChanged = false;
      // only once after something changed.
      UtilService.scrollIntoView(this.childrenContainer, this.listChildren, this.activeItem);
    }
  }

  enableProxy(item: Item) {
    this.wiremockService.enableProxy(item.getId()).subscribe(
      () => {
        // do nothing
      },
      err => {
        UtilService.showErrorMessage(this.messageService, err);
      }
    );
  }

  disableProxy(item: Item) {
    this.wiremockService.disableProxy(item.getId()).subscribe(
      () => {
        // do nothing
      },
      err => {
        UtilService.showErrorMessage(this.messageService, err);
      }
    );
  }
}
