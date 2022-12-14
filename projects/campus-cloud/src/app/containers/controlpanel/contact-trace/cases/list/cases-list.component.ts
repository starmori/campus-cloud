import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { CPTrackingService } from '@campus-cloud/shared/services';
import { CPI18nPipe } from '@campus-cloud/shared/pipes';
import { amplitudeEvents } from '@projects/campus-cloud/src/app/shared/constants';
import { CP_TRACK_TO } from '@projects/campus-cloud/src/app/shared/directives';
import { FORMAT } from '@projects/campus-cloud/src/app/shared/pipes';
import { ICase } from '../cases.interface';
import { PrivacyConfiguration } from '@controlpanel/settings/team/team.utils.service';
import { privacyConfigurationOn } from '@campus-cloud/shared/utils';
import { CPSession } from '@campus-cloud/session';
@Component({
  selector: 'cp-cases-list',
  templateUrl: './cases-list.component.html',
  styleUrls: ['./cases-list.component.scss']
})
export class CasesListComponent implements OnInit {
  @Input() data$: Observable<ICase[]>;
  @Output() deleteClick: EventEmitter<ICase> = new EventEmitter();
  @Output() contactTraceAction: EventEmitter<ICase> = new EventEmitter();
  privacyTurnedOn: boolean;
  eventData;
  dateFormat = FORMAT.SHORT;

  constructor(
    public cpI18nPipe: CPI18nPipe,
    public cpTracking: CPTrackingService,
    public session: CPSession
  ) {
    this.privacyTurnedOn = privacyConfigurationOn(this.session.g);
  }

  ngOnInit() {
    const eventProperties = {
      ...this.cpTracking.getAmplitudeMenuProperties(),
      page_name: amplitudeEvents.INFO
    };

    this.eventData = {
      eventProperties,
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.VIEWED_ITEM
    };
  }

  traceContactAction(caseItem: ICase) {
    this.contactTraceAction.emit(caseItem);
  }

  displayExternalUserId({ extern_user_id }) {
    if (extern_user_id) {
      return extern_user_id.length > 45 ? extern_user_id.substr(0, 40) + '...' : extern_user_id;
    }
    return '';
  }
}
