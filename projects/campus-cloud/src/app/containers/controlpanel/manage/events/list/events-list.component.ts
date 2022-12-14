import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { ISnackbar } from '@campus-cloud/store';
import { CPSession } from '@campus-cloud/session';
import { EventsService } from '../events.service';
import { ManageHeaderService } from '../../utils/header';
import { EventsComponent } from './base/events.component';
import { CPI18nService, ModalService } from '@campus-cloud/shared/services';

@Component({
  selector: 'cp-events-list',
  templateUrl: './base/events.component.html',
  styleUrls: ['./base/events.component.scss']
})
export class EventsListComponent extends EventsComponent implements OnInit {
  events;
  loading;
  pageNext;
  pagePrev;
  pageNumber;
  isUpcoming;
  deleteEvent = '';

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: EventsService,
    public store: Store<ISnackbar>,
    public modalService: ModalService,
    private headerService: ManageHeaderService
  ) {
    super(session, cpI18n, service, modalService, store);
  }

  ngOnInit() {
    this.headerService.updateHeader();
  }
}
