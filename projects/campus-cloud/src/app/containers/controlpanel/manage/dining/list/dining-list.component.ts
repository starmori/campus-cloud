import { filter, takeUntil, map, tap, take } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import * as fromRoot from '@campus-cloud/store';
import { CPSession } from '@campus-cloud/session';
import { IItem } from '@campus-cloud/shared/components';
import { ManageHeaderService } from '../../utils';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { IDining } from '@campus-cloud/libs/locations/common/model';
import { BaseComponent } from '@campus-cloud/base/base.component';
import * as fromCategoryStore from '../categories/store';
import { ICategory } from '@campus-cloud/libs/locations/common/categories/model';
import { CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';

interface IState {
  search_str: string;
  sort_field: string;
  category_id: string;
  sort_direction: string;
}

const state: IState = {
  search_str: null,
  category_id: null,
  sort_field: 'name',
  sort_direction: 'asc'
};

@Component({
  selector: 'cp-dining-list',
  templateUrl: './dining-list.component.html',
  styleUrls: ['./dining-list.component.scss']
})
export class DiningListComponent extends BaseComponent implements OnInit, OnDestroy {
  state: IState = state;
  showDeleteModal = false;
  deleteDining: IDining;
  loading$: Observable<boolean>;
  dining$: Observable<IDining[]>;
  categories$: Observable<IItem[]>;

  private destroy$ = new Subject();

  constructor(
    public router: Router,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public cpTracking: CPTrackingService,
    public headerService: ManageHeaderService,
    public store: Store<fromStore.IDiningState>
  ) {
    super();
  }

  fetch() {
    const payload = {
      startRange: this.startRange,
      endRange: this.endRange,
      state: this.state
    };

    this.store.dispatch(new fromStore.GetDining(payload));
  }

  fetchFilteredDining() {
    const payload = {
      startRange: this.startRange,
      endRange: this.endRange,
      state: this.state
    };

    this.store.dispatch(new fromStore.GetFilteredDining(payload));
    this.dining$ = this.getDining(true);
  }

  onPaginationNext() {
    super.goToNext();

    this.fetchFilteredDining();
  }

  onPaginationPrevious() {
    super.goToPrevious();

    this.fetchFilteredDining();
  }

  onSearch(search_str) {
    this.state = {
      ...this.state,
      search_str
    };

    this.resetPagination();

    this.fetchFilteredDining();
  }

  onCategorySelect(category_id) {
    this.state = {
      ...this.state,
      category_id
    };

    this.resetPagination();

    this.fetchFilteredDining();
  }

  onDoSort(sort_field) {
    this.state = {
      ...this.state,
      sort_field: sort_field,
      sort_direction: this.state.sort_direction === 'asc' ? 'desc' : 'asc'
    };

    this.fetchFilteredDining();
  }

  onLaunchDeleteModal(dining: IDining) {
    this.showDeleteModal = true;
    this.deleteDining = dining;

    setTimeout(() => $('#diningDelete').modal({ keyboard: true, focus: true }));
  }

  loadDining() {
    this.store
      .select(fromStore.getDiningLoaded)
      .pipe(
        tap((loaded: boolean) => {
          if (!loaded) {
            this.fetch();
          }
        }),
        take(1)
      )
      .subscribe();

    this.dining$ = this.getDining();
  }

  getDining(isFiltered?: boolean) {
    const selectDining = isFiltered ? fromStore.getFilteredDining : fromStore.getDining;

    return this.store.select(selectDining).pipe(
      map((dining: IDining[]) => {
        const responseCopy = [...dining];

        return super.updatePagination(responseCopy);
      })
    );
  }

  listenForErrors() {
    this.store
      .select(fromStore.getDiningError)
      .pipe(
        takeUntil(this.destroy$),
        filter((error) => error),
        tap(() => {
          const payload = {
            body: this.cpI18n.translate('something_went_wrong'),
            sticky: true,
            autoClose: true,
            class: 'danger'
          };

          this.store.dispatch({
            type: fromRoot.baseActions.SNACKBAR_SHOW,
            payload
          });
        })
      )
      .subscribe();
  }

  loadCategories() {
    const categoryLabel = this.cpI18n.translate('all');
    this.categories$ = this.store.select(fromCategoryStore.getCategories).pipe(
      takeUntil(this.destroy$),
      tap((categories: ICategory[]) => {
        if (!categories.length) {
          this.store.dispatch(new fromCategoryStore.GetCategories());
        }
      }),
      map((res) => LocationsUtilsService.setCategoriesDropDown(res, categoryLabel))
    );
  }

  onCreateClick() {
    this.router.navigate(['/manage/dining/create']);
  }

  onCategoriesClick() {
    const eventName = amplitudeEvents.CLICKED_PAGE_ITEM;
    const eventProperties = {
      ...this.cpTracking.getAmplitudeMenuProperties(),
      page_type: amplitudeEvents.DINING_CATEGORY
    };

    this.cpTracking.amplitudeEmitEvent(eventName, eventProperties);

    this.router.navigate(['/manage/dining/categories']);
  }

  ngOnInit() {
    this.loadDining();
    this.headerService.updateHeader();
    this.loadCategories();
    this.listenForErrors();

    this.loading$ = this.store.select(fromStore.getDiningLoading);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
