import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  ViewChild,
  ElementRef,
  Output
} from '@angular/core';

export const MODAL_TYPE = {
  DEFAULT: 'modal-sm',
  WIDE: 'modal-lg'
};

@Component({
  selector: 'cp-modal',
  templateUrl: './cp-modal.component.html',
  styleUrls: ['./cp-modal.component.scss']
})
export class CPModalComponent implements OnInit {
  @Input() modalId: string;
  @Input() type: string;
  @Input() centered = false;

  @Output() modalClose: EventEmitter<null> = new EventEmitter();

  @ViewChild('cpModal', { static: true }) cpModal: ElementRef;

  class;

  constructor() {}

  ngOnInit() {
    const type = this.type ? this.type : null;
    const centered = this.centered ? 'modal-dialog-centered' : null;

    let classes = ['modal-dialog'];
    classes = [...classes, type, centered];

    this.class = classes.join(' ').trim();
    $(this.cpModal.nativeElement).on('hidden.bs.modal', () => this.modalClose.emit());
  }
}
