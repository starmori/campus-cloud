import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';

import { CPSession } from '@campus-cloud/session';
import { BaseComponent } from '@campus-cloud/base';
import { CPI18nPipe } from '@projects/campus-cloud/src/app/shared/pipes';

@Component({
  selector: 'cp-health-dashboard-traffic-location',
  templateUrl: './health-dashboard-traffic-location.component.html',
  styleUrls: ['./health-dashboard-traffic-location.component.scss']
})
export class HealthDashboardTrafficLocationComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() selectedSort: EventEmitter<any> = new EventEmitter();
  @Output() loadMore: EventEmitter<any> = new EventEmitter();
  @Input() locationTraffics;
  @Input() isUpdated = false;
  sortBy = [];
  loading = false;

  emitDestroy() {}

  constructor(private session: CPSession, private cpI18n: CPI18nPipe) {
    super();
  }

  fetch() {}

  onSortBySelected(item) {
    this.selectedSort.emit(item);
  }

  ngOnInit() {
    this.sortBy = [
      {
        label: this.cpI18n.transform('contact_trace_location_traffic'),
        action: 0
      },
      {
        label: this.cpI18n.transform('contact_trace_location_peak_traffic'),
        action: 1
      }
    ];
    this.fetch();
  }

  @HostListener('window:scroll', ['$event'])
  scrollHandler(event) {
    if (
      event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight &&
      this.isUpdated
    ) {
      this.loadMore.emit();
    }
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
