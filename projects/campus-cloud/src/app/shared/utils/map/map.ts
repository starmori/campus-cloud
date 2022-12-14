import { FormGroup } from '@angular/forms';

interface ILocation {
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
  postal_code: string;
  location?: string;
}

interface ICPMap {
  city: string;
  country: string;
  street_name: string;
  postal_code: string;
  street_number: string;
  province: string;
  latitude: number;
  longitude: number;
}
const map = {
  city: 'locality',
  country: 'country',
  street_name: 'route',
  postal_code: 'postal_code',
  street_number: 'street_number',
  province: 'administrative_area_level_1'
};

function locationAsObject(location) {
  const googleCords = location.toJSON();

  return {
    latitude: googleCords.lat,
    longitude: googleCords.lng
  };
}

function getValueFromAddressComponent(addressComp: any[], field: string, long?: boolean) {
  let result = null;

  addressComp.map((data) => {
    data.types.forEach((type) => {
      if (type === field) {
        if (long) {
          result = data.long_name;

          return;
        }
        result = data.short_name;
      }

      return;
    });
  });

  return result;
}

function getBaseMapObject(data) {
  let obj: ICPMap = {
    city: null,
    country: null,
    street_name: null,
    postal_code: null,
    street_number: null,
    province: null,
    latitude: null,
    longitude: null
  };

  if (!data) {
    return {
      city: '',
      name: '',
      country: '',
      street_name: '',
      postal_code: '',
      street_number: '',
      province: '',
      latitude: null,
      longitude: null
    };
  }

  Object.keys(map).map((item) => {
    obj[item] = getValueFromAddressComponent(data.address_components, map[item]);
  });

  obj = Object.assign({}, obj, { ...locationAsObject(data.geometry.location) });

  return obj;
}

const resetLocationFields = () => {
  return {
    city: '',
    province: '',
    country: '',
    address: '',
    location: '',
    postal_code: '',
    latitude: 0,
    longitude: 0
  };
};

const setFormLocationData = (form: FormGroup, location: ILocation) => {
  form.controls['city'].setValue(location.city);
  form.controls['province'].setValue(location.province);
  form.controls['country'].setValue(location.country);
  if (form.controls['location']) {
    form.controls['location'].setValue(location.location);
  }
  form.controls['latitude'].setValue(location.latitude);
  form.controls['longitude'].setValue(location.longitude);
  form.controls['address'].setValue(location.address);
  form.controls['postal_code'].setValue(location.postal_code);

  return form;
};

const canViewLocation = (lat, lng, school) => {
  return lat !== 0 && lng !== 0 && lat !== school.latitude && lng !== school.longitude;
};

const setDefaultMapCenter = (lat, lng, school) => {
  return {
    lat: lat === 0 ? school.latitude : lat,
    lng: lng === 0 ? school.longitude : lng
  };
};

export const CPMap = {
  canViewLocation,
  locationAsObject,
  getBaseMapObject,
  setFormLocationData,
  setDefaultMapCenter,
  resetLocationFields,
  getValueFromAddressComponent
};
