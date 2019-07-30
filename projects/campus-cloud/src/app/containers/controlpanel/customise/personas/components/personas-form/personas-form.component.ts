import { PersonasType, PersonasLoginRequired } from './../../personas.status';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PersonasUtilsService } from '../../personas.utils.service';

@Component({
  selector: 'cp-personas-form',
  templateUrl: './personas-form.component.html',
  styleUrls: ['./personas-form.component.scss']
})
export class PersonasFormComponent implements OnInit {
  @Input() isEdit = false;
  @Input() form: FormGroup;

  @Output() valueChanges: EventEmitter<FormGroup> = new EventEmitter();

  platformMenu;
  selectedPlatform = null;
  requiresCredentialsMenu;
  mobileType = PersonasType.mobile;
  selectedRequiresCredentials = null;
  loginRequired = PersonasLoginRequired.required;

  constructor(public utils: PersonasUtilsService) {}

  togglePretour(value) {
    this.form.get('pretour_enabled').setValue(value);
  }

  onPlatformChange({ id }) {
    const loginRequirement =
      id === PersonasType.web ? PersonasLoginRequired.forbidden : PersonasLoginRequired.optional;

    this.form.get('platform').setValue(id);
    this.form.get('login_requirement').setValue(loginRequirement);

    this.setDefaultRequiresCredentials();
  }

  onRequireCredentialsChange({ id }) {
    this.form.get('login_requirement').setValue(id);
  }

  setDefaultPlatform() {
    this.selectedPlatform = this.platformMenu.find(
      (option) => option.id === this.form.value.platform
    );
  }

  setDefaultRequiresCredentials() {
    this.selectedRequiresCredentials = {
      ...this.requiresCredentialsMenu.find(
        (option) => option.id === this.form.value.login_requirement
      )
    };
  }

  ngOnInit(): void {
    this.platformMenu = this.utils.plaftormMenu();
    this.requiresCredentialsMenu = this.utils.requiresCredentialsMenu();

    if (this.form.value.name) {
      this.setDefaultPlatform();
      this.setDefaultRequiresCredentials();
    }

    this.form.valueChanges.subscribe((_) => this.valueChanges.emit(this.form));
  }
}