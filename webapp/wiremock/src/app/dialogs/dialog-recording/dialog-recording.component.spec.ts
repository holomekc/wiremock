import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DialogRecordingComponent } from "./dialog-recording.component";

describe("DialogRecordingComponent", () => {
  let component: DialogRecordingComponent;
  let fixture: ComponentFixture<DialogRecordingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogRecordingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
