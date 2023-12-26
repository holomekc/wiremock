import { Directive, ElementRef, Input, NgZone, OnChanges, SecurityContext, SimpleChanges } from "@angular/core";
import { UtilService } from "../services/util.service";
import { DomSanitizer } from "@angular/platform-browser";

declare const hljs: any;

@Directive({
  selector: '[wmHighlightJs]'
})
export class HighlightJsDirective implements OnChanges {

  @Input()
  wmHighlightJs: string;

  @Input()
  language: string;

  constructor(private elementRef: ElementRef, private zone: NgZone, private sanitizer: DomSanitizer) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.updateText();
      });
    });
  }

  private updateText() {
    const code = this.elementRef.nativeElement;
    code.classList.add('hljs');

    if (UtilService.isUndefined(this.wmHighlightJs) || this.wmHighlightJs.length === 0) {
      code.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, '');
      return;
    }

    const prettyCode = UtilService.prettify(this.wmHighlightJs);

    const highlighted = hljs.highlightAuto(prettyCode, this.isLangAvailable() ? [ this.language ] : [ 'html', 'json', 'xml', 'http' ]);

    if (highlighted.language === 'json' || highlighted.language === 'xml' ||
      highlighted.language === 'http' || highlighted.language === 'html') {
      code.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, highlighted.value);
    } else {
      code.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, prettyCode);
    }
  }

  private isLangAvailable() {
    return typeof this.language !== 'undefined' && this.language != null && this.language.length > 0;
  }


}
