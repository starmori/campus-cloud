import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { takeUntil, map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import { CPSession } from '@app/session';
import { IItem } from '@client/app/shared/components';
import { IStore } from '@shared/services/store.service';
import { EventIntegration } from '@libs/integrations/events/model';
import { CommonIntegrationUtilsService } from '@libs/integrations/common/providers';

@Component({
  selector: 'cp-events-integrations-create',
  templateUrl: './integrations-create.component.html',
  styleUrls: ['./integrations-create.component.scss']
})
export class EventsIntegrationsCreateComponent implements OnInit, OnDestroy {
  @Input() stores$: Observable<IStore[] | IItem[]>;

  @Output() teardown: EventEmitter<null> = new EventEmitter();

  form: FormGroup;
  destroy$ = new Subject();
  typesDropdown: IItem[];

  constructor(
    public session: CPSession,
    public utils: CommonIntegrationUtilsService,
    public store: Store<fromStore.IEventIntegrationState>
  ) {}

  get defaultParams(): HttpParams {
    const school_id = this.session.g.get('school').id;

    return new HttpParams().set('school_id', school_id);
  }

  resetModal() {
    this.form.reset();
    this.teardown.emit();
  }

  doSubmit() {
    if (!this.form.valid) {
      return;
    }

    const body = this.form.value;
    const school_id = this.session.g.get('school').id;
    const params = new HttpParams().set('school_id', school_id);

    const payload = {
      body,
      params
    };

    this.store.dispatch(new fromStore.PostIntegration(payload));

    this.resetModal();
  }

  ngOnInit(): void {
    const schoolId = this.session.g.get('school').id;

    this.form = EventIntegration.form();
    this.form.get('school_id').setValue(schoolId);

    this.stores$ = this.store.select(fromStore.getIntegrationsHosts).pipe(
      takeUntil(this.destroy$),
      tap((stores: IStore[]) => {
        if (!stores.length) {
          const params = this.defaultParams;

          this.store.dispatch(new fromStore.GetHosts({ params }));
        }
      }),
      map((res) => (res.length ? res : [{ label: '---', action: null }]))
    );

    this.typesDropdown = this.utils.typesDropdown();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
