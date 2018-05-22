import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { DealsService } from '../deals.service';
import { CPSession } from '../../../../../session';
import { StoreService } from '../stores/store.service';
import { CPI18nService } from '../../../../../shared/services';
import { HEADER_UPDATE, IHeader } from '../../../../../reducers/header.reducer';

@Component({
  selector: 'cp-deals-create',
  templateUrl: './deals-create.component.html',
  styleUrls: ['./deals-create.component.scss']
})
export class DealsCreateComponent implements OnInit {
  data;
  error = false;
  buttonData;
  isNewStore;
  errorMessage;
  form: FormGroup;
  storeForm: FormGroup;

  constructor(
    public router: Router,
    public fb: FormBuilder,
    public session: CPSession,
    public service: DealsService,
    public store: Store<IHeader>,
    public cpI18n: CPI18nService,
    public storeService: StoreService
  ) {}

  onSubmit() {
    this.error = false;

    if (this.isNewStore) {
      this.createDealWithNewStore(this.data);
    } else {
      this.createDeal(this.data);
    }
  }

  createDeal(data) {
    const search = new URLSearchParams();
    search.append('school_id', this.session.g.get('school').id);

    this.service
      .createDeal(data.deal, search)
      .subscribe((deal) => this.router.navigate([`/manage/deals/${deal.id}/info`]));
  }

  createDealWithNewStore(data) {
    const search = new URLSearchParams();
    search.append('school_id', this.session.g.get('school').id);

    this.storeService
      .createStore(data.store, search)
      .switchMap((store) => {
        data.deal.store_id = store.id;

        return this.service.createDeal(data.deal, search);
      })
      .subscribe(
        (deal) => this.router.navigate([`/manage/deals/${deal.id}/info`]),
        (_) => {
          this.error = true;
          this.errorMessage = this.cpI18n.translate('something_went_wrong');
        }
      );
  }

  buildHeader() {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: {
        heading: `t_deals_form_heading_create_deal`,
        subheading: null,
        em: null,
        children: []
      }
    });
  }

  buildStoreForm() {
    this.storeForm = this.fb.group({
      name: [null],
      city: [null],
      province: [null],
      country: [null],
      postal_code: [null],
      website: [null],
      address: [null],
      latitude: [null],
      longitude: [null],
      logo_url: [null],
      description: [null]
    });
  }

  formData(data) {
    this.data = data;
    const isFormValid = data.dealFormValid && data.storeFormValid;
    this.buttonData = Object.assign({}, this.buttonData, { disabled: !isFormValid });
  }

  onToggleStore(value) {
    this.isNewStore = value;
  }

  buildForm() {
    this.form = this.fb.group({
      title: [null, [Validators.required, Validators.maxLength(120)]],
      store_id: [null, Validators.required],
      image_url: [null, Validators.required],
      image_thumb_url: [null],
      description: [null],
      start: [null],
      expiration: [null],
    });
  }

  ngOnInit() {
    this.buildForm();
    this.buildHeader();
    this.buildStoreForm();

    this.buttonData = {
      disabled: true,
      class: 'primary',
      text: this.cpI18n.translate('save')
    };
  }
}
