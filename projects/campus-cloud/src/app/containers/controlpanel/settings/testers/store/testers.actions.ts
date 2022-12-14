import { Action } from '@ngrx/store';

import { ITestersRange } from './testers.state';
import { SortDirection } from '@campus-cloud/shared/constants';
import { ITestUser } from '../models/test-user.interface';

export enum TestersActions {
  SET_RANGE = '[settings.testers] set range',
  SET_SORT = '[settings.testers] set sort',
  SET_SEARCH = '[settings.testers] set search',
  LOAD = '[settings.testers] load',
  LOAD_OK = '[settings.testers] load OK',
  LOAD_FAIL = '[settings.testers] load fail',
  DELETE = '[settings.testers] delete',
  DELETE_OK = '[settings.testers] delete OK',
  DELETE_FAIL = '[settings.testers] delete fail',
  CREATE = '[settings.testers] create',
  CREATE_OK = '[settings.testers] create OK',
  CREATE_FAIL = '[settings.testers] create fail'
}

export class SetTestersRange implements Action {
  readonly type = TestersActions.SET_RANGE;
  constructor(public payload: ITestersRange) {}
}

export class SetTestersSort implements Action {
  readonly type = TestersActions.SET_SORT;
  constructor(public payload: SortDirection) {}
}

export class SetTestersSearch implements Action {
  readonly type = TestersActions.SET_SEARCH;
  constructor(public payload: string) {}
}

export class LoadTesters implements Action {
  readonly type = TestersActions.LOAD;
}

export class LoadTestersOK implements Action {
  readonly type = TestersActions.LOAD_OK;
  constructor(public payload: ITestUser[]) {}
}

export class LoadTestersFail implements Action {
  readonly type = TestersActions.LOAD_FAIL;
}

export class DeleteTester implements Action {
  readonly type = TestersActions.DELETE;
  constructor(public payload: number) {}
}

export class DeleteTesterOK implements Action {
  readonly type = TestersActions.DELETE_OK;
  constructor(public payload: number) {}
}

export class DeleteTesterFail implements Action {
  readonly type = TestersActions.DELETE_FAIL;
}

export class CreateTesters implements Action {
  readonly type = TestersActions.CREATE;
  constructor(public payload: string[]) {}
}

export class CreateTestersOK implements Action {
  readonly type = TestersActions.CREATE_OK;
  constructor(public payload: ITestUser[]) {}
}

export class CreateTestersFail implements Action {
  readonly type = TestersActions.CREATE_FAIL;
}

export type TestersActionType =
  | SetTestersRange
  | SetTestersSort
  | SetTestersSearch
  | LoadTesters
  | LoadTestersOK
  | LoadTestersFail
  | DeleteTester
  | DeleteTesterOK
  | DeleteTesterFail
  | CreateTesters
  | CreateTestersOK
  | CreateTestersFail;
