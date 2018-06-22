import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CPSession } from './../../../../../../../session';
import { CP_PRIVILEGES_MAP } from './../../../../../../../shared/constants/privileges';
import { canSchoolWriteResource } from './../../../../../../../shared/utils/privileges/privileges';

@Component({
  selector: 'cp-past-events-action-box',
  templateUrl: './past-events-action-box.component.html',
  styleUrls: ['./past-events-action-box.component.scss']
})
export class EventsPastActionBoxComponent implements OnInit {
  @Output() querySearch: EventEmitter<string> = new EventEmitter();
  @Output() createExcel: EventEmitter<null> = new EventEmitter();
  canDownload = false;

  constructor(public session: CPSession) {}

  onSearch(query) {
    this.querySearch.emit(query);
  }

  downloadExcel() {
    this.createExcel.emit();
  }

  ngOnInit() {
    this.canDownload = canSchoolWriteResource(this.session.g, CP_PRIVILEGES_MAP.event_attendance);
  }
}
