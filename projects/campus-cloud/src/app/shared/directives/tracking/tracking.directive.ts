import { Directive, HostListener, Input } from '@angular/core';

import { EnvService } from '@campus-cloud/config/env';
import { CPTrackingService } from './../../services/tracking.service';

export const CP_TRACK_TO = {
  GA: 'ga',
  AMPLITUDE: 'am'
};

export interface IEventData {
  type: string;
  eventAction?: string;
  eventCategory?: string;
  eventLabel?: string;
  eventName?: string;
  eventProperties?: {};
}

@Directive({
  selector: '[cpTracker]',
  providers: [CPTrackingService]
})
export class CPTrackerDirective {
  @Input() eventData: IEventData;

  constructor(public cpTracker: CPTrackingService, private env: EnvService) {}

  @HostListener('click')
  onclick() {
    if (this.eventData.type === CP_TRACK_TO.GA) {
      this.emitGA();
    }

    if (this.eventData.type === CP_TRACK_TO.AMPLITUDE) {
      this.emitAmplitude();
    }
  }

  emitGA() {
    if (this.env.name === 'production') {
      this.cpTracker.gaEmitEvent(
        this.eventData.eventAction,
        this.eventData.eventCategory,
        this.eventData.eventLabel
      );
    }
  }

  emitAmplitude() {
    this.cpTracker.amplitudeEmitEvent(this.eventData.eventName, this.eventData.eventProperties);
  }
}
