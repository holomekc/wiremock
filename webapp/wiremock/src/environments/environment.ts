// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  getWebSocket: (): WebSocket => {
    return new WebSocket("ws://127.0.0.1:8088/__admin/events");
  },
  wiremockUrl: "/",
  url: "/__admin/",
  resourcesUrl: "/__admin/webapp/",
};
