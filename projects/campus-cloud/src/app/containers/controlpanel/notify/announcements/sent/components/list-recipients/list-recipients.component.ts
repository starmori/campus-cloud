import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { maxAllowed } from './list-recipients.constant';
import { CPI18nPipe } from '@campus-cloud/shared/pipes';
import { IListDetail, IUserDetail } from '../../../model';
import { TooltipOption } from 'bootstrap';

const i18n = new CPI18nPipe();

@Component({
  selector: 'cp-list-recipients',
  templateUrl: './list-recipients.component.html',
  styleUrls: ['./list-recipients.component.scss']
})
export class AnnouncementsListRecipientsComponent implements OnInit {
  @Input() lists: Array<IListDetail>;
  @Input() users: Array<IUserDetail>;

  @Output() viewMoreModal: EventEmitter<null> = new EventEmitter();

  moreText;
  maxAllowed = maxAllowed.inList;
  maxToolTipAllowed = maxAllowed.inTooltip;
  recipients: Array<string> = [];
  totalRecipients: Array<string> = [];
  recipients_more: Array<string> = [];
  tooltipRecipients: Array<string> = [];
  tooltipRecipientsMore: Array<string> = [];

  constructor() {}

  ngOnInit() {
    if (!this.lists) {
      this.lists = [];
    }

    if (!this.users) {
      this.users = [];
    }

    if (this.lists.length) {
      this.lists.map((item, index) => {
        this.totalRecipients.push(item.name);
        if (index + 1 <= this.maxAllowed) {
          this.recipients.push(item.name);

          return;
        }
        this.recipients_more.push(item.name);
      });
    }

    if (this.users.length) {
      this.users.map((item, index) => {
        this.totalRecipients.push(`${item.firstname} ${item.lastname}`);
        if (index + 1 <= this.maxAllowed) {
          this.recipients.push(`${item.firstname} ${item.lastname}`);

          return;
        }
        this.recipients_more.push(`${item.firstname} ${item.lastname}`);
      });
    }

    if (this.recipients_more.length) {
      this.recipients_more.map((item, index) => {
        if (index + 1 <= this.maxToolTipAllowed) {
          this.tooltipRecipients.push(item);

          return;
        }
        this.tooltipRecipientsMore.push(item);
      });

      this.moreText =
        this.tooltipRecipientsMore.length > 0
          ? i18n.transform('announcement_and_more_text', this.tooltipRecipientsMore.length)
          : '';

      this.tooltipRecipients.push(this.moreText);
    }
  }
}
