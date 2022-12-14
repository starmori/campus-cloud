import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { get as _get } from 'lodash';

import { ILocation } from './locations.interface';
import { CustomValidators } from '@campus-cloud/shared/validators';

export class LocationModel {
  static form(location?: ILocation) {
    const fb = new FormBuilder();

    const _location = {
      city: location ? location.city : null,
      name: location ? location.name : null,
      phone: location ? location.phone : null,
      email: location ? location.email : null,
      country: location ? location.country : null,
      address: location ? location.address : null,
      province: location ? location.province : null,
      latitude: location ? location.latitude : null,
      longitude: location ? location.longitude : null,
      image_url: location ? location.image_url : null,
      short_name: location ? location.short_name : null,
      description: location ? location.description : null,
      postal_code: location ? location.postal_code : null,
      category_id: location ? location.category_id : null
    };

    return fb.group({
      city: [_location.city],
      phone: [_location.phone],
      email: [_location.email],
      country: [_location.country],
      address: [_location.address],
      province: [_location.province],
      image_url: [_location.image_url],
      short_name: [_location.short_name],
      postal_code: [_location.postal_code],
      description: [_location.description],
      name: [
        _location.name,
        Validators.compose([Validators.required, CustomValidators.requiredNonEmpty])
      ],
      latitude: [_location.latitude, { updateOn: 'blur' }],
      longitude: [_location.longitude, { updateOn: 'blur' }],
      category_id: [_location.category_id, Validators.required],
      links: fb.array([this.setLinks(location)]),
      schedule: fb.array([])
    });
  }

  static setLinks(locations) {
    const fb = new FormBuilder();
    const links = _get(locations, 'links', []);

    return fb.group(
      {
        url: [links.length ? links[0]['url'] : ''],
        label: [links.length ? links[0]['label'] : '']
      },
      { validator: this.customLinksValidator }
    );
  }

  static customLinksValidator(controls: FormGroup): ValidationErrors | null {
    const url = controls.get('url').value.trim();
    const label = controls.get('label').value.trim();

    if (url && !label) {
      return { labelRequired: true };
    }

    if (label && !url) {
      return { urlRequired: true };
    }

    return null;
  }
}
