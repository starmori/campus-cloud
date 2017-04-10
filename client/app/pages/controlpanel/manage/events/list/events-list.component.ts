import { Component, OnInit } from '@angular/core';
// import { URLSearchParams } from '@angular/http';
import { Store } from '@ngrx/store';

import { EventsService } from '../events.service';
// import { CPState } from '../../../../../shared/utils';
// import { BaseComponent } from '../../../../../base/base.component';
import { HEADER_UPDATE, IHeader } from '../../../../../reducers/header.reducer';

import { EventsComponent } from './base/events.component';

interface IState {
  start: number;
  end: number;
  store_id: number;
  attendance_only: number;
  sort_field: string;
  sort_direction: string;
  events: any[];
}

const state = {
  start: null,
  end: null,
  store_id: null,
  attendance_only: 0,
  sort_field: 'start',
  sort_direction: 'asc',
  events: []
};

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
  state: IState = state;

  constructor(
    private store: Store<IHeader>,
    public service: EventsService
  ) {
    super(service);
    this.buildHeader();
    // super.isLoading().subscribe(res => this.loading = res);
  }

  // private fetch(stream$) {
  //   super
  //     .fetchData(stream$)
  //     .then(res => {
  //       this.state = Object.assign({}, this.state, { events: res.data });
  //     })
  //     .catch(err => console.error(err));
  // }

  private buildHeader() {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: require('../../manage.header.json')
    });
  }

  // onSortList(sort) {
  //   this.state = Object.assign(
  //     {},
  //     this.state,
  //     {
  //       sort_field: sort.sort_field,
  //       sort_direction: sort.sort_direction
  //     }
  //   );

  //   this.buildHeaders();
  // }

  // doFilter(filter) {
  //   this.state = Object.assign(
  //     {},
  //     this.state,
  //     {
  //       start: filter.start,
  //       end: filter.end,
  //       store_id: filter.store_id,
  //       attendance_only: filter.attendance_only
  //     }
  //   );

  //   this.isUpcoming = filter.upcoming;

  //   this.buildHeaders();
  // }

  // buildHeaders() {
  //   let end = this.endRange;
  //   let start = this.startRange;
  //   let search = new URLSearchParams();
  //   let store_id = this.state.store_id ? (this.state.store_id).toString() : null;

  //   search.append('start', (this.state.start).toString());
  //   search.append('end', (this.state.end).toString());
  //   search.append('store_id', store_id);
  //   search.append('attendance_only', (this.state.attendance_only).toString());

  //   search.append('sort_field', this.state.sort_field);
  //   search.append('sort_direction', this.state.sort_direction);

  //   this.fetch(this.service.getEvents(start, end, search));
  // }

  // onDeleteEvent(event) {
  //   this.deleteEvent = event;
  // }

  // onDeletedEvent(eventId) {
  //   const _state = CPState.deleteById(this.state, 'events', eventId);

  //   this.state = Object.assign({}, this.state, _state);
  // }

  // onPaginationNext() {
  //   super.goToNext();

  //   this.buildHeaders();
  // }

  // onPaginationPrevious() {
  //   super.goToPrevious();

  //   this.buildHeaders();
  // }

  // ngOnDestroy() {
  //   // console.log('destroy');
  // }

  ngOnInit() { }
}
