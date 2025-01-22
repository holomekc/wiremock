import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
import { MappingsComponent } from "./components/mappings/mappings.component";
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModal,
  NgbModalModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbToastModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faAlignJustify,
  faAngleDoubleUp,
  faArrowDown,
  faArrowUp,
  faBars,
  faCamera,
  faCheck,
  faChevronDown,
  faChevronRight,
  faCircleHalfStroke,
  faClock,
  faCog,
  faCopy,
  faDoorOpen,
  faDotCircle,
  faDownload,
  faExchangeAlt,
  faFileAlt,
  faFolder,
  faLink,
  faList,
  faMoon,
  faPaperclip,
  faPencilAlt,
  faPlay,
  faPlus,
  faPowerOff,
  faSave,
  faSearch,
  faStop,
  faSun,
  faSyncAlt,
  faTimes,
  faTrash,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { ListViewComponent } from "./components/list-view/list-view.component";
import { MatchedComponent } from "./components/matched/matched.component";
import { UnmatchedComponent } from "./components/unmatched/unmatched.component";
import { LayoutComponent } from "./components/layout/layout.component";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { WiremockService } from "./services/wiremock.service";
import { CodeEntryComponent } from "./components/code-entry/code-entry.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RawSeparatedComponent } from "./components/raw-separated/raw-separated.component";
import { RawDirective } from "./components/raw-separated/raw.directive";
import { SeparatedComponent } from "./components/separated/separated.component";
import { SeparatedDirective } from "./components/raw-separated/separated.directive";
import { KeysPipe } from "./pipes/keys.pipe";
import { CapitalizeFirstPipe } from "./pipes/capitalize-first.pipe";
import { IsObjectPipe } from "./pipes/is-object.pipe";
import { IsNoObjectPipe } from "./pipes/is-no-object.pipe";
import { PrettifyPipe } from "./pipes/prettify.pipe";
import { SplitCamelCasePipe } from "./pipes/split-camel-case.pipe";
import { WebSocketService } from "./services/web-socket.service";
import { MessageComponent } from "./components/message/message.component";
import { MessageService } from "./components/message/message.service";
import { DialogRecordingComponent } from "./dialogs/dialog-recording/dialog-recording.component";
import { SearchService } from "./services/search.service";
import { CodeEditorComponent } from "./components/code-editor/code-editor.component";
import { StateComponent } from "./components/state/state.component";
import { StateMachineComponent } from "./components/state-machine/state-machine.component";
import { StateMappingInfoComponent } from "./components/state-mapping-info/state-mapping-info.component";
import { CurlPreviewComponent } from "./components/curl-preview/curl-preview.component";
import { MappingTestComponent } from "./components/mapping-test/mapping-test.component";
import { TestDirective } from "./components/raw-separated/test.directive";
import { TreeViewComponent } from "./components/tree-view/tree-view.component";
import { HIGHLIGHT_OPTIONS, HighlightModule } from "ngx-highlightjs";
import { FilesComponent } from "./components/files/files.component";
import { FileNameComponent } from "./dialogs/file-name/file-name.component";
import { AuthInterceptor } from "./interceptors/auth-interceptor";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MappingsComponent,
    ListViewComponent,
    MatchedComponent,
    UnmatchedComponent,
    LayoutComponent,
    CodeEntryComponent,
    RawSeparatedComponent,
    RawDirective,
    SeparatedDirective,
    TestDirective,
    SeparatedComponent,
    KeysPipe,
    CapitalizeFirstPipe,
    IsObjectPipe,
    IsNoObjectPipe,
    PrettifyPipe,
    SplitCamelCasePipe,
    MessageComponent,
    DialogRecordingComponent,
    CodeEditorComponent,
    StateComponent,
    StateMachineComponent,
    StateMappingInfoComponent,
    CurlPreviewComponent,
    MappingTestComponent,
    TreeViewComponent,
    FileNameComponent,
    FilesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    // ng-bootstrap
    NgbNavModule,
    NgbCollapseModule,
    NgbModalModule,
    NgbDropdownModule,
    NgbAlertModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbPaginationModule,
    NgbToastModule,
    HighlightModule,
  ],
  providers: [
    WiremockService,
    WebSocketService,
    MessageService,
    SearchService,
    NgbModal,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import("highlight.js/lib/core"),
        // lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
        languages: {
          //  'html', 'json', 'xml', 'http'
          json: () => import("highlight.js/lib/languages/json"),
          xml: () => import("highlight.js/lib/languages/xml"),
          http: () => import("highlight.js/lib/languages/http"),
        },
        themePath: "assets/highlightjs/styles/github.css",
      },
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    // add icons. Only remove if not used anymore otherwise app will crash!
    library.addIcons(faBars);
    library.addIcons(faSearch);
    library.addIcons(faPlus);
    library.addIcons(faPencilAlt);
    library.addIcons(faTrash);
    library.addIcons(faSave);
    library.addIcons(faTimes);
    library.addIcons(faSyncAlt);
    library.addIcons(faClock);
    library.addIcons(faAngleDoubleUp);
    library.addIcons(faAlignJustify);
    library.addIcons(faFileAlt);
    library.addIcons(faLink);
    library.addIcons(faExchangeAlt);
    library.addIcons(faCopy);
    library.addIcons(faCog);
    library.addIcons(faPowerOff);
    library.addIcons(faDotCircle);
    library.addIcons(faPlay);
    library.addIcons(faStop);
    library.addIcons(faCamera);
    library.addIcons(faFolder);
    library.addIcons(faCheck);
    library.addIcons(faChevronRight);
    library.addIcons(faChevronDown);
    library.addIcons(faList);
    library.addIcons(faSun);
    library.addIcons(faMoon);
    library.addIcons(faCircleHalfStroke);
    library.addIcons(faPaperclip);
    library.addIcons(faUpload);
    library.addIcons(faDownload);
    library.addIcons(faArrowUp);
    library.addIcons(faArrowDown);
    library.addIcons(faDoorOpen);
  }
}
