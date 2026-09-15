import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { WiremockService } from "./wiremock.service";
import { environment } from "../../environments/environment";

describe("WiremockService", () => {
  let service: WiremockService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WiremockService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WiremockService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  // Binary signatures and invalid UTF-8 bytes expose accidental text decoding.
  const files = [
    {
      name: "image.jpg",
      bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]),
    },
    { name: "image.png", bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0x80]) },
    {
      name: "document.pdf",
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3]),
    },
    { name: "text.txt", bytes: new TextEncoder().encode("Hello, світ!\r\n  Keep whitespace.\n") },
    { name: "data.json", bytes: new TextEncoder().encode('{\n  "message": "Привіт", "value": 42\n}\n') },
    { name: "empty.txt", bytes: new Uint8Array() },
  ];

  for (const file of files) {
    it(`should preserve every downloaded byte of ${file.name}`, async () => {
      const createObjectURL = spyOn(URL, "createObjectURL").and.returnValue("blob:download-test");
      const click = spyOn(HTMLAnchorElement.prototype, "click");
      const response = new Blob([file.bytes]);
      let emitted: unknown;

      service.downloadFile(file.name).subscribe(body => (emitted = body));
      const request = http.expectOne(environment.url + "files/" + file.name);
      expect(request.request.method).toBe("GET");
      expect(request.request.responseType).toBe("blob");
      request.flush(response);

      expect(emitted).toBe(response);
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const downloaded = createObjectURL.calls.mostRecent().args[0] as Blob;
      expect(new Uint8Array(await downloaded.arrayBuffer())).toEqual(file.bytes);
      expect(click).toHaveBeenCalledTimes(1);
      const link = click.calls.mostRecent().object as HTMLAnchorElement;
      expect(link.download).toBe(file.name);
      expect(link.href).toBe("blob:download-test");
    });
  }
});
