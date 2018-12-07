import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';

import { reducers } from './store';
import { effects } from './store/effects';
import { SharedModule } from '@shared/shared.module';
import { ItemsIntegrationEditComponent } from './edit';
import { ItemsIntegrationsListComponent } from './list';
import { ItemsIntegrationsCreateComponent } from './create';
import { ItemsIntegrationsService } from './integrations.service';
import { ItemsIntegrationRoutingModule } from './items-integrations.routing.module';

import { EventsIntegrationsModule } from '@libs/integrations/events/events-integrations.module';

@NgModule({
  declarations: [
    ItemsIntegrationsListComponent,
    ItemsIntegrationsCreateComponent,
    ItemsIntegrationEditComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
    EventsIntegrationsModule,
    ItemsIntegrationRoutingModule,
    EffectsModule.forFeature(effects),
    StoreModule.forFeature('itemsIntegrations', reducers)
  ],
  exports: [],
  providers: [ItemsIntegrationsService]
})
export class ItemsIntegrationsModule {}
