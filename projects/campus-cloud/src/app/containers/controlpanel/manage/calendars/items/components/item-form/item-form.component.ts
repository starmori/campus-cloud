import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { CPSession } from '@campus-cloud/session';
import { CPDate, CPMap } from '@campus-cloud/shared/utils';
import { CPI18nService } from '@campus-cloud/shared/services';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { CalendarsItemsService } from '../../item.utils.service';

const FORMAT_WITH_TIME = 'F j, Y h:i K';
const FORMAT_WITHOUT_TIME = 'F j, Y';

const COMMON_DATE_PICKER_OPTIONS = {
  // utc: true,
  enableTime: true
};

@Component({
  selector: 'cp-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class CalendarsItemFormComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() isEdit: boolean;
  @Input() calendarId: number;
  @Output() submitted: EventEmitter<any> = new EventEmitter();
  @Output() amplitudeLocationStatus: EventEmitter<string> = new EventEmitter();

  formError;
  mapCenter;
  buttonData;
  enddatePickerOpts;
  startdatePickerOpts;
  showLocationDetails = true;
  drawMarker = new BehaviorSubject(false);
  newAddress = new BehaviorSubject(null);

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public utils: CalendarsItemsService
  ) {}

  toggleDatePickerTime(checked) {
    const dateFormat = checked ? FORMAT_WITHOUT_TIME : FORMAT_WITH_TIME;

    this.startdatePickerOpts = {
      ...this.startdatePickerOpts,
      enableTime: !checked,
      dateFormat: dateFormat
    };

    this.enddatePickerOpts = {
      ...this.enddatePickerOpts,
      enableTime: !checked,
      dateFormat: dateFormat
    };
  }

  onUploadedImage(image) {
    this.form.get('poster_url').setValue(image);
    this.form.get('poster_thumb_url').setValue(image);
  }

  updateTime() {
    const startDateAtMidnight = CPDate.fromEpoch(
      this.form.controls['start'].value,
      this.session.tz
    ).startOf('day');

    const endDateAtMidnight = CPDate.fromEpoch(
      this.form.controls['end'].value,
      this.session.tz
    ).endOf('day');

    this.form.controls['start'].setValue(CPDate.toEpoch(startDateAtMidnight, this.session.tz));
    this.form.controls['end'].setValue(CPDate.toEpoch(endDateAtMidnight, this.session.tz));
  }

  onAllDayToggle(checked: boolean) {
    this.toggleDatePickerTime(checked);
    this.form.controls['is_all_day'].setValue(checked);
  }

  onResetMap() {
    this.drawMarker.next(false);

    const school = this.session.g.get('school');

    this.amplitudeLocationStatus.emit(amplitudeEvents.REMOVED_LOCATION);

    CPMap.setFormLocationData(this.form, CPMap.resetLocationFields());
    this.centerMap(school.latitude, school.longitude);
  }

  onMapSelection(data) {
    const cpMap = CPMap.getBaseMapObject(data);

    const location = { ...cpMap, address: data.formatted_address };

    CPMap.setFormLocationData(this.form, location);

    this.newAddress.next(this.form.controls['address'].value);
  }

  updateWithUserLocation(location) {
    location = Object.assign({}, location, { location: location.name });

    CPMap.setFormLocationData(this.form, location);

    this.centerMap(location.latitude, location.longitude);
  }

  onPlaceChange(data) {
    if (!data) {
      return;
    }

    this.drawMarker.next(true);

    this.amplitudeLocationStatus.emit(amplitudeEvents.ADDED_LOCATION);

    if ('fromUsersLocations' in data) {
      this.updateWithUserLocation(data);

      return;
    }

    const cpMap = CPMap.getBaseMapObject(data);

    const location = { ...cpMap, address: data.name };
    const coords: google.maps.LatLngLiteral = data.geometry.location.toJSON();

    CPMap.setFormLocationData(this.form, location);

    /**
     * Calendar Items store the item's address
     * as location unlike other resources...
     */
    this.form.controls['location'].setValue(data.name);

    this.centerMap(coords.lat, coords.lng);
  }

  centerMap(lat: number, lng: number) {
    return this.mapCenter.next({ lat, lng });
  }

  enableButton() {
    this.buttonData = { ...this.buttonData, disabled: false };
  }

  onLocationToggle(value) {
    this.showLocationDetails = value;
    const requiredValidator = value ? [Validators.required] : null;
    this.form.get('location').setValidators(requiredValidator);
    this.form.get('location').updateValueAndValidity();

    if (!value) {
      this.drawMarker.next(false);

      this.mapCenter = new BehaviorSubject({
        lat: this.session.g.get('school').latitude,
        lng: this.session.g.get('school').longitude
      });

      this.amplitudeLocationStatus.emit(amplitudeEvents.REMOVED_LOCATION);
      CPMap.setFormLocationData(this.form, CPMap.resetLocationFields());
    }
  }

  onSubmit() {
    this.formError = false;

    const valid = this.utils.validate(this.form);
    if (!valid) {
      this.enableButton();
      this.formError = true;

      return;
    }

    if (this.form.controls['is_all_day'].value) {
      this.updateTime();
    }

    this.submitted.emit(this.form.value);
  }

  setStart(date) {
    this.form.controls['start'].setValue(CPDate.toEpoch(date, this.session.tz));
  }

  setEnd(date) {
    this.form.controls['end'].setValue(CPDate.toEpoch(date, this.session.tz));
  }

  setLocationVisibility(lat, lng) {
    if (!this.isEdit) {
      return;
    }

    const address = this.form.get('location');
    if (!address.value) {
      address.setValidators(null);
      address.updateValueAndValidity();
    }

    this.showLocationDetails = CPMap.canViewLocation(lat, lng, this.session.g.get('school'));
  }

  ngOnInit() {
    const _self = this;
    const lat = this.form.controls['latitude'].value;
    const lng = this.form.controls['longitude'].value;

    this.setLocationVisibility(lat, lng);
    this.drawMarker.next(this.showLocationDetails);
    this.mapCenter = new BehaviorSubject(
      CPMap.setDefaultMapCenter(lat, lng, this.session.g.get('school'))
    );

    this.startdatePickerOpts = {
      ...COMMON_DATE_PICKER_OPTIONS
    };

    if (this.form.controls['start'].value) {
      this.startdatePickerOpts = {
        ...this.startdatePickerOpts,
        defaultDate: CPDate.fromEpochLocal(
          this.form.controls['start'].value,
          _self.session.tz
        ).format()
      };
    }

    this.enddatePickerOpts = {
      ...COMMON_DATE_PICKER_OPTIONS
    };

    if (this.form.controls['end'].value) {
      this.enddatePickerOpts = {
        ...this.enddatePickerOpts,
        defaultDate: CPDate.fromEpochLocal(
          this.form.controls['end'].value,
          _self.session.tz
        ).format()
      };
    }

    const submitEdit = this.cpI18n.translate('save');
    const submitCreate = this.cpI18n.translate('calendars_form_submit_button_new');
    const isEditForm = this.form.controls['title'].value !== null;

    this.buttonData = {
      class: 'primary',
      text: isEditForm ? submitEdit : submitCreate
    };
  }
}
