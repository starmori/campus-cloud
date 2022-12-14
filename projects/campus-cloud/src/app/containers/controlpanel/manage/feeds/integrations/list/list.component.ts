import { takeUntil, filter, tap, map, take } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromStore from '../store';
import * as fromRoot from '@campus-cloud/store';

import { BaseComponent } from '@campus-cloud/base';
import { IItem } from '@campus-cloud/shared/components';
import { CPI18nService } from '@campus-cloud/shared/services';
import { IWallsIntegration } from '@campus-cloud/libs/integrations/walls/model';
import { Mixin, Destroyable } from '@campus-cloud/shared/mixins';

@Component({
  selector: 'cp-walls-integrations-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
@Mixin([Destroyable])
export class WallsIntegrationsListComponent extends BaseComponent implements OnInit, OnDestroy {
  channels: IItem[];
  showEditModal = false;
  showCreateModal = false;
  showDeleteModal = false;
  loading$: Observable<boolean>;
  selectedIntegration: IWallsIntegration;
  integrations$: Observable<IWallsIntegration[]>;

  // Destroyable
  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    private cpI18n: CPI18nService,
    public store: Store<fromStore.IWallsIntegrationState>
  ) {
    super();
  }

  onPaginationNext() {
    super.goToNext();

    this.fetch();
  }

  onPaginationPrevious() {
    super.goToPrevious();

    this.fetch();
  }

  onEditTeardown() {
    this.showEditModal = false;
    $('#integrationEdit').modal('hide');
  }

  onCreateTeardown() {
    this.showCreateModal = false;
    $('#integrationCreate').modal('hide');
  }

  onDeleteTeardown() {
    this.showDeleteModal = false;
    $('#integrationDelete').modal('hide');
  }

  onSyncNow(feedId: number) {
    this.store
      .select(fromStore.getIntegrationById(feedId))
      .pipe(
        takeUntil(this.destroy$),
        take(1)
      )
      .subscribe((integration) => {
        this.store.dispatch(
          new fromStore.SyncNow({
            integration,
            error: this.cpI18n.translate('something_went_wrong')
          })
        );
      });
  }

  updateHeader() {
    Promise.resolve().then(() => {
      this.store.dispatch({
        type: fromRoot.baseActions.HEADER_UPDATE,
        payload: {
          heading: 't_shared_feature_integrations',
          subheading: null,
          em: null,
          crumbs: {
            url: 'feeds',
            label: 'feeds'
          },
          children: []
        }
      });
    });
  }

  fetch() {
    const payload = {
      endRange: this.endRange,
      startRange: this.startRange
    };
    this.store.dispatch(new fromStore.GetIntegrations(payload));
  }

  onLaunchCreateModal() {
    this.showCreateModal = true;

    setTimeout(() => $('#integrationCreate').modal({ keyboard: true, focus: true }));
  }

  onLaunchEditModal(integration: IWallsIntegration) {
    this.showEditModal = true;
    this.selectedIntegration = integration;

    setTimeout(() => $('#integrationEdit').modal({ keyboard: true, focus: true }));
  }

  onLaunchDeleteModal(integration: IWallsIntegration) {
    this.showDeleteModal = true;
    this.selectedIntegration = integration;

    setTimeout(() => $('#integrationDelete').modal({ keyboard: true, focus: true }));
  }

  onDeleteClick(integration: IWallsIntegration) {
    const payload = {
      integration
    };

    this.store.dispatch(new fromStore.DeleteIntegration(payload));
  }

  listenForCompletedActions() {
    this.store
      .select(fromStore.getCompletedAction)
      .pipe(
        takeUntil(this.destroy$),
        filter((action) => !!action),
        tap((phraseAppKey) => {
          const payload = {
            body: this.cpI18n.translate(phraseAppKey),
            sticky: true,
            autoClose: true,
            class: 'success'
          };
          this.store.dispatch({
            type: fromRoot.baseActions.SNACKBAR_SHOW,
            payload
          });
        })
      )
      .subscribe();
  }

  listenForErrors() {
    this.store
      .select(fromStore.getIntegrationsError)
      .pipe(
        takeUntil(this.destroy$),
        filter((error) => coerceBooleanProperty(error)),
        tap((body) => {
          const payload = {
            body,
            sticky: true,
            autoClose: true,
            class: 'danger'
          };

          this.store.dispatch({
            type: fromRoot.baseActions.SNACKBAR_SHOW,
            payload
          });
        })
      )
      .subscribe();
  }

  loadSocialPostCategories() {
    this.store
      .select(fromStore.getSocialPostCategories)
      .pipe(
        takeUntil(this.destroy$),
        tap((socialPostCategories) => {
          if (!socialPostCategories.length) {
            this.store.dispatch(new fromStore.GetSocialPostCategories());
          }
        })
      )
      .subscribe((channels) => (this.channels = channels));
  }

  ngOnInit(): void {
    this.updateHeader();
    this.listenForErrors();
    this.loadSocialPostCategories();
    this.listenForCompletedActions();

    this.integrations$ = this.store.select(fromStore.getIntegrations).pipe(
      map((res) => {
        const responseCopy = [...res];

        return super.updatePagination(responseCopy);
      })
    );

    this.loading$ = this.store
      .select(fromStore.getIntegrationsLoading)
      .pipe(takeUntil(this.destroy$));

    this.fetch();
  }

  ngOnDestroy() {
    this.emitDestroy();
    this.store.dispatch(new fromStore.Destroy());
  }
}
