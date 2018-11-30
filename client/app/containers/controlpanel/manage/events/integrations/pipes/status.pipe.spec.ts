import { EventIntegrationStatusPipe } from './status.pipe';
import { EventIntegration } from './../model/integration.model';

describe('EventIntegrationStatusPipe', () => {
  let pipe: EventIntegrationStatusPipe;
  beforeEach(() => {
    pipe = new EventIntegrationStatusPipe();
  });

  it('should convert error', () => {
    const expected = 't_shared_error';
    const result = pipe.transform(EventIntegration.status.error);

    expect(result).toEqual(expected);
  });

  it('should convert pending', () => {
    const expected = 't_shared_pending';
    const result = pipe.transform(EventIntegration.status.pending);

    expect(result).toEqual(expected);
  });

  it('should convert successful', () => {
    const expected = 't_shared_successful';
    const result = pipe.transform(EventIntegration.status.successful);

    expect(result).toEqual(expected);
  });
});
