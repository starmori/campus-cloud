import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { CPSession } from '@campus-cloud/session';
import { CPI18nService } from '@campus-cloud/shared/services';
import { ApiManagementUtilsService } from '../../api-management.utils.service';
import { PublicApiAccessTokenModel, IPublicApiAccessToken } from '../../model';
import { ApiType } from '@controlpanel/api-management/model/api-management.interface';

@Component({
  selector: 'cp-api-form',
  templateUrl: './api-management-form.component.html',
  styleUrls: ['./api-management-form.component.scss']
})
export class ApiManagementFormComponent implements OnInit {
  buttonData;
  form: FormGroup;

  @Input() formData: IPublicApiAccessToken;

  @Output() submitted: EventEmitter<IPublicApiAccessToken> = new EventEmitter();

  apiType = ApiType;
  formErrors = false;
  isSandbox: boolean;

  constructor(public session: CPSession, private cpI18n: CPI18nService) {}

  onTogglePermission(value, type) {
    const tokenPermissionData = this.form.get('permission_data').value;
    const permissions = ApiManagementUtilsService.getTokenPermission(
      value,
      type,
      tokenPermissionData
    );
    this.form
      .get('permission_data')
      .setValue(ApiManagementUtilsService.getPermissionData(permissions));
  }

  onSave() {
    this.formErrors = false;
    if (this.form.invalid) {
      this.formErrors = true;
      this.enableSubmitButton();

      return;
    }

    this.submitted.emit(this.form.value);
  }

  enableSubmitButton() {
    this.buttonData = {
      ...this.buttonData,
      disabled: false
    };
  }

  ngOnInit() {
    const { is_sandbox, client_id } = this.session.g.get('school');

    this.form = PublicApiAccessTokenModel.form(this.formData);
    this.form.get('client_id').setValue(client_id);
    this.form.get('is_sandbox').setValue(is_sandbox);

    this.isSandbox = is_sandbox;

    this.buttonData = {
      text: this.cpI18n.translate('t_api_management_generate_key'),
      class: 'primary'
    };
  }
}
