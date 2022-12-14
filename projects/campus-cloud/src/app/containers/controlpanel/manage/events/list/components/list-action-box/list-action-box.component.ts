import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { DATE_FILTER } from './events-filters';
import { CPSession } from '@campus-cloud/session';
import { CPDate } from '@campus-cloud/shared/utils/date';
import { EventAttendance } from '../../../event.status';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives/tracking';
import { amplitudeEvents, CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { StoreService, CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';

import {
  canAccountLevelWriteResource,
  canSchoolWriteResource
} from '@campus-cloud/shared/utils/privileges/privileges';

interface IState {
  end: number;
  start: number;
  store_id: number;
  upcoming: boolean;
  search_str: string;
  attendance_only: number;
}

@Component({
  selector: 'cp-list-action-box',
  templateUrl: './list-action-box.component.html',
  styleUrls: ['./list-action-box.component.scss']
})
export class ListActionBoxComponent implements OnInit {
  @Input() isSimple: boolean;
  @Input() isOrientation: boolean;
  @Input() showIntegration: boolean;
  @Output() listAction: EventEmitter<IState> = new EventEmitter();

  hosts;
  eventData;
  isCalendar;
  eventFilter;
  dateFilterOpts;
  canCreateEvent;
  viewedIntegrationEventData;
  threeYearsFromNow = CPDate.now(this.session.tz)
    .add(3, 'years')
    .unix();
  isFilteredByDate;
  state: IState = {
    upcoming: true,
    search_str: null,
    store_id: null, // all stores
    attendance_only: EventAttendance.disabled,
    start: CPDate.now(this.session.tz).unix(),
    end: this.threeYearsFromNow
  };
  stores$: Observable<any>;

  constructor(
    private el: ElementRef,
    private session: CPSession,
    public cpI18n: CPI18nService,
    private storeService: StoreService,
    private cpTracking: CPTrackingService
  ) {}

  getStores() {
    const school = this.session.g.get('school');
    const search: HttpParams = new HttpParams().append('school_id', school.id.toString());

    this.stores$ = this.storeService.getStores(search);
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    if (!this.el.nativeElement.contains(event.target) || event.target.nodeName !== 'svg') {
      if (this.isCalendar) {
        this.isCalendar = false;
      }
    }
  }

  onToggleCalendar(event: Event) {
    event.stopPropagation();
    this.isCalendar = !this.isCalendar;
  }

  private resetDateRange() {
    const now = CPDate.now(this.session.tz).unix();
    this.isFilteredByDate = false;

    if (this.state.upcoming) {
      this.state = Object.assign({}, this.state, {
        start: now,
        end: this.threeYearsFromNow
      });

      this.dateFilterOpts = Object.assign({}, this.dateFilterOpts, {
        minDate: CPDate.now(this.session.tz).format(),
        maxDate: null
      });

      return;
    }

    this.state = Object.assign({}, this.state, {
      start: 0,
      end: now
    });

    this.dateFilterOpts = Object.assign({}, this.dateFilterOpts, {
      minDate: null,
      maxDate: CPDate.now(this.session.tz).format()
    });
  }

  onSearch(search_str): void {
    this.state = Object.assign({}, this.state, { search_str });

    this.listAction.emit(this.state);
  }

  onFilterByHost(store_id): void {
    store_id = 0 ? null : store_id;

    this.state = Object.assign({}, this.state, { store_id });

    this.listAction.emit(this.state);
  }

  onEventDate(upcoming) {
    this.state = Object.assign({}, this.state, { upcoming });

    this.resetDateRange();

    this.listAction.emit(this.state);
  }

  onDateRange(dates) {
    this.isFilteredByDate = true;

    this.state = Object.assign({}, this.state, {
      start: CPDate.toEpoch(dates[0], this.session.tz),
      end: CPDate.toEpoch(dates[1], this.session.tz)
    });

    this.listAction.emit(this.state);
  }

  onAttendanceToggle(checked) {
    const attendance_only = checked ? EventAttendance.enabled : EventAttendance.disabled;

    this.state = Object.assign({}, this.state, { attendance_only });

    this.listAction.emit(this.state);
  }

  launchModal() {
    $('#excelEventsModal').modal({ keyboard: true, focus: true });
  }

  ngOnInit() {
    const eventName = amplitudeEvents.CLICKED_CREATE_ITEM;

    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName,
      eventProperties: this.cpTracking.getAmplitudeMenuProperties()
    };

    this.viewedIntegrationEventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.MANAGE_VIEWED_FEED_INTEGRATION,
      eventProperties: { sub_menu_name: amplitudeEvents.EVENT }
    };

    this.getStores();
    const canSchoolWrite = canSchoolWriteResource(this.session.g, CP_PRIVILEGES_MAP.events);
    const canAccountWrite = canAccountLevelWriteResource(this.session.g, CP_PRIVILEGES_MAP.events);

    this.canCreateEvent = canSchoolWrite || canAccountWrite || this.isOrientation;

    this.eventFilter = DATE_FILTER;

    this.dateFilterOpts = {
      inline: true,
      mode: 'range',
      minDate: CPDate.now(this.session.tz).format(),
      maxDate: null
    };

    this.listAction.emit(this.state);
  }
}
