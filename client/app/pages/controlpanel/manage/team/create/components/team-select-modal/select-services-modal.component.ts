import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ServicesService } from '../../../../services/services.service';
import { BaseTeamSelectModalComponent } from './team-select-modal.component';

declare var $: any;

@Component({
  selector: 'cp-select-services-modal',
  templateUrl: './team-select-modal.component.html',
  styleUrls: ['./team-select-modal.component.scss']
})
export class SelectTeamServicesModalComponent extends BaseTeamSelectModalComponent
implements OnInit {
  @Output() selected: EventEmitter<any> = new EventEmitter();

  constructor(private service: ServicesService) {
    super();
    this.title = 'Services';
  }

  onSubmit(): any {
    this.selected.emit(super.onSubmit());
    $('#selectServicesModal').modal('hide');
  }

  ngOnInit() {
    super.fetch(this.service.getServices());
    super.buildPrivilegesDropDown();
  }
}
