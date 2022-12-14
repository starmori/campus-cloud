import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { CPSession } from '@campus-cloud/session';
import { IDateRange } from '@campus-cloud/shared/components';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives/tracking';
import { amplitudeEvents } from '@campus-cloud/shared/constants/analytics';
import { CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';
import * as EngageUtils from '@controlpanel/assess/engagement/engagement.utils.service';

@Component({
  selector: 'cp-providers-action-box',
  templateUrl: './providers-action-box.component.html',
  styleUrls: ['./providers-action-box.component.scss']
})
export class ServicesProviderActionBoxComponent implements OnInit {
  @Input() noProviders;
  @Input() allowLocationsImport;
  @Input() allowServiceProvidersImport;
  @Input() isDownloading;

  @Output() download: EventEmitter<null> = new EventEmitter();
  @Output() downloadAllQR: EventEmitter<null> = new EventEmitter();
  @Output() importLocations: EventEmitter<null> = new EventEmitter();
  @Output() search: EventEmitter<null> = new EventEmitter();
  @Output() filterByDates: EventEmitter<IDateRange> = new EventEmitter();
  @Output() launchAddProviderModal: EventEmitter<null> = new EventEmitter();
  @Output() updateStudentFilter: EventEmitter<EngageUtils.IStudentFilter> = new EventEmitter();

  eventData;
  studentFilter$: Observable<any[]>;
  dateRanges: EngageUtils.IDateFilter[];

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    private cpTracking: CPTrackingService,
    public engageUtils: EngageUtils.EngagementUtilsService
  ) {}

  onDownload() {
    this.download.emit();
  }

  onDownloadAllQR() {
    if (!this.isDownloading) {
      this.downloadAllQR.emit();
    }
  }

  onImportLocations() {
    this.importLocations.emit();
  }

  onLaunchProviderAdd() {
    this.launchAddProviderModal.emit();
  }

  onSearch(query) {
    this.search.emit(query);
  }

  onDateChange(dateRange) {
    if (dateRange.payload) {
      dateRange = {
        label: dateRange.label,
        start: dateRange.payload.range.start,
        end: dateRange.payload.range.end
      };
    }
    this.filterByDates.emit(dateRange);
  }

  onStudentFilter(filter: EngageUtils.IStudentFilter) {
    this.updateStudentFilter.emit(filter);
  }

  ngOnInit() {
    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.CLICKED_CREATE_ITEM,
      eventProperties: this.cpTracking.getAmplitudeMenuProperties()
    };

    this.studentFilter$ = this.engageUtils.getStudentFilter();
    this.dateRanges = this.engageUtils.dateFilter();
  }

  launchImportModal() {
    $('#providersExcelModal').modal({ keyboard: true, focus: true });
  }
}
