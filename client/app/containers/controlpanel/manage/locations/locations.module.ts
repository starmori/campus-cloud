import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';

import { reducers, effects } from './store';
import { LocationExistsGuard } from './guards';
import { LocationsInfoComponent } from './info';
import { LocationsListComponent } from './list';
import { LocationsEditComponent } from './edit';
import { LocationsDeleteComponent } from './delete';
import { LocationsCreateComponent } from './create';
import { SharedModule } from '@shared/shared.module';
import { LocationsService } from './locations.service';
import { LayoutsModule } from '@app/layouts/layouts.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsRoutingModule } from './locations.routing.module';
import { LocationsUtilsService } from '@libs/locations/common/utils';
import { LocationsTimeLabelPipe } from '@libs/locations/common/pipes';
import { CommonLocationsModule } from '@libs/locations/common/common-locations.module';

@NgModule({
  declarations: [
    LocationsListComponent,
    LocationsInfoComponent,
    LocationsEditComponent,
    LocationsTimeLabelPipe,
    LocationsDeleteComponent,
    LocationsCreateComponent
  ],

  imports: [
    CommonModule,
    SharedModule,
    LayoutsModule,
    CategoriesModule,
    ReactiveFormsModule,
    CommonLocationsModule,
    LocationsRoutingModule,
    EffectsModule.forFeature(effects),
    StoreModule.forFeature('locations', reducers)
  ],

  providers: [LocationsService, LocationExistsGuard, LocationsUtilsService, LocationsTimeLabelPipe]
})
export class LocationsModule {}
