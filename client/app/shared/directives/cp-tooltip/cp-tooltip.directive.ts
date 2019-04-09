import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { TooltipOption } from 'bootstrap';

// https://getbootstrap.com/docs/4.1/components/tooltips/#options
const defaultOptions: TooltipOption = {
  placement: 'bottom'
};

@Directive({
  selector: '[cpTooltip]'
})
export class CPToolTipDirective implements OnChanges {
  @Input() cpTooltip: TooltipOption;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (typeof this.cpTooltip === 'boolean' && !this.cpTooltip) {
      return;
    }

    $(this.el.nativeElement).tooltip({
      ...defaultOptions,
      ...this.cpTooltip
    });
  }
}
