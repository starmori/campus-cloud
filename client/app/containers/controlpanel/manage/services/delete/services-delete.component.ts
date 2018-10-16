import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { IService } from '../service.interface';
import { ServicesService } from '../services.service';
import { CPTrackingService } from '../../../../../shared/services';
import { amplitudeEvents } from '../../../../../shared/constants/analytics';
import { CPI18nService } from './../../../../../shared/services/i18n.service';

declare var $: any;

@Component({
  selector: 'cp-services-delete',
  templateUrl: './services-delete.component.html',
  styleUrls: ['./services-delete.component.scss']
})
export class ServicesDeleteComponent implements OnInit {
  @Input() service: IService;
  @Output() deleted: EventEmitter<number> = new EventEmitter();

  buttonData;
  eventProperties;

  constructor(
    private cpI18n: CPI18nService,
    private cpTracking: CPTrackingService,
    public servicesService: ServicesService
  ) {}

  onDelete() {
    this.servicesService.deleteService(this.service.id).subscribe((_) => {
      this.trackEvent();
      this.deleted.emit(this.service.id);
      $('#deleteServicesModal').modal('hide');
      this.buttonData = Object.assign({}, this.buttonData, { disabled: false });
    });
  }

  trackEvent() {
    this.eventProperties = {
      ...this.eventProperties,
      ...this.cpTracking.getEventProperties()
    };

    this.cpTracking.amplitudeEmitEvent(amplitudeEvents.DELETED_ITEM, this.eventProperties);
  }

  ngOnInit() {
    this.buttonData = {
      class: 'danger',
      text: this.cpI18n.translate('delete')
    };
  }
}
