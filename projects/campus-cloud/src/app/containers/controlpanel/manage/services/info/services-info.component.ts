import { Component, Input, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';

import { IService } from '../service.interface';
import { ISnackbar } from '@campus-cloud/store';
import { CPSession } from '@campus-cloud/session';
import { ServicesService } from '../services.service';
import { baseActionClass } from '@campus-cloud/store/base';
import { LayoutWidth } from '@campus-cloud/layouts/interfaces';
import { ServicesUtilsService } from '../services.utils.service';
import { BaseComponent } from '@campus-cloud/base/base.component';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { AdminService, CPI18nService, IAdmin } from '@campus-cloud/shared/services';
import { IResourceBanner } from '@campus-cloud/shared/components/cp-resource-banner';

@Component({
  selector: 'cp-services-info',
  templateUrl: './services-info.component.html',
  styleUrls: ['./services-info.component.scss']
})
export class ServicesInfoComponent extends BaseComponent implements OnInit {
  @Input() resourceBanner: IResourceBanner;

  service;
  storeId;
  loading = true;
  admins: IAdmin[];
  serviceId: number;
  draggable = false;
  showLocationDetails = true;
  mapCenter: BehaviorSubject<any>;
  layoutWidth = LayoutWidth.third;

  constructor(
    private session: CPSession,
    private cpI18n: CPI18nService,
    private route: ActivatedRoute,
    private store: Store<ISnackbar>,
    public adminService: AdminService,
    private utils: ServicesUtilsService,
    private serviceService: ServicesService
  ) {
    super();
    super.isLoading().subscribe((res) => (this.loading = res));
    this.serviceId = this.route.snapshot.params['serviceId'];
  }

  private fetch() {
    const service$ = this.serviceService.getServiceById(this.serviceId);

    const stream$ = service$.pipe(
      switchMap((serviceResponse: IService) => {
        this.service = serviceResponse;
        this.storeId = this.service.store_id;
        const { id } = this.session.school;
        const search: HttpParams = new HttpParams()
          .append('school_id', id.toString())
          .append('store_id', this.storeId.toString())
          .append('privilege_type', CP_PRIVILEGES_MAP.services.toString());

        return this.adminService
          .getAdminByStoreId(search)
          .pipe(map((admins: IAdmin[]) => admins.filter((admin) => !admin.is_school_level)));
      })
    );

    super.fetchData(stream$).then(
      (admins) => {
        this.admins = admins.data;

        this.utils.buildServiceHeader(this.service);

        this.showLocationDetails = this.service.latitude !== 0 && this.service.longitude !== 0;
        this.mapCenter = new BehaviorSubject({
          lat: this.service.latitude,
          lng: this.service.longitude
        });

        this.resourceBanner = {
          image: this.service.logo_url,
          heading: this.service.name
        };
      },
      () => this.handleError()
    );
  }

  handleError() {
    this.store.dispatch(
      new baseActionClass.SnackbarError({
        body: this.cpI18n.translate('something_went_wrong')
      })
    );
  }

  ngOnInit() {
    this.fetch();
  }
}
