import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CurlPreviewComponent } from "./curl-preview.component";

describe("CurlPreviewComponent", () => {
  let component: CurlPreviewComponent;
  let fixture: ComponentFixture<CurlPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurlPreviewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurlPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
