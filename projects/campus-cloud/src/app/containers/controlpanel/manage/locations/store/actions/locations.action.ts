import { Action } from '@ngrx/store';

import { ILocation } from '@campus-cloud/libs/locations/common/model';

export enum locationActions {
  GET_LOCATIONS = '[manage.locations] get locations',
  GET_LOCATIONS_FAIL = '[manage.locations] get locations fail',
  GET_LOCATIONS_SUCCESS = '[manage.locations] get locations success',

  GET_FILTERED_LOCATIONS = '[manage.locations] get filtered locations',
  GET_FILTERED_LOCATIONS_FAIL = '[manage.locations] get filtered locations fail',
  GET_FILTERED_LOCATIONS_SUCCESS = '[manage.locations] get filtered locations success',

  GET_LOCATION_BY_ID = '[manage.locations] get location by id',
  GET_LOCATION_BY_ID_FAIL = '[manage.locations] get location by id fail',
  GET_LOCATION_BY_ID_SUCCESS = '[manage.locations] get location by id success',

  POST_LOCATION = '[manage.locations] post location',
  POST_LOCATION_FAIL = '[manage.locations] post location fail',
  POST_LOCATION_SUCCESS = '[manage.locations] post location success',

  EDIT_LOCATION = '[manage.locations] edit location',
  EDIT_LOCATION_FAIL = '[manage.locations] edit location fail',
  EDIT_LOCATION_SUCCESS = '[manage.locations] edit location success',

  DELETE_LOCATION = '[manage.locations] delete location',
  DELETE_LOCATION_FAIL = '[manage.locations] delete location fail',
  DELETE_LOCATION_SUCCESS = '[manage.locations] delete location success',

  IMPORT_LOCATIONS = '[manage.locations] import locations',

  RESET_ERROR = '[manage.locations] reset error to false',

  DESTROY = '[manage.locations] destroy'
}

export class GetLocations implements Action {
  readonly type = locationActions.GET_LOCATIONS;
  constructor(public payload: { startRange: number; endRange: number; state }) {}
}

export class GetLocationsFail implements Action {
  readonly type = locationActions.GET_LOCATIONS_FAIL;
  constructor(public payload: string) {}
}

export class GetLocationsSuccess implements Action {
  readonly type = locationActions.GET_LOCATIONS_SUCCESS;
  constructor(public payload: ILocation[]) {}
}

export class GetFilteredLocations implements Action {
  readonly type = locationActions.GET_FILTERED_LOCATIONS;
  constructor(public payload: { startRange: number; endRange: number; state }) {}
}

export class GetFilteredLocationsFail implements Action {
  readonly type = locationActions.GET_FILTERED_LOCATIONS_FAIL;
  constructor(public payload: string) {}
}

export class GetFilteredLocationsSuccess implements Action {
  readonly type = locationActions.GET_FILTERED_LOCATIONS_SUCCESS;
  constructor(public payload: ILocation[]) {}
}

export class GetLocationById implements Action {
  readonly type = locationActions.GET_LOCATION_BY_ID;
  constructor(public payload: { locationId: number }) {}
}

export class GetLocationByIdFail implements Action {
  readonly type = locationActions.GET_LOCATION_BY_ID_FAIL;
  constructor(public payload: string) {}
}

export class GetLocationByIdSuccess implements Action {
  readonly type = locationActions.GET_LOCATION_BY_ID_SUCCESS;
  constructor(public payload: ILocation) {}
}

export class PostLocation implements Action {
  readonly type = locationActions.POST_LOCATION;
  constructor(public payload: { body: ILocation }) {}
}

export class PostLocationFail implements Action {
  readonly type = locationActions.POST_LOCATION_FAIL;
  constructor(public payload: string) {}
}

export class PostLocationSuccess implements Action {
  readonly type = locationActions.POST_LOCATION_SUCCESS;
  constructor(public payload: ILocation) {}
}

export class EditLocation implements Action {
  readonly type = locationActions.EDIT_LOCATION;
  constructor(
    public payload: {
      body: ILocation;
      locationId: number;
      categoryId: number;
      updatedCategory: string;
    }
  ) {}
}

export class EditLocationFail implements Action {
  readonly type = locationActions.EDIT_LOCATION_FAIL;
  constructor(public payload: string) {}
}

export class EditLocationSuccess implements Action {
  readonly type = locationActions.EDIT_LOCATION_SUCCESS;
  constructor(public payload: { data: ILocation; categoryId: number }) {}
}

export class DeleteLocation implements Action {
  readonly type = locationActions.DELETE_LOCATION;
  constructor(public payload: ILocation) {}
}

export class DeleteLocationFail implements Action {
  readonly type = locationActions.DELETE_LOCATION_FAIL;
  constructor(public payload: string) {}
}

export class DeleteLocationSuccess implements Action {
  readonly type = locationActions.DELETE_LOCATION_SUCCESS;
  constructor(public payload: { deletedId: number; categoryId: number }) {}
}

export class ImportLocations implements Action {
  readonly type = locationActions.IMPORT_LOCATIONS;
  constructor(public payload: any) {}
}

export class ResetError implements Action {
  readonly type = locationActions.RESET_ERROR;
}

export class Destroy implements Action {
  readonly type = locationActions.DESTROY;
}

export type LocationsAction =
  | GetLocations
  | GetLocationsFail
  | GetLocationsSuccess
  | GetLocationById
  | GetLocationByIdFail
  | GetLocationByIdSuccess
  | PostLocation
  | PostLocationFail
  | PostLocationSuccess
  | EditLocation
  | EditLocationFail
  | EditLocationSuccess
  | DeleteLocation
  | DeleteLocationSuccess
  | DeleteLocationFail
  | ResetError
  | GetFilteredLocations
  | GetFilteredLocationsFail
  | GetFilteredLocationsSuccess
  | ImportLocations
  | Destroy;
