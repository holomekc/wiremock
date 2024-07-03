import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { UtilService } from "./util.service";
import { Observable } from "rxjs/internal/Observable";
import { Subject } from "rxjs/internal/Subject";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket: ReconnectWebSocket;

  constructor() {
    this.socket = new ReconnectWebSocket();
    this.socket.socketReconnect();
  }

  public observe(key: string): Observable<MessageEvent> {
    return this.socket.subject.pipe(
      filter(next => {
        return next.data === key;
      })
    );
  }
}

let reconnectWebSocket: ReconnectWebSocket;

export class ReconnectWebSocket {
  subject: Subject<MessageEvent>;

  private webSocket!: WebSocket;

  constructor() {
    // We need the var because of overwritten method this would be the actual WebSocket
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    reconnectWebSocket = this;

    this.subject = new Subject<MessageEvent>();
  }

  socketReconnect() {
    this.webSocket = environment.getWebSocket();

    this.webSocket.onmessage = this.privateOnmessage;
    this.webSocket.onerror = this.privateOnerror;
    this.webSocket.onclose = this.privateOnclose;
  }

  private privateOnmessage(ev: MessageEvent): void {
    if (UtilService.isDefined(reconnectWebSocket.onmessage)) {
      reconnectWebSocket.onmessage(ev);
    }
  }

  private privateOnerror(ev: Event): void {
    if (UtilService.isDefined(reconnectWebSocket.onerror)) {
      reconnectWebSocket.onerror();
    }
  }

  private privateOnclose(ev: CloseEvent): void {
    if (UtilService.isDefined(reconnectWebSocket.onclose)) {
      reconnectWebSocket.onclose();
    }

    setTimeout(() => reconnectWebSocket.socketReconnect(), 5000);
  }

  onmessage(ev: MessageEvent): void {
    reconnectWebSocket.subject.next(ev);
  }

  onerror(): void {}

  onclose(): void {}

  readyState(): number {
    return this.webSocket.readyState;
  }

  send(data: any) {
    this.webSocket.send(data);
  }
}
