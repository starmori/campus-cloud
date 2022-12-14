import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { CPI18nService } from '../../../../shared/services/index';

@Component({
  selector: 'cp-base-feedback',
  templateUrl: './base-feedback.component.html',
  styleUrls: ['./base-feedback.component.scss']
})
export class BaseFeedbackComponent implements OnInit {
  @Input() data: any;
  @Input() isEvent: boolean;
  @Input() isService: boolean;
  @Input() isSubmitted: Observable<boolean>;
  @Output() send: EventEmitter<any> = new EventEmitter();

  pageTitle;

  constructor(public cpI18n: CPI18nService) {}

  ngOnInit() {
    this.pageTitle = this.isService
      ? this.cpI18n.translate('feedback_label_service_feedback')
      : this.cpI18n.translate('feedback_label_event_feedback');

    if (!this.isEvent && !this.isService) {
      console.warn('BaseFeedbackComponent, needs an isEvent or isService');
    }
  }
}
