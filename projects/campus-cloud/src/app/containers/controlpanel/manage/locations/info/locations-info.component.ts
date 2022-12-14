import { OnInit, Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map, filter, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import * as fromRoot from '@campus-cloud/store';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { ILocation } from '@campus-cloud/libs/locations/common/model';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';

@Mixin([Destroyable])
@Component({
  selector: 'cp-locations-info',
  templateUrl: './locations-info.component.html',
  styleUrls: ['./locations-info.component.scss']
})
export class LocationsInfoComponent implements OnInit, OnDestroy, Destroyable {
  loading$;
  hasMetaData;
  openingHours;
  resourceBanner;
  draggable = false;
  location: ILocation;
  mapCenter: BehaviorSubject<any>;

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public locationUtils: LocationsUtilsService,
    public store: Store<fromStore.ILocationsState | fromRoot.IHeader>
  ) {}

  buildHeader(location: ILocation) {
    Promise.resolve().then(() => {
      this.store.dispatch({
        type: fromRoot.baseActions.HEADER_UPDATE,
        payload: {
          heading: `[NOTRANSLATE]${location.name}[NOTRANSLATE]`,
          subheading: null,
          em: null,
          children: [],
          crumbs: {
            label: 'locations',
            url: '/manage/locations'
          }
        }
      });
    });
  }

  loadLocationDetail() {
    this.store
      .select(fromStore.getLocationsById(this.route.snapshot.params['locationId']))
      .pipe(
        takeUntil(this.destroy$),
        filter((location: ILocation) => !!location),
        map((location: ILocation) => {
          this.location = location;
          this.buildHeader(location);

          this.resourceBanner = {
            heading: location.name,
            image: location.image_url,
            subheading: location.category_name
          };

          this.mapCenter = new BehaviorSubject({
            lat: location.latitude,
            lng: location.longitude
          });

          const hasLinks = location.links.length
            ? location.links[0].label || location.links[0].url
            : false;

          this.hasMetaData = Boolean(location.short_name || location.description || hasLinks);

          if (location.schedule.length) {
            this.openingHours = this.locationUtils.parsedSchedule(location.schedule);
          }
        })
      )
      .subscribe();
  }

  onEditClick() {
    this.router.navigate([`/manage/locations/${this.location.id}/edit`]);
  }

  ngOnInit() {
    this.loading$ = this.store.select(fromStore.getLocationsLoading);

    this.loadLocationDetail();
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
