import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CPSession } from '@campus-cloud/session';
import { FORMAT } from '@campus-cloud/shared/pipes';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { canSchoolWriteResource } from '@campus-cloud/shared/utils';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives/tracking';
import { amplitudeEvents } from '@campus-cloud/shared/constants/analytics';
import { CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';

interface ISort {
  sort_field: string;
  sort_direction: string;
}

const sort = {
  sort_field: 'title', // title, start, end
  sort_direction: 'asc' // asc, desc
};

@Component({
  selector: 'cp-list-past',
  templateUrl: './list-past.component.html',
  styleUrls: ['./list-past.component.scss']
})
export class ListPastComponent implements OnInit {
  @Input() state: any;
  @Input() events: any;
  @Input() isOrientation: boolean;

  @Output() sortList: EventEmitter<ISort> = new EventEmitter();

  eventData;
  sortingLabels;
  sort: ISort = sort;
  dateFormat = FORMAT.SHORT;
  canViewAttendance = false;
  isExternalToolTip = this.cpI18n.translate('t_events_list_external_source_tooltip');

  constructor(
    private session: CPSession,
    private cpI18n: CPI18nService,
    private cpTracking: CPTrackingService
  ) {}

  setEventProperties() {
    return {
      ...this.cpTracking.getAmplitudeMenuProperties(),
      page_type: amplitudeEvents.PAST_EVENT
    };
  }

  doSort(sort_field) {
    const sort_direction = this.state.sort_direction === 'asc' ? 'desc' : 'asc';

    this.sort = Object.assign({}, this.sort, { sort_field, sort_direction });

    this.sortList.emit(this.sort);
  }

  ngOnInit() {
    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.VIEWED_ITEM,
      eventProperties: this.setEventProperties()
    };

    this.sortingLabels = {
      name: this.cpI18n.translate('name'),
      end_date: this.cpI18n.translate('end_date')
    };

    this.canViewAttendance = canSchoolWriteResource(
      this.session.g,
      CP_PRIVILEGES_MAP.event_attendance
    );
  }
}
