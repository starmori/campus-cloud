import { OnInit, Component, OnDestroy, AfterViewInit } from '@angular/core';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import * as fromRoot from '@campus-cloud/store';
import { BaseComponent } from '@campus-cloud/base';
import { IItem } from '@campus-cloud/shared/components';
import { baseActions } from '@campus-cloud/store/base';
import { CPI18nService } from '@campus-cloud/shared/services';
import { CPSession, ISchool } from '@campus-cloud/session';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { LatLngValidators } from '@campus-cloud/shared/validators';
import * as fromCategoryStore from '../categories/store';
import { LocationType } from '@campus-cloud/libs/locations/common/utils';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';
import { LocationModel, ILocation } from '@campus-cloud/libs/locations/common/model';
import {
  ICategory,
  LocationCategoryLocale
} from '@campus-cloud/libs/locations/common/categories/model';

@Component({
  selector: 'cp-locations-edit',
  templateUrl: './locations-edit.component.html',
  styleUrls: ['./locations-edit.component.scss']
})
export class LocationsEditComponent extends BaseComponent
  implements OnInit, OnDestroy, AfterViewInit {
  school: ISchool;
  formErrors: boolean;
  locationId: number;
  categoryId: number;
  errorMessage: string;
  openingHours = false;
  buttonDisabled = false;
  locationForm: FormGroup;
  selectedCategory: IItem;
  loading$: Observable<boolean>;
  categories$: Observable<IItem[]>;
  updatedCategory = amplitudeEvents.NO;

  private destroy$ = new Subject();

  constructor(
    public router: Router,
    public session: CPSession,
    public cpI18n: CPI18nService,
    private route: ActivatedRoute,
    public latLng: LatLngValidators,
    public store: Store<
      fromStore.ILocationsState | fromCategoryStore.ICategoriesState | fromRoot.IHeader
    >
  ) {
    super();
  }

  doSubmit() {
    this.formErrors = false;
    this.buttonDisabled = true;

    if (!this.locationForm.valid) {
      this.formErrors = true;
      this.buttonDisabled = false;

      this.handleWarning();

      return;
    }

    const body = this.locationForm.value;
    body['schedule'] = LocationsUtilsService.filteredScheduleControls(
      this.locationForm,
      this.openingHours
    );

    const locationId = this.locationId;
    const school_id = this.session.g.get('school').id;
    const params = new HttpParams().append('school_id', school_id);

    const payload = {
      body,
      params,
      locationId,
      categoryId: this.categoryId,
      updatedCategory: this.updatedCategory
    };

    this.store.dispatch(new fromStore.EditLocation(payload));
  }

  buildHeader() {
    this.store.dispatch({
      type: fromRoot.baseActions.HEADER_UPDATE,
      payload: {
        heading: `t_locations_edit_location`,
        subheading: null,
        em: null,
        children: []
      }
    });
  }

  setErrors() {
    this.store
      .select(fromStore.getLocationsError)
      .pipe(
        takeUntil(this.destroy$),
        filter((error) => error),
        tap(() => {
          this.formErrors = true;
          this.buttonDisabled = false;
          const errorMessage = this.cpI18n.translate('something_went_wrong');

          this.handleError(errorMessage);
        })
      )
      .subscribe();
  }

  onCancel() {
    this.store.dispatch(new fromStore.ResetError());
    this.router.navigate([`/manage/locations/${this.locationId}/info`]);
  }

  handleError(body) {
    const options = {
      body,
      class: 'danger'
    };
    this.dispatchSnackBar(options);
  }

  handleWarning() {
    const options = {
      class: 'warning',
      body: this.cpI18n.translate('error_fill_out_marked_fields')
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

  loadLocation() {
    this.store
      .select(fromStore.getLocationsById(this.route.snapshot.params['locationId']))
      .pipe(
        takeUntil(this.destroy$),
        filter((location: ILocation) => !!location),
        map((location: ILocation) => {
          const schedule = location['schedule'];
          this.openingHours = !!schedule.length;
          this.locationId = location.id;
          this.categoryId = location.category_id;
          this.locationForm = LocationModel.form(location);
          LocationsUtilsService.setScheduleFormControls(this.locationForm, schedule);
        })
      )
      .subscribe();
  }

  loadCategories() {
    const categoryLabel = this.cpI18n.translate('select_category');
    this.categories$ = this.store.select(fromCategoryStore.getCategories).pipe(
      takeUntil(this.destroy$),
      tap((categories: ICategory[]) => {
        if (!categories.length) {
          const locale = CPI18nService.getLocale().startsWith('fr')
            ? LocationCategoryLocale.fr
            : LocationCategoryLocale.eng;

          const params = new HttpParams()
            .set('locale', locale)
            .set('location_type', LocationType.location)
            .set('school_id', this.session.g.get('school').id);

          this.store.dispatch(new fromCategoryStore.GetCategories({ params }));
        }
      }),
      map((categories) => LocationsUtilsService.setCategoriesDropDown(categories, categoryLabel)),
      map((parsedCategories) => {
        Promise.resolve().then(() => {
          this.selectedCategory = parsedCategories.find((c) => c.action === this.categoryId);
        });

        return parsedCategories;
      })
    );
  }

  onChangeCategory() {
    this.updatedCategory = amplitudeEvents.YES;
  }

  ngOnInit() {
    this.setErrors();
    this.buildHeader();
    this.loadLocation();
    this.loadCategories();
    this.school = this.session.g.get('school');
    this.loading$ = this.store.select(fromStore.getLocationsLoading);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    const lat = this.locationForm.get('latitude');
    const lng = this.locationForm.get('longitude');
    lat.setAsyncValidators([this.latLng.validateLatitude(lng)]);
    lng.setAsyncValidators([this.latLng.validateLongitude(lat)]);
  }
}