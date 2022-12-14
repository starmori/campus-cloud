import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { CP_TRACK_TO } from '@campus-cloud/shared/directives';
import { CPTrackingService } from '@campus-cloud/shared/services';
import { amplitudeEvents } from '@campus-cloud/shared/constants';

@Component({
  selector: 'cp-employer-action-box',
  templateUrl: './employer-action-box.component.html',
  styleUrls: ['./employer-action-box.component.scss']
})
export class EmployerActionBoxComponent implements OnInit {
  @Output() search: EventEmitter<string> = new EventEmitter();
  @Output() launchCreateModal: EventEmitter<null> = new EventEmitter();

  eventData;

  constructor(public cpTracking: CPTrackingService) {}

  onSearch(query) {
    this.search.emit(query);
  }

  onLaunchCreateModal() {
    this.launchCreateModal.emit();
  }

  ngOnInit() {
    const eventProperties = {
      ...this.cpTracking.getAmplitudeMenuProperties(),
      page_type: amplitudeEvents.EMPLOYER
    };

    delete eventProperties['page_name'];
    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.CLICKED_CREATE_ITEM,
      eventProperties
    };
  }
}
