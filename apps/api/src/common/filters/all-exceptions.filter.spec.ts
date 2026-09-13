import { BadRequestException, HttpException, UnauthorizedException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
}

function makeHost(): { host: any; res: MockResponse } {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const res: MockResponse = { status, json };
  const host = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ headers: {} }),
    }),
  };
  return { host, res };
}

describe('AllExceptionsFilter (D-07 envelope)', () => {
  it('renders the locked error envelope for an authentication failure', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(new UnauthorizedException('Invalid credentials'), host);

    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      },
    });
    expect(typeof body.error.timestamp).toBe('string');
  });

  it('places the retryAfter for 423 into error.details (D-B5-5)', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(
      new HttpException(
        { statusCode: 423, message: 'Account temporarily locked', retryAfter: 42 },
        423,
      ),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(423);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('LOCKED');
    expect(body.error.message).toBe('Account temporarily locked');
    expect(body.error.details).toEqual([{ retryAfter: 42 }]);
  });

  it('places the retryAfter for 429 into error.details (D-B5-5)', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(
      new HttpException(
        { statusCode: 429, message: 'Too many requests', retryAfter: 7 },
        429,
      ),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(429);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(body.error.details).toEqual([{ retryAfter: 7 }]);
  });

  it('maps validation message arrays to a stable message plus details', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(
      new BadRequestException(['email must be an email', 'password is required']),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(body.error.message).toBe('Validation failed');
    expect(body.error.details).toEqual([
      'email must be an email',
      'password is required',
    ]);
  });

  it('maps a legacy errors field into details', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(
      new BadRequestException({
        message: 'Password does not satisfy the tenant policy',
        errors: ['too short'],
      }),
      host,
    );

    const body = res.json.mock.calls[0][0];
    expect(body.error.message).toBe('Password does not satisfy the tenant policy');
    expect(body.error.details).toEqual(['too short']);
  });

  it('never leaks stack traces on unknown 500s', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(new Error('boom: database exploded'), host);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('boom');
    expect('stack' in body.error).toBe(false);
  });

  it('uses no details when none are present', () => {
    const { host, res } = makeHost();
    new AllExceptionsFilter().catch(new UnauthorizedException('Invalid credentials'), host);
    const body = res.json.mock.calls[0][0];
    expect(body.error.details).toBeUndefined();
  });
});