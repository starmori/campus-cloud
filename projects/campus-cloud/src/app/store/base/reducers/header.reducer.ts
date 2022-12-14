import { IHeader } from '../base.state';

export const HEADER_UPDATE = 'HEADER_UPDATE';
export const HEADER_DEFAULT = 'HEADER_DEFAULT';

const initialState: IHeader = {
  heading: '',
  subheading: '',
  em: '',
  crumbs: {
    url: null,
    label: null
  },
  children: []
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case HEADER_UPDATE:
      let payload = action.payload;

      if (!('crumbs' in payload)) {
        payload = Object.assign({}, payload, {
          crumbs: {
            url: null,
            label: null
          }
        });
      }

      return Object.assign({}, state, payload);
    case HEADER_DEFAULT:
      return initialState;
    default:
      return state;
  }
}
