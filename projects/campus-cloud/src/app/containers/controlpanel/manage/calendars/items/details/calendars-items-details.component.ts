import { BehaviorSubject, combineLatest } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { CPSession } from './../../../../../../session';
import { ICalendar } from './../../calendars.interface';
import { BaseComponent } from '../../../../../../base';
import { FORMAT } from '../../../../../../shared/pipes';
import { CalendarsService } from '../../calendars.services';
import { baseActions, IHeader } from '../../../../../../store/base';

@Component({
  selector: 'cp-calendars-items-details',
  templateUrl: './calendars-items-details.component.html',
  styleUrls: ['./calendars-items-details.component.scss']
})
export class CalendarsItemsDetailsComponent extends BaseComponent implements OnInit {
  item;
  mapCenter;
  itemId: number;
  loading = true;
  draggable = false;
  calendarId: number;
  calendar: ICalendar;
  showLocationDetails = true;
  dateFormat = FORMAT.DATETIME;

  constructor(
    public session: CPSession,
    public route: ActivatedRoute,
    public store: Store<IHeader>,
    public service: CalendarsService
  ) {
    super();

    super.isLoading().subscribe((loading) => (this.loading = loading));
    this.itemId = this.route.snapshot.params['itemId'];
    this.calendarId = this.route.snapshot.params['calendarId'];

    this.fetch();
  }

  buildHeader() {
    this.store.dispatch({
      type: baseActions.HEADER_UPDATE,
      payload: {
        heading: `[NOTRANSLATE]${this.item.title}[NOTRANSLATE]`,
        subheading: null,
        em: null,
        crumbs: {
          url: `/manage/calendars/${this.calendar.id}`,
          label: `[NOTRANSLATE]${this.calendar.name}[NOTRANSLATE]`
        },
        children: []
      }
    });
  }

  fetch() {
    const calendarSearch = new HttpParams().append(
      'school_id',
      this.session.g.get('school').id.toString()
    );
    const itemSearch = new HttpParams()
      .append('school_id', this.session.g.get('school').id.toString())
      .append('academic_calendar_id', this.calendarId.toString());

    const item$ = this.service.getItemById(this.itemId, itemSearch);
    const calendar$ = this.service.getCalendarById(this.calendarId, calendarSearch);
    const stream$ = combineLatest([item$, calendar$]);

    super.fetchData(stream$).then((res) => {
      this.item = res.data[0];
      this.calendar = res.data[1];

      this.buildHeader();

      this.mapCenter = new BehaviorSubject({
        lat: this.item.latitude,
        lng: this.item.longitude
      });

      this.showLocationDetails = this.item.latitude !== 0 && this.item.longitude !== 0;
    });
  }

  ngOnInit() {}
}
