import { takeUntil, filter, tap, take } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import * as fromRoot from '@app/store';
import { CPSession } from '@app/session';
import { IItem } from '@shared/components';
import { Locale } from '../categories.status';
import { baseActions } from '@app/store/base';
import { CPI18nService } from '@shared/services';
import { ICategory, DeleteError } from '../model';

interface IState {
  search_str: string;
  sort_field: string;
  sort_direction: string;
}

const state: IState = {
  search_str: null,
  sort_field: 'name',
  sort_direction: 'asc'
};

@Component({
  selector: 'cp-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent implements OnInit, OnDestroy {
  state: IState = state;
  showEditModal = false;
  showCreateModal = false;
  showDeleteModal = false;
  loading$: Observable<boolean>;
  deletedCategory: ICategory = null;
  selectedCategory: ICategory = null;
  categories$: Observable<ICategory[]>;

  private destroy$ = new Subject();

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public store: Store<fromStore.ICategoriesState | fromRoot.IHeader | fromRoot.ISnackbar>
  ) {}

  onSearch(search_str) {
    this.state = {
      ...this.state,
      search_str
    };

    this.fetch();
  }

  doSort(sort_field) {
    this.state = {
      ...this.state,
      sort_field: sort_field,
      sort_direction: this.state.sort_direction === 'asc' ? 'desc' : 'asc'
    };

    this.fetch();
  }

  onLaunchCreateModal() {
    this.showCreateModal = true;

    setTimeout(() => $('#categoriesCreate').modal());
  }

  onLaunchEditModal(category: ICategory) {
    this.showEditModal = true;
    this.selectedCategory = category;

    setTimeout(() => $('#categoriesEdit').modal());
  }

  onLaunchDeleteModal(category: ICategory) {
    this.showDeleteModal = true;
    this.deletedCategory = category;

    setTimeout(() => $('#categoryDelete').modal());
  }

  onCreateTeardown() {
    this.showCreateModal = false;
    $('#categoriesCreate').modal('hide');
  }

  onEditTeardown() {
    this.selectedCategory = null;
    this.showEditModal = false;
    $('#categoriesEdit').modal('hide');
  }

  onDeleteTeardown() {
    this.deletedCategory = null;
    this.showDeleteModal = false;
    $('#categoryDelete').modal('hide');
  }

  get defaultParams(): HttpParams {
    const locale = CPI18nService.getLocale().startsWith('fr')
      ? Locale.fr : Locale.eng;

    return new HttpParams()
      .set('locale', locale)
      .set('school_id', this.session.g.get('school').id);
  }

  fetch() {
    const params = this.defaultParams
      .append('search_str', this.state.search_str)
      .append('sort_field', this.state.sort_field)
      .append('sort_direction', this.state.sort_direction);

    this.store.dispatch(new fromStore.GetCategories({ params }));
  }

  updateHeader() {
    this.store.dispatch({
      type: fromRoot.baseActions.HEADER_UPDATE,
      payload: {
        heading: 't_locations_manage_categories',
        subheading: null,
        em: null,
        crumbs: {
          url: 'locations',
          label: 'locations'
        },
        children: []
      }
    });
  }

  loadCategories() {
    this.store
      .select(fromStore.getCategoriesLoaded)
      .pipe(
        tap((loaded: boolean) => {
          if (!loaded) {
            this.fetch();
          }
        }),
        take(1)
      )
      .subscribe();

    this.categories$ = this.store.select(fromStore.getCategories);
  }

  loadCategoryTypes() {
    this.store
      .select(fromStore.getCategoriesType)
      .pipe(
        takeUntil(this.destroy$),
        tap((types: IItem[]) => {
          if (!types.length) {
            const params = this.defaultParams;

            this.store.dispatch(new fromStore.GetCategoriesType({ params }));
          }
        })
      ).subscribe();
  }

  listenForErrors() {
    this.store
      .select(fromStore.getCategoriesErrorMessage)
      .pipe(
        takeUntil(this.destroy$),
        filter((error) => !!error),
        tap((err) => {
          const body = DeleteError[err];

          this.handleError(body);
        })
      )
      .subscribe();
  }

  resetErrors() {
    this.store.dispatch(new fromStore.ResetErrorMessage());
  }

  handleError(message) {
    const errorMessage = message ? message : 'something_went_wrong';

    const options = {
      class: 'danger',
      body: this.cpI18n.translate(errorMessage)
    };

    this.dispatchSnackBar(options);
  }

  dispatchSnackBar(options) {
    this.store.dispatch({
      type: baseActions.SNACKBAR_SHOW,
      payload: {
        ...options,
        sticky: true,
        autoClose: true
      }
    });
  }

  ngOnInit() {
    this.resetErrors();
    this.updateHeader();
    this.loadCategories();
    this.listenForErrors();
    this.loadCategoryTypes();

    this.loading$ = this.store
      .select(fromStore.getCategoriesLoading)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
