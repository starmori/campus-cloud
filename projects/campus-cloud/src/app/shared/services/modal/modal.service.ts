import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Inject, Injector, InjectionToken } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { merge, fromEvent } from 'rxjs';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
  PositionStrategy,
  ScrollStrategy
} from '@angular/cdk/overlay';

export interface IModal {
  data?: any;
  onClose?: Function;
  onAction?: Function;
}

export const MODAL_DATA = new InjectionToken<IModal>('MODAL_DATA');

@Injectable()
export class ModalService {
  constructor(
    @Inject(DOCUMENT) private document,
    private overlay: Overlay,
    private injector: Injector
  ) {}

  open<T>(component: ComponentType<T>, modalConfig: OverlayConfig = {}, props?: IModal) {
    const config = { ...this.defaultConfig, ...modalConfig };
    const overlayRef: OverlayRef = this.overlay.create(config);
    const componentPortal = new ComponentPortal<T>(component, null, this.getInjector(props));

    overlayRef.attach(componentPortal);
    const escapeKey$ = fromEvent(this.document, 'keyup').pipe(
      filter((e: any) => e.key === 'Escape')
    );
    merge(overlayRef.backdropClick(), escapeKey$)
      .pipe(take(1))
      .subscribe(() => this.close(overlayRef));

    return overlayRef;
  }

  close(modal: OverlayRef): void {
    if (modal) {
      modal.dispose();
    }
  }

  private getInjector(props: IModal): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(MODAL_DATA, props);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private get defaultConfig(): OverlayConfig {
    return {
      width: 520,
      height: 'auto',
      hasBackdrop: true,
      disposeOnNavigation: true,
      scrollStrategy: this.getScrollStrategy(),
      positionStrategy: this.getPositionStrategy()
    };
  }

  private getScrollStrategy(): ScrollStrategy {
    return this.overlay.scrollStrategies.block();
  }

  private getPositionStrategy(): PositionStrategy {
    return this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();
  }
}
