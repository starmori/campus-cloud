import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// import { API } from '../../../config/api';
import { BaseService } from '../../../base/base.service';


@Injectable()
export class AccountService extends BaseService {
  constructor(http: Http) {
    super(http);

    Object.setPrototypeOf(this, AccountService.prototype);
  }

  resetPassword(currentPassword: string, newPassword: string) {
    return Promise.resolve({currentPassword, newPassword});
    // const url = `${API.BASE_URL}/${API.VERSION.V1}/${API.ENDPOINTS.EVENT}`;
    // return super.get(url, { search }).map(res => res.json());
  }

}
