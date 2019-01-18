import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { API } from '@app/config/api';
import { CategoryModel } from './model';
import { IItem } from '@shared/components';
import { HTTPService } from '@app/base/http.service';

@Injectable()
export class CategoriesService extends HTTPService {
  constructor(http: HttpClient, router: Router) {
    super(http, router);

    Object.setPrototypeOf(this, CategoriesService.prototype);
  }

  getCategories(search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${
      API.ENDPOINTS.LOCATIONS_CATEGORIES}/`;

    return super.get(url, search);
  }

  getCategoriesType(search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${
      API.ENDPOINTS.LOCATION_CATEGORY_TYPE}/`;

    return <Observable<IItem[]>>super
      .get(url, search).pipe(map(CategoryModel.setCategoryTypes));
  }

  createCategory(body, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${
      API.ENDPOINTS.LOCATIONS_CATEGORIES}/`;

    return super.post(url, body, search);
  }

  updateCategory(body, categoryId: number, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${
      API.ENDPOINTS.LOCATIONS_CATEGORIES}/${categoryId}`;

    return super.update(url, body, search);
  }

  deleteCategoryById(categoryId: number, search: HttpParams) {
    const url = `${API.BASE_URL}/${API.VERSION.V1}/${
      API.ENDPOINTS.LOCATIONS_CATEGORIES}/${categoryId}`;

    return super.delete(url, search);
  }
}