import { ActivatedRouteSnapshot, RouterStateSnapshot, Params } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';
import { Injectable } from "@angular/core";

export interface RouterStateUrl {
  url: string;
  queryParams: Params;
  params: Params;
}

@Injectable()
export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    const {
      url,
      root: { queryParams }
    } = routerState;

    let state: ActivatedRouteSnapshot = routerState.root;
    let params = { ...state.params };

    while (state.firstChild) {
      state = state.firstChild;
      params = { ...params, ...state.params };
    }

    return { url, queryParams, params };
  }
}
