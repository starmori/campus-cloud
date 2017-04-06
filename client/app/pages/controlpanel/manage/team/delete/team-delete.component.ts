import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TeamService } from '../team.service';

declare var $: any;

@Component({
  selector: 'cp-team-delete',
  templateUrl: './team-delete.component.html',
  styleUrls: ['./team-delete.component.scss']
})
export class TeamDeleteComponent implements OnInit {
  @Input() admin: any;
  @Output() deleted: EventEmitter<any> = new EventEmitter();
  @Output() errorModal: EventEmitter<null> = new EventEmitter();

  constructor(
    private teamService: TeamService
  ) { }

  onDelete() {

    this
      .teamService
      .deleteAdminById(this.admin.id)
      .subscribe(
        _ => {
          this.deleted.emit(this.admin.id);
          $('#teamDeleteModal').modal('hide');
        },
        err => {
          if (err.status === 503) {
            this.errorModal.emit();
          }
          $('#teamDeleteModal').modal('hide');
        }
      );

  }
  ngOnInit() { }
}

