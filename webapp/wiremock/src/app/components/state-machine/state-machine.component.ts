import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import * as joint from "jointjs";
import { dia } from "jointjs";
import dagre from "dagre";
import graphlib from "graphlib";
import { StateMachineItems } from "./state-machine-items";
import { UtilService } from "../../services/util.service";
import { StateLink } from "../../model/state-link";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Scenario } from "../../model/wiremock/scenario";
import { ThemeService } from "../../services/theme.service";
import Paper = dia.Paper;
import Element = dia.Element;
import LinkView = dia.LinkView;
import Graph = dia.Graph;

@Component({
  selector: "wm-state-machine",
  templateUrl: "./state-machine.component.html",
  styleUrls: ["./state-machine.component.scss"],
  standalone: false,
})
export class StateMachineComponent implements OnInit, OnChanges {
  private static readonly ANY = "{{ANY}}";

  @Input()
  item!: Scenario;

  private lastItem?: Scenario;

  @ViewChild("canvas")
  canvas!: ElementRef;

  @Input()
  grid = true;

  private graph!: Graph;
  private paper!: Paper;

  private states = new Map<string, dia.Element>();
  private links: StateLink[] = [];

  private dragStartPosition?: { x: number; y: number } = undefined;
  space = false;

  private paperPos?: { x: number; y: number } = undefined;

  constructor(
    private container: ElementRef,
    private modalService: NgbModal,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.changes$.subscribe({
      next: theme => {
        this.ngOnChanges();
      },
    });
  }

  ngOnChanges(): void {
    if (UtilService.isUndefined(this.item) || UtilService.isUndefined(this.item.mappings)) {
      return;
    }

    if (this.graph) {
      this.graph.clear();
    }
    this.graph = new Graph();

    this.initPaper();

    this.states = new Map<string, Element>();
    this.links = [];

    this.searchForStates(this.states);
    this.addLinks(this.links, this.states);
    this.addStatesToGraph(this.states);
    this.addLinksToGraph(this.links, this.states);
    this.doLayout();

    this.selfLinks(this.links);
    this.sameDirectionLinks(this.links);

    if (!this.lastItem || this.lastItem.getId() !== this.item.getId()) {
      // reset position to 0, 0 if scenario changed or nothing was yet open
      this.paperPos = { x: 0, y: 0 };
    }

    if (this.paperPos) {
      this.paper.translate(this.paperPos.x, this.paperPos.y);
    }

    this.lastItem = this.item;
  }

  private initPaper() {
    this.paper = new Paper({
      el: this.canvas.nativeElement,
      model: this.graph,
      height: this.container.nativeElement.offsetHeight,
      width: this.container.nativeElement.offsetWidth,
      gridSize: 10,
    });
    this.paper.translate(0, 0);

    this.dragStartPosition = undefined;

    this.paper.on("blank:pointerdown", (_event, x, y) => {
      if (this.space) {
        this.dragStartPosition = { x: x, y: y };
      }
    });

    this.paper.on("cell:pointerup blank:pointerup", () => {
      this.dragStartPosition = undefined;
    });
  }

  private searchForStates(states: Map<string, dia.Element>) {
    this.item.possibleStates.forEach(stateName => {
      if (stateName === "Started") {
        if (this.item.state === "Started") {
          states.set(stateName, StateMachineItems.createActiveStartState());
        } else {
          states.set(stateName, StateMachineItems.createStartState());
        }
      } else {
        if (this.item.state === stateName) {
          states.set(stateName, StateMachineItems.createActiveState(stateName));
        } else {
          states.set(stateName, StateMachineItems.createState(stateName));
        }
      }
    });
  }

  private addLinks(links: StateLink[], states: Map<string, dia.Element>) {
    this.item.mappings.forEach(mapping => {
      if (UtilService.isDefined(mapping.requiredScenarioState) && UtilService.isDefined(mapping.newScenarioState)) {
        // A -> B
        links.push(new StateLink(mapping.requiredScenarioState, mapping.newScenarioState, mapping));
      } else if (UtilService.isDefined(mapping.newScenarioState)) {
        // any -> B
        if (UtilService.isUndefined(states.get(StateMachineComponent.ANY))) {
          states.set(StateMachineComponent.ANY, StateMachineItems.createAnyState());
        }
        links.push(new StateLink(StateMachineComponent.ANY, mapping.newScenarioState, mapping));
      } else if (UtilService.isDefined(mapping.requiredScenarioState)) {
        // A -> A
        links.push(new StateLink(mapping.requiredScenarioState, mapping.requiredScenarioState, mapping));
      }
    });
  }

  private addStatesToGraph(states: Map<string, dia.Element>) {
    states.forEach(state => {
      state.addTo(this.graph);
    });
  }

  private addLinksToGraph(links: StateLink[], states: Map<string, dia.Element>) {
    const lineColor = this.themeService.getPreferredResolvedTheme() === "dark" ? "white" : "black";

    links.forEach(data => {
      const link = new joint.shapes.standard.Link({
        attrs: {
          line: {
            stroke: lineColor,
          },
        },
      });
      const source = states.get(data.source);
      const target = states.get(data.target);

      if (!source || !target) {
        return;
      }

      link.source(source);
      link.target(target);

      if (data.source === data.target) {
        link.connector("rounded", {
          radius: 20,
        });
        link.router("manhattan", {
          step: 10,
          padding: 15,
          maxAllowedDirectionChange: 0,
        });
      } else {
        link.connector("rounded");
        link.router("normal", {
          step: 30,
          padding: 30,
        });
      }

      data.link = link;

      link.addTo(this.graph);
      const linkView = link.findView(this.paper);
      linkView.addTools(StateMachineItems.createInfoButton(this.modalService, data.mapping));
    });
  }

  private doLayout() {
    joint.layout.DirectedGraph.layout(this.graph, {
      dagre: dagre,
      graphlib: graphlib,
      nodeSep: 100,
      edgeSep: 100,
      rankSep: 100,
      clusterPadding: 50,
      rankDir: "TB",
      marginX: 100,
      marginY: 50,
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.paper) {
      this.paper.setDimensions(0, 0);
      this.paper.setDimensions(this.container.nativeElement.offsetWidth, this.container.nativeElement.offsetHeight);
    }
  }

  onMove(event: MouseEvent) {
    if (this.paper && this.dragStartPosition) {
      this.paperPos = {
        x: event.offsetX - this.dragStartPosition.x,
        y: event.offsetY - this.dragStartPosition.y,
      };
      this.paper.translate(this.paperPos.x, this.paperPos.y);
      //  var scale = V(paper.viewport).scale();
      // dragStartPosition = { x: x * scale.sx, y: y * scale.sy};
    }
  }

  @HostListener("document:keyup.space", ["$event"])
  onSpaceUp() {
    this.space = false;
    this.dragStartPosition = undefined;
  }

  @HostListener("document:keydown.space", ["$event"])
  onSpaceDown() {
    this.space = true;
  }

  private selfLinks(links: StateLink[]) {
    const xgap = 20;
    const ygap = 20;
    const linkMap = new Map<string, StateLink[]>();

    links.forEach(data => {
      if (data.target === data.source) {
        const linkMapEntry = linkMap.get(data.source);

        if (linkMapEntry) {
          linkMapEntry.push(data);
        } else {
          const newLinks = [];
          newLinks.push(data);
          linkMap.set(data.source, newLinks);
        }
      }
    });

    linkMap.forEach(selfLinks => {
      selfLinks.forEach((data, index) => {
        const linkView = this.paper.findViewByModel(data.link.id) as LinkView;
        const conn = linkView.getConnection();
        const bbox = conn.bbox();

        if (bbox) {
          // TODO: remove verticies and set again. Needed if this should work with moving elements
          // const vertices = data.link.vertices();
          //
          // vertices.forEach(value =>{
          //   data.link.removeVertex(0);
          // });

          linkView.addVertex(bbox.center().x + xgap * (index + 1), bbox.center().y - (ygap / 2) * (index + 1));
          linkView.addVertex(bbox.center().x + (xgap / 2) * (index + 1), bbox.center().y - ygap * (index + 1));
        }
      });
    });
  }

  private sameDirectionLinks(links: StateLink[]) {
    const gap = 20;
    const linkMap = new Map<string, StateLink[]>();

    links.forEach(data => {
      if (data.target !== data.source) {
        const linkMapEntry = linkMap.get(data.target + data.source);

        if (linkMapEntry) {
          // same direction but other way around
          linkMapEntry.push(data);
          return;
        } else {
          const newLinks = [];
          newLinks.push(data);
          linkMap.set(data.source + data.target, newLinks);
        }
      }
    });

    linkMap.forEach(selfLinks => {
      selfLinks.forEach((data, index) => {
        const linkView = this.paper.findViewByModel(data.link.id) as LinkView;
        const bbox = linkView.getConnection().bbox();

        if (bbox) {
          const center = bbox.center();

          // TODO: remove verticies and set again. Needed if this should work with moving elements
          // const vertices = data.link.vertices();
          //
          // vertices.forEach(value =>{
          //   data.link.removeVertex(0);
          // });

          linkView.addVertex(center.x - gap * index, center.y);
        }
      });
    });
  }
}
