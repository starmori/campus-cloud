import { NgModule, ModuleWithProviders } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';

import { defaultToastConfig } from './config';
import { TOAST_CONFIG_TOKEN } from './config/tokens';
import { ToastComponent } from './toast/toast.component';

@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [ToastComponent],
  entryComponents: [ToastComponent]
})
export class ToastModule {
  public static forRoot(config = defaultToastConfig): ModuleWithProviders<ToastModule> {
    return {
      ngModule: ToastModule,
      providers: [
        {
          provide: TOAST_CONFIG_TOKEN,
          useValue: config
        }
      ]
    };
  }
}
