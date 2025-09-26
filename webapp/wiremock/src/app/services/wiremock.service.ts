import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from "@angular/common/http";
import { RecordSpec } from "../model/wiremock/record-spec";
import { Observable } from "rxjs/internal/Observable";
import { map, retry, switchMap, tap } from "rxjs/operators";
import { ResponseDefinition } from "../model/wiremock/response-definition";
import { ListStubMappingsResult } from "../model/wiremock/list-stub-mappings-result";
import { UtilService } from "./util.service";
import { StubMapping } from "../model/wiremock/stub-mapping";
import { timer } from "rxjs/internal/observable/timer";
import { FindRequestResult } from "../model/wiremock/find-request-result";
import { GetServeEventsResult } from "../model/wiremock/get-serve-events-result";
import { SnapshotRecordResult } from "../model/wiremock/snapshot-record-result";
import { ProxyConfig } from "../model/wiremock/proxy-config";
import { RecordingStatus } from "../model/wiremock/recording-status";
import { ScenarioResult } from "../model/wiremock/scenario-result";
import { fromPromise } from "rxjs/internal/observable/innerFrom";
import { FileList } from "../model/wiremock/file-list";
import { File as WmFile } from "../model/wiremock/file";
import { Version } from "../model/wiremock/version";

@Injectable()
export class WiremockService {
  private static getUrl(path: string): string {
    return environment.url + path;
  }

  private static mapBody(body: any): string | null {
    if (body === null || typeof body === "undefined") {
      return null;
    }
    return typeof body === "string" ? body : UtilService.toJson(body);
  }

  constructor(private http: HttpClient) {}

  resetAll(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.post<ResponseDefinition>(WiremockService.getUrl("reset"), null));
  }

  getMappings(): Observable<ListStubMappingsResult> {
    return this.defaultPipe(this.http.get<ListStubMappingsResult>(WiremockService.getUrl("mappings")));
  }

  saveMappings(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.post<ResponseDefinition>(WiremockService.getUrl("mappings/save"), null));
  }

  resetMappings(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.post<ResponseDefinition>(WiremockService.getUrl("mappings/reset"), null));
  }

  deleteAllMappings(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.delete<ResponseDefinition>(WiremockService.getUrl("mappings")));
  }

  saveMapping(id: string, mapping: string): Observable<StubMapping> {
    return this.defaultPipe(
      this.http.put<StubMapping>(WiremockService.getUrl("mappings/" + id), WiremockService.mapBody(mapping))
    ).pipe(map(editedMapping => new StubMapping().deserialize(editedMapping)));
  }

  saveNewMapping(mapping: string): Observable<StubMapping> {
    return this.defaultPipe(
      this.http.post<StubMapping>(WiremockService.getUrl("mappings"), WiremockService.mapBody(mapping))
    ).pipe(map(newMapping => new StubMapping().deserialize(newMapping)));
  }

  deleteMapping(id: string): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.delete<ResponseDefinition>(WiremockService.getUrl("mappings/" + id)));
  }

  getScenarios(): Observable<ScenarioResult> {
    return this.defaultPipe(this.http.get<ScenarioResult>(WiremockService.getUrl("scenarios")));
  }

  resetJournal(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.delete<ResponseDefinition>(WiremockService.getUrl("requests")));
  }

  resetScenarios(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.post<ResponseDefinition>(WiremockService.getUrl("scenarios/reset"), null));
  }

  setScenario(scenario: string, state: string): Observable<ResponseDefinition> {
    return this.defaultPipe(
      this.http.put<ResponseDefinition>(
        WiremockService.getUrl(`scenarios/${scenario}/state`),
        WiremockService.mapBody({ state })
      )
    );
  }

  getRequests(): Observable<GetServeEventsResult> {
    return this.defaultPipe(this.http.get<GetServeEventsResult>(WiremockService.getUrl("requests")));
  }

  getUnmatched(): Observable<FindRequestResult> {
    return this.defaultPipe(this.http.get<FindRequestResult>(WiremockService.getUrl("requests/unmatched")));
  }

  startRecording(recordSpec: RecordSpec): Observable<ResponseDefinition> {
    return this.defaultPipe(
      this.http.post<ResponseDefinition>(
        WiremockService.getUrl("recordings/start"),
        WiremockService.mapBody(recordSpec)
      )
    );
  }

  stopRecording(): Observable<SnapshotRecordResult> {
    return this.defaultPipe(this.http.post<SnapshotRecordResult>(WiremockService.getUrl("recordings/stop"), null)).pipe(
      map(data => new SnapshotRecordResult().deserialize(data))
    );
  }

  snapshot(): Observable<SnapshotRecordResult> {
    return this.defaultPipe(
      this.http.post<SnapshotRecordResult>(WiremockService.getUrl("recordings/snapshot"), null)
    ).pipe(map(snapshot => new SnapshotRecordResult().deserialize(snapshot)));
  }

  getRecordingStatus(): Observable<RecordingStatus> {
    return this.defaultPipe(this.http.get<RecordingStatus>(WiremockService.getUrl("recordings/status")))

      .pipe(map((status: any) => (<any>RecordingStatus)[status.status]));
  }

  getVersion(): Observable<Version> {
    const options = {
      headers: {
        Accept: "application/json",
      },
    };
    return this.defaultPipe(
      this.http.get<Version>(WiremockService.getUrl("version"), options).pipe(
        map(v => {
          return new Version(v.version, v.guiVersion);
        })
      )
    );
  }

  shutdown(): Observable<ResponseDefinition> {
    return this.defaultPipe(this.http.post<ResponseDefinition>(WiremockService.getUrl("shutdown"), null));
  }

  getProxyConfig(): Observable<ProxyConfig> {
    return this.defaultPipe(this.http.get<ProxyConfig>(WiremockService.getUrl("proxy")));
  }

  enableProxy(uuid: string): Observable<any> {
    return this.defaultPipe(this.http.put<any>(WiremockService.getUrl("proxy/" + uuid), null));
  }

  disableProxy(uuid: string): Observable<any> {
    return this.defaultPipe(this.http.delete<any>(WiremockService.getUrl("proxy/" + uuid)));
  }

  getAllFiles(): Observable<FileList> {
    return this.defaultPipe(this.http.get<string[]>(WiremockService.getUrl("files"))).pipe(
      map(result => new FileList(result.map(f => new WmFile(f))))
    );
  }

  getFile(fileName: string): Observable<string> {
    return this.defaultPipe(this.http.get<any>(WiremockService.getUrl("files/" + fileName)));
  }

  downloadFile(fileName: string): Observable<string> {
    return this.defaultPipe(this.http.get<string>(WiremockService.getUrl("files/" + fileName))).pipe(
      tap(body => {
        UtilService.downloadFileContent(fileName, WiremockService.mapBody(body) ?? "");
      })
    );
  }

  uploadFile(file: File, fileName?: string): Observable<any> {
    return this.defaultPipe(
      this.fileToByteArray(file).pipe(
        switchMap(data => {
          return this.http.put<any>(WiremockService.getUrl("files/" + fileName || file.name), data);
        })
      )
    );
  }

  uploadFileByData(data: any, fileName: string): Observable<any> {
    return this.defaultPipe(this.http.put<any>(WiremockService.getUrl("files/" + fileName), data));
  }

  private fileToByteArray(file: File): Observable<any> {
    return fromPromise(file.arrayBuffer());
  }

  deleteFile(fileName: string): Observable<void> {
    return this.defaultPipe(this.http.delete<any>(WiremockService.getUrl("files/" + fileName)));
  }

  test(
    path: string,
    method: string,
    body: any | undefined,

    headers: { [header: string]: string | string[] }
  ): Observable<HttpEvent<any>> {
    path = path.charAt(0) === "/" ? path.substring(1) : path;
    const url = environment.wiremockUrl + path;
    const request = new HttpRequest(method, url, body, {
      headers: new HttpHeaders(headers),
      responseType: "text",
      reportProgress: true,
    });
    return this.http.request(request);
  }

  private defaultPipe<T>(observable: Observable<T>) {
    const delay = 1_000;
    return observable.pipe(
      retry({
        count: 1,
        delay: (error, count) => {
          if (error) {
            if (error.error instanceof ErrorEvent) {
              console.error("An error occurred:", error.error.message);
            } else {
              console.error("An error occurred:", error);
            }
          }
          console.log(`Attempt ${count}: retrying in ${count * delay}ms`);
          return timer(count * delay);
        },
      })
    );
  }
}
