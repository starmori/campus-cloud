import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CPSession } from '@campus-cloud/session';
import { BaseComponent } from '@campus-cloud/base';
import { DashboardService } from '../../dashboard.service';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { DashboardUtilsService } from '../../dashboard.utils.service';
import { environment } from '@projects/campus-cloud/src/environments/environment';

@Mixin([Destroyable])
@Component({
  selector: 'cp-dashboard-campus-tile',
  templateUrl: './dashboard-campus-tile.component.html',
  styleUrls: ['./dashboard-campus-tile.component.scss']
})
export class DashboardCampusTileComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() experiences;

  loading;
  items = [];
  selectedPersona;
  defaultImage = `${environment.root}assets/default/user.png`;

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    private session: CPSession,
    public route: ActivatedRoute,
    private service: DashboardService,
    public utils: DashboardUtilsService
  ) {
    super();
    super
      .isLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  fetch(start, end, experience_id) {
    const search = new HttpParams()
      .set('end', end)
      .set('start', start)
      .set('persona_id', experience_id)
      .set('school_id', this.session.g.get('school').id);

    const stream$ = this.service.getCampusTile(search);

    super.fetchData(stream$).then((res) => (this.items = res.data));
  }

  getSelectedPersona(selectedPersonaId) {
    return this.experiences.filter((p) => p.action === selectedPersonaId)[0];
  }

  listenForQueryParamChanges() {
    // instead of passing @Input(s) we update the queryParams
    // and call the fetch event whenever any of those values change

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const validParams = this.utils.validParams(params);

      if (!validParams) {
        return;
      }

      const { start, end, cga_exp_id } = params;

      this.selectedPersona = this.getSelectedPersona(+cga_exp_id);

      this.fetch(start, end, cga_exp_id);
    });
  }

  ngOnInit() {
    this.listenForQueryParamChanges();
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
