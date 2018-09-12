import { Component, OnInit, Input } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CPSession } from './../../../../../../../../../session';
import { ProvidersService } from '../../../../../providers.service';
import { FORMAT } from '../../../../../../../../../shared/pipes/date';
import { CheckInMethod } from '../../../../../../events/event.status';
import { ServicesUtilsService } from '../../../../../services.utils.service';
import { CPTrackingService } from '../../../../../../../../../shared/services';
import { BaseComponent } from '../../../../../../../../../base/base.component';
import { amplitudeEvents } from '../../../../../../../../../shared/constants/analytics';
import { CPI18nService } from './../../../../../../../../../shared/services/i18n.service';

interface IState {
  search_text: string;
  sort_field: string;
  sort_direction: string;
}

const state: IState = {
  search_text: null,
  sort_field: 'check_in_time',
  sort_direction: 'desc'
};

@Component({
  selector: 'cp-providers-attendees-list',
  templateUrl: './providers-attendees-list.component.html',
  styleUrls: ['./providers-attendees-list.component.scss']
})
export class ServicesProvidersAttendeesListComponent extends BaseComponent implements OnInit {
  @Input() serviceId: number;
  @Input() providerId: number;
  @Input() query: Observable<string>;
  @Input() download: Observable<boolean>;

  loading;
  assessments;
  sortingLabels;
  eventProperties;
  state: IState = state;
  dateFormat = FORMAT.DATETIME;
  webCheckInMethod = CheckInMethod.web;
  defaultImage = require('public/default/user.png');

  constructor(
    public session: CPSession,
    private cpI18n: CPI18nService,
    private utils: ServicesUtilsService,
    private cpTracking: CPTrackingService,
    private providersService: ProvidersService
  ) {
    super();
    super.isLoading().subscribe((res) => (this.loading = res));
  }

  fetch() {
    const search = new HttpParams()
      .append('search_text', this.state.search_text)
      .append('service_id', this.serviceId.toString())
      .append('service_provider_id', this.providerId.toString())
      .append('sort_field', this.state.sort_field)
      .append('sort_direction', this.state.sort_direction);

    const stream$ = this.providersService.getProviderAssessments(
      this.startRange,
      this.endRange,
      search
    );

    super.fetchData(stream$).then((res) => {
      this.assessments = res.data;
    });
  }

  onPaginationNext() {
    super.goToNext();
    this.fetch();
  }

  onPaginationPrevious() {
    super.goToPrevious();
    this.fetch();
  }

  fetchAllRecords(): Promise<any> {
    const search = new HttpParams()
      .append('all', '1')
      .append('service_id', this.serviceId.toString())
      .append('service_provider_id', this.providerId.toString());

    const stream$ = this.providersService.getProviderAssessments(
      this.startRange,
      this.endRange,
      search
    );

    return stream$.toPromise();
  }

  doSort(sort_field) {
    this.state = {
      ...this.state,
      sort_field,
      sort_direction: this.state.sort_direction === 'asc' ? 'desc' : 'asc'
    };

    this.fetch();
  }

  trackAmplitudeEvent() {
    this.eventProperties = {
      data_type: amplitudeEvents.ATTENDANCE
    };

    this.cpTracking.amplitudeEmitEvent(amplitudeEvents.MANAGE_DOWNLOAD_DATA, this.eventProperties);
  }

  ngOnInit() {
    this.download.subscribe((download) => {
      if (download && this.assessments.length) {
        this.trackAmplitudeEvent();
        this.fetchAllRecords().then((attendees) =>
          this.utils.exportServiceProvidersAttendees(attendees));
      }
    });

    this.query.subscribe((search_text) => {
      this.state = Object.assign({}, this.state, { search_text });
      this.fetch();
    });

    this.sortingLabels = {
      checkin_time: this.cpI18n.translate('services_label_checkin_time'),
      checkin_method: this.cpI18n.translate('services_label_all_checkin_methods')
    };
  }
}
