import { OnInit, Component, OnDestroy, AfterViewInit } from '@angular/core';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import * as fromRoot from '@campus-cloud/store';
import { baseActions } from '@campus-cloud/store/base';
import { IItem } from '@campus-cloud/shared/components';
import * as fromCategoryStore from '../categories/store';
import { CPSession, ISchool } from '@campus-cloud/session';
import { CPI18nService } from '@campus-cloud/shared/services';
import { LatLngValidators } from '@campus-cloud/shared/validators';
import { LocationModel } from '@campus-cloud/libs/locations/common/model';
import { ICategory } from '@campus-cloud/libs/locations/common/categories/model';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';

@Component({
  selector: 'cp-locations-create',
  templateUrl: './locations-create.component.html',
  styleUrls: ['./locations-create.component.scss']
})
export class LocationsCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  school: ISchool;
  formErrors: boolean;
  openingHours = true;
  errorMessage: string;
  buttonDisabled = false;
  locationForm: FormGroup;
  categories$: Observable<IItem[]>;

  private destroy$ = new Subject();

  constructor(
    public router: Router,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public latLng: LatLngValidators,
    public store: Store<
      fromStore.ILocationsState | fromCategoryStore.ICategoriesState | fromRoot.IHeader
    >
  ) {}

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

    const payload = {
      body
    };

    this.store.dispatch(new fromStore.PostLocation(payload));
  }

  buildHeader() {
    const payload = {
      heading: 't_locations_create_location',
      subheading: null,
      em: null,
      children: []
    };

    Promise.resolve().then(() => {
      this.store.dispatch({
        type: fromRoot.baseActions.HEADER_UPDATE,
        payload
      });
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
    this.router.navigate(['/manage/locations']);
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

  loadCategories() {
    const categoryLabel = this.cpI18n.translate('select_category');
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

  ngOnInit() {
    this.setErrors();
    this.buildHeader();
    this.loadCategories();
    this.school = this.session.g.get('school');

    this.locationForm = LocationModel.form();
    LocationsUtilsService.setScheduleFormControls(this.locationForm);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    const lat = this.locationForm.get('latitude');
    const lng = this.locationForm.get('longitude');

    lat.setValue(this.school.latitude);
    lng.setValue(this.school.longitude);

    lat.setAsyncValidators([this.latLng.validateLatitude(lng)]);
    lng.setAsyncValidators([this.latLng.validateLongitude(lat)]);
  }
}
