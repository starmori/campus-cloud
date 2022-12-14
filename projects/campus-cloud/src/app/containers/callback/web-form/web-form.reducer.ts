import { createReducer, on } from '@ngrx/store';
import { start, reset, addResponse, removeResponse } from './web-form.actions';
import { FormState } from './form-state.interface';
import { FormBlockResponse } from './form-block.interface';

const initialState: FormState = {
  formResponseId: null,
  externalUserId: '',
  formBlockResponses: []
};

const _webFormReducer = createReducer(
  initialState,
  on(start, (state, payload) => ({
    ...state,
    formResponseId: payload.formResponseId,
    externalUserId: payload.externalUserId
  })),
  on(reset, (state) => ({
    ...state,
    formResponseId: null,
    externalUserId: '',
    formBlockResponses: []
  })),
  on(addResponse, (state, currentFormBlockResponse) => {
    const { formBlockId, responseFormBlockContentIds, responseData } = currentFormBlockResponse;
    let newResponse: FormBlockResponse = {
      form_block_id: formBlockId,
      response_form_block_content_ids: responseFormBlockContentIds,
      response_data: responseData
    };

    // Remove falsy values
    Object.keys(newResponse).forEach((key) =>
      newResponse[key].length === 0 ? delete newResponse[key] : {}
    );

    return {
      ...state,
      formBlockResponses: [...state.formBlockResponses, newResponse]
    };
  }),
  on(removeResponse, (state, payload) => {
    const prunedFormBlockResponses = state.formBlockResponses.filter((formBlockResponse) => {
      return formBlockResponse.form_block_id !== payload.formBlockId;
    });
    return { ...state, formBlockResponses: prunedFormBlockResponses };
  })
);

export function webFormReducer(state, action) {
  return _webFormReducer(state, action);
}
