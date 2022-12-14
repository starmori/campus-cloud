export class MockAdminService {
  getAdmins() {}

  updateAdmin() {}
}

export class MockTrackingService {
  amplitudeEmitEvent() {}
}

export const mockTeam = {
  id: 123,
  lastname: 'world',
  firstname: 'hello',
  email: 'test@test.com',
  is_current_user: false,
  account_activated: false
};

export const defaultForm = {
  email: null,
  lastname: null,
  firstname: null
};

export const filledForm = {
  lastname: 'world',
  firstname: 'hello',
  email: 'test@test.com'
};
