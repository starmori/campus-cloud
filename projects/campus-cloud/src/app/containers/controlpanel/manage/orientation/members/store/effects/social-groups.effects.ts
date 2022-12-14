import { map, mergeMap, catchError } from 'rxjs/operators';
import { RouterReducerState } from '@ngrx/router-store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '@campus-cloud//store';
import { CPSession } from '@campus-cloud//session';
import { ISocialGroup } from '../../../../feeds/model';
import { baseActionClass } from '@campus-cloud//store/base';
import { CPI18nService } from '@campus-cloud/shared//services';
import * as fromActions from '../actions/social-groups.actions';
import { parseErrorResponse } from '@campus-cloud/shared/utils';
import { LibsCommonMembersService } from '@campus-cloud//libs/members/common/providers';

@Injectable()
export class OrientationSocialGroupEffects {
  @Effect()
  getSocialGroups$: Observable<
    fromActions.GetSocialGroupsSuccess | fromActions.GetSocialGroupsFail
  > = this.actions$.pipe(
    ofType(fromActions.SocialGroupTypes.GET_SOCIAL_GROUPS),
    map((action: fromActions.GetSocialGroups) => action.payload),
    mergeMap(({ orientationId }) => {
      const search = new HttpParams()
        .set('school_id', this.session.g.get('school').id)
        .set('calendar_id', orientationId.toString());

      return this.service.getSocialGroupDetails(search).pipe(
        map(
          (socialGroups: ISocialGroup[]) => new fromActions.GetSocialGroupsSuccess({ socialGroups })
        ),
        catchError((err) => {
          this.store.dispatch(
            new baseActionClass.SnackbarError({
              body: this.cpI18n.translate('something_went_wrong')
            })
          );
          return of(new fromActions.GetSocialGroupsFail({ error: parseErrorResponse(err.error) }));
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private session: CPSession,
    private cpI18n: CPI18nService,
    private service: LibsCommonMembersService,
    private store: Store<RouterReducerState | fromRoot.ISnackbar>
  ) {}
}
