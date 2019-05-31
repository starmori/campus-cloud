import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Input, OnInit, Output, Component, EventEmitter } from '@angular/core';
import { get as _get } from 'lodash';

import {
  IExternalAppOpenLinkParams,
  IExternalAppOpenFormDetails
} from './external-app-open.interface';
import { CampusLink } from '@controlpanel/manage/links/tile';

@Component({
  selector: 'cp-personas-resource-external-app-open',
  templateUrl: './resource-external-app-open.component.html',
  styleUrls: ['./resource-external-app-open.component.scss']
})
export class PersonasResourceExternalAppOpenComponent implements OnInit {
  @Input() params: IExternalAppOpenLinkParams | {};

  @Output() selected: EventEmitter<IExternalAppOpenFormDetails | { meta: {} }> = new EventEmitter();

  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  validateIOS(control: FormControl) {
    const httpUrl = control.get('app_link').value.trim();
    const storeUrl = control.get('fallback_http_url').value.trim();

    return !httpUrl && !storeUrl ? { requiredField: true } : null;
  }

  getForm(params?: any): FormGroup {
    const ios = _get(params, 'ios', false);
    const android = _get(params, 'android', false);

    const _linkParams = {
      android: {
        fallback_http_url: android ? params.android.fallback_http_url : '',
        package_name: android ? params.android.package_name : ''
      },
      ios: {
        fallback_http_url: ios ? params.ios.fallback_http_url : '',
        app_link: ios ? params.ios.app_link : ''
      }
    };

    const form = this.fb.group({
      android: this.fb.group({
        fallback_http_url: [_linkParams.android.fallback_http_url, Validators.required],
        package_name: [_linkParams.android.package_name, Validators.required]
      }),
      ios: this.fb.group(
        {
          fallback_http_url: [_linkParams.ios.fallback_http_url],
          app_link: [_linkParams.ios.app_link]
        },
        { validators: this.validateIOS }
      )
    });

    return form;
  }

  ngOnInit() {
    this.form = this.getForm(this.params);
    this.form.valueChanges.subscribe(() => {
      const tooBig = JSON.stringify(this.form.value).length > 1024;
      const data =
        this.form.invalid || tooBig
          ? { meta: {} }
          : {
              link_type: 4,
              meta: {
                is_system: 1,
                link_params: this.form.value,
                open_in_browser: 0,
                link_url: CampusLink.appOpen
              }
            };
      this.selected.emit(data);
    });
  }
}