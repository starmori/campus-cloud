import { OnInit, Output, Component, EventEmitter } from '@angular/core';

import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { CPTrackingService } from '@campus-cloud/shared/services';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives/tracking';

@Component({
  selector: 'cp-calendars-details-action-box',
  templateUrl: './calendars-details-action-box.component.html',
  styleUrls: ['./calendars-details-action-box.component.scss']
})
export class CalendarsDetailsActionBoxComponent implements OnInit {
  @Output() search: EventEmitter<string> = new EventEmitter();

  eventData;
  clickedItemEventData;

  constructor(private cpTracking: CPTrackingService) {}

  onSearch(query) {
    this.search.emit(query);
  }

  launchModal() {
    $('#calendarsItemsImport').modal({ keyboard: true, focus: true });
  }

  ngOnInit() {
    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.MANAGE_VIEWED_FEED_INTEGRATION,
      eventProperties: { sub_menu_name: amplitudeEvents.CALENDAR }
    };

    this.clickedItemEventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.CLICKED_CREATE_ITEM,
      eventProperties: this.cpTracking.getAmplitudeMenuProperties()
    };
  }
}
