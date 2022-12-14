import * as fromActions from '../actions';
import * as fromReducer from './dining.reducer';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { mockLocations as mockDining } from '@campus-cloud/libs/locations/common/tests';

const httpErrorResponse = 'fake error message';

const pagination = {
  startRange: 1,
  endRange: 2
};

const { initialState } = fromReducer;

describe('Dining Reducer', () => {
  it('should GET dining', () => {
    const payload = {
      ...pagination,
      state: null
    };
    const action = new fromActions.GetDining(payload);
    const result = fromReducer.reducer(initialState, action);
    const { loading } = result;

    expect(loading).toBe(true);
  });

  it('should GET dining entities success', () => {
    const action = new fromActions.GetDiningSuccess(mockDining);
    const { entities, error, loaded, loading } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loaded).toBe(true);
    expect(loading).toBe(false);
    expect(entities[mockDining[0].id]).toEqual(mockDining[0]);
  });

  it('should GET dining entities fail', () => {
    const action = new fromActions.GetDiningFail(httpErrorResponse);
    const { error, loaded } = fromReducer.reducer(initialState, action);

    expect(error).toBe(true);
    expect(loaded).toBe(true);
  });

  it('should POST dining', () => {
    const body = mockDining[0];
    const payload = {
      body
    };

    const action = new fromActions.PostDining(payload);
    const { loading, error } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loading).toBe(true);
  });

  it('should POST dining success', () => {
    const payload = mockDining[0];

    const action = new fromActions.PostDiningSuccess(payload);
    const { entities, loading, error } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loading).toBe(false);
    expect(entities[mockDining[0].id]).toEqual(mockDining[0]);
  });

  it('should POST dining fail', () => {
    const action = new fromActions.PostDiningFail(httpErrorResponse);
    const { error, loaded, loading } = fromReducer.reducer(initialState, action);

    expect(error).toBe(true);
    expect(loaded).toBe(true);
    expect(loading).toBe(false);
  });

  it('should EDIT dining', () => {
    const body = mockDining[0];
    const payload = {
      body,
      diningId: mockDining[0].id,
      updatedCategory: amplitudeEvents.NO,
      categoryId: mockDining[0].category_id
    };

    const action = new fromActions.EditDining(payload);
    const { loading, error } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loading).toBe(false);
  });

  it('should EDIT dining success', () => {
    const payload = {
      data: mockDining[0],
      categoryId: mockDining[0].category_id
    };

    const action = new fromActions.EditDiningSuccess(payload);
    const { loading, error } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loading).toBe(false);
  });

  it('should EDIT dining fail', () => {
    const action = new fromActions.EditDiningFail(httpErrorResponse);
    const { error, loaded, loading } = fromReducer.reducer(initialState, action);

    expect(error).toBe(true);
    expect(loaded).toBe(true);
    expect(loading).toBe(false);
  });

  it('should DELETE dining', () => {
    const action = new fromActions.DeleteDining(mockDining[0]);
    const { error, loaded, loading } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loaded).toBe(true);
    expect(loading).toBe(true);
  });

  it('should DELETE dining success', () => {
    const payload = {
      deletedId: mockDining[0].id,
      categoryId: mockDining[0].category_id
    };

    const action = new fromActions.DeleteDiningSuccess(payload);
    const { error, loaded, loading } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
    expect(loaded).toBe(true);
    expect(loading).toBe(false);
  });

  it('should DELETE dining fail', () => {
    const action = new fromActions.DeleteDiningFail(httpErrorResponse);
    const { error, loading, loaded } = fromReducer.reducer(initialState, action);

    expect(error).toBe(true);
    expect(loaded).toBe(true);
    expect(loading).toBe(false);
  });

  it('should RESET error', () => {
    const action = new fromActions.ResetError();
    const { error } = fromReducer.reducer(initialState, action);

    expect(error).toBe(false);
  });
});
