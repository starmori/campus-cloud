import { CPSession } from './../../../../session/index';
import { EngagementService } from './engagement.service';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

const SERVICE_WITH_ATTENDANCE = '1';

@Injectable()
export class EngagementResolver implements Resolve<any> {
  constructor(private session: CPSession, private service: EngagementService) {}

  resolve(): Observable<any> {
    const search = new HttpParams().append('school_id', this.session.g.get('school').id.toString());

    const serviceSearch = new HttpParams()
      .append('attendance_only', SERVICE_WITH_ATTENDANCE)
      .append('school_id', this.session.g.get('school').id.toString());

    const servicesList$ = this.service
      .getServices(undefined, undefined, serviceSearch)
      .catch((_) => Observable.of([]));

    const listsList$ = this.service
      .getLists(undefined, undefined, search)
      .catch((_) => Observable.of([]));

    const stream$ = Observable.combineLatest(servicesList$, listsList$);

    return stream$;
  }
}
