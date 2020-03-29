import { Injectable } from "@angular/core";
@Injectable()
export class MockEnvService {
  public apiUrl = 'http://mock.api.com';

  public region = 'usa';

  public name = 'development';

  constructor() {}
}
