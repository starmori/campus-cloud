import { HttpParams } from '@angular/common/http';
import { Action } from '@ngrx/store';

import { ISocialPostCategory } from '../../../model';
import { IItem } from '@campus-cloud/shared/components';
import { IWallsIntegration } from '@campus-cloud/libs/integrations/walls/model';

export enum IntegrationActions {
  GET_INTEGRATIONS = '[manage.walls.integrations] get integrations',
  GET_INTEGRATIONS_SUCCESS = '[manage.walls.integrations] get integrations success',
  GET_INTEGRATIONS_FAIL = '[manage.walls.integrations] get integrations fail',

  GET_SOCIAL_POST_CATEGORIES = '[manage.walls.integrations] get social post categories',
  GET_SOCIAL_POST_CATEGORIES_SUCCESS = '[manage.walls.integrations] get social post categories success',
  GET_SOCIAL_POST_CATEGORIES_FAIL = '[manage.walls.integrations] get social post categories fail',

  POST_SOCIAL_POST_CATEGORIES = '[manage.walls.integrations] post social post categories',
  POST_SOCIAL_POST_CATEGORIES_SUCCESS = '[manage.walls.integrations] post social post categories success',
  POST_SOCIAL_POST_CATEGORIES_FAIL = '[manage.walls.integrations] post social post categories fail',

  DELETE_INTEGRATION = '[manage.walls.integrations] delete integration',
  DELETE_INTEGRATION_SUCCESS = '[manage.walls.integrations] delete integration success',
  DELETE_INTEGRATION_FAIL = '[manage.walls.integrations] delete integration fail',

  POST_INTEGRATION = '[manage.walls.integrations] post integration',
  POST_INTEGRATION_SUCCESS = '[manage.walls.integrations] post integration success',
  POST_INTEGRATION_FAIL = '[manage.walls.integrations] post integration fail',

  EDIT_INTEGRATION = '[manage.walls.integrations] edit integration',
  EDIT_INTEGRATION_SUCCESS = '[manage.walls.integrations] edit integration success',
  EDIT_INTEGRATION_FAIL = '[manage.walls.integrations] edit integration fail',

  RESET_SOCIAL_POST_CATEGORIES = '[manage.walls.integrations] reset social post categories',

  SYNC_NOW = '[manage.walls.integrations] sync now',
  SYNC_NOW_FAIL = '[manage.walls.integrations] sync now fail',
  SYNC_NOW_SUCCESS = '[manage.walls.integrations] sync now success',

  CREATE_AND_SYNC = '[manage.walls.integrations] create and sync',

  DESTROY = '[manage.walls.integrations] destroy'
}

export class GetIntegrations implements Action {
  readonly type = IntegrationActions.GET_INTEGRATIONS;

  constructor(public payload: { startRange: number; endRange: number }) {}
}

export class GetIntegrationsSuccess implements Action {
  readonly type = IntegrationActions.GET_INTEGRATIONS_SUCCESS;

  constructor(public payload: IWallsIntegration[]) {}
}

export class GetIntegrationsFail implements Action {
  readonly type = IntegrationActions.GET_INTEGRATIONS_FAIL;

  constructor(public payload: { error: string }) {}
}

export class DeleteIntegration implements Action {
  readonly type = IntegrationActions.DELETE_INTEGRATION;

  constructor(public payload: { integration: IWallsIntegration }) {}
}

export class DeleteIntegrationSuccess implements Action {
  readonly type = IntegrationActions.DELETE_INTEGRATION_SUCCESS;

  constructor(public payload: { deletedId: number }) {}
}

export class DeleteIntegrationFail implements Action {
  readonly type = IntegrationActions.DELETE_INTEGRATION_FAIL;

  constructor(public payload: { error: string }) {}
}

export class PostIntegration implements Action {
  readonly type = IntegrationActions.POST_INTEGRATION;

  constructor(public payload: { body: IWallsIntegration; channelType: string }) {}
}

export class PostIntegrationSuccess implements Action {
  readonly type = IntegrationActions.POST_INTEGRATION_SUCCESS;

  constructor(public payload: IWallsIntegration) {}
}

export class PostIntegrationFail implements Action {
  readonly type = IntegrationActions.POST_INTEGRATION_FAIL;

  constructor(public payload: { error: string }) {}
}

export class EditIntegration implements Action {
  readonly type = IntegrationActions.EDIT_INTEGRATION;

  constructor(public payload: { integrationId: number; body: IWallsIntegration }) {}
}

export class EditIntegrationSuccess implements Action {
  readonly type = IntegrationActions.EDIT_INTEGRATION_SUCCESS;

  constructor(public payload: IWallsIntegration) {}
}

export class EditIntegrationFail implements Action {
  readonly type = IntegrationActions.EDIT_INTEGRATION_FAIL;

  constructor(public payload: { error: string }) {}
}

export class GetSocialPostCategories implements Action {
  readonly type = IntegrationActions.GET_SOCIAL_POST_CATEGORIES;
}

export class GetSocialPostCategoriesSuccess implements Action {
  readonly type = IntegrationActions.GET_SOCIAL_POST_CATEGORIES_SUCCESS;

  constructor(public payload: IItem[]) {}
}

export class GetSocialPostCategoriesFail implements Action {
  readonly type = IntegrationActions.GET_SOCIAL_POST_CATEGORIES_FAIL;

  constructor(public payload: { error: string }) {}
}

export class PostSocialPostCategories implements Action {
  readonly type = IntegrationActions.POST_SOCIAL_POST_CATEGORIES;

  constructor(
    public payload: {
      socialPostCategory: {
        params: HttpParams;
        body: ISocialPostCategory;
      };
      integration: {
        body: IWallsIntegration;
        params: HttpParams;
      };
    }
  ) {}
}

export class PostSocialPostCategoriesSuccess implements Action {
  readonly type = IntegrationActions.POST_SOCIAL_POST_CATEGORIES_SUCCESS;

  constructor(public payload: ISocialPostCategory) {}
}

export class PostSocialPostCategoriesFail implements Action {
  readonly type = IntegrationActions.POST_SOCIAL_POST_CATEGORIES_FAIL;

  constructor(public payload: { error: string }) {}
}

export class ResetSocialPostCategories implements Action {
  readonly type = IntegrationActions.RESET_SOCIAL_POST_CATEGORIES;
}

export class SyncNow implements Action {
  readonly type = IntegrationActions.SYNC_NOW;

  constructor(
    public payload: { integration: IWallsIntegration; succesMessage?: string; error?: string }
  ) {}
}

export class SyncNowSuccess implements Action {
  readonly type = IntegrationActions.SYNC_NOW_SUCCESS;

  constructor(public payload: { integration: IWallsIntegration; message?: string }) {}
}

export class SyncNowFail implements Action {
  readonly type = IntegrationActions.SYNC_NOW_FAIL;

  constructor(public payload: { integration: IWallsIntegration; error?: string }) {}
}

export class CreateAndSync implements Action {
  readonly type = IntegrationActions.CREATE_AND_SYNC;

  constructor(
    public payload: { body: IWallsIntegration; params: HttpParams; channelType: string }
  ) {}
}

export class Destroy implements Action {
  readonly type = IntegrationActions.DESTROY;
}

export type Actions =
  | GetIntegrations
  | GetIntegrationsSuccess
  | GetIntegrationsFail
  | DeleteIntegration
  | DeleteIntegrationFail
  | DeleteIntegrationSuccess
  | PostIntegration
  | PostIntegrationSuccess
  | PostIntegrationFail
  | EditIntegration
  | EditIntegrationSuccess
  | EditIntegrationFail
  | GetSocialPostCategories
  | GetSocialPostCategoriesSuccess
  | GetSocialPostCategoriesFail
  | PostSocialPostCategories
  | PostSocialPostCategoriesSuccess
  | PostSocialPostCategoriesFail
  | ResetSocialPostCategories
  | SyncNow
  | SyncNowSuccess
  | SyncNowFail
  | CreateAndSync
  | Destroy;
