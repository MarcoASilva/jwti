/* eslint-disable */

import jwt from 'jsonwebtoken';
import { RedisClientType } from 'redis';
import { Jwti } from '../src';

let mockErrorLogger: jest.Mock;
let mockConsoleError: jest.Mock;

const setup = async () => {
  mockErrorLogger = jest.fn();
  mockConsoleError = jest.fn();
  console.error = mockConsoleError;
};

beforeEach(async () => {
  await setup();
});

describe('Internals', () => {
  test('Suppress internal errors by default', async () => {
    const jwti = new Jwti(jwt, {} as RedisClientType);
    await expect(
      jwti.verify(await jwti.sign('PAYLOAD', 'SECRET'), 'SECRET'),
    ).resolves.not.toThrowError();
  });

  test('Internal error is thrown when suppressErrors = false', async () => {
    const jwti = new Jwti(jwt, {} as RedisClientType, {
      internals: { suppressErrors: false },
    });
    await expect(
      jwti.verify(await jwti.sign('PAYLOAD', 'SECRET'), 'SECRET'),
    ).rejects.toThrow();
  });

  test('Internal error is not logged when allowLogging = false', async () => {
    const jwti = new Jwti(jwt, {} as RedisClientType, {
      internals: { allowLogging: false },
    });
    await jwti.verify(await jwti.sign('PAYLOAD', 'SECRET'), 'SECRET');
    expect(mockConsoleError.mock.calls.length).toBe(0);
  });

  test('Internal error is logged by default', async () => {
    const jwti = new Jwti(jwt, {} as RedisClientType);
    await jwti.verify(await jwti.sign('PAYLOAD', 'SECRET'), 'SECRET');
    expect(mockConsoleError.mock.calls.length).toBe(1);
  });

  test('Internal error is logged to errorLogger', async () => {
    // as internals.suppressErrors is not set it's default to true
    // so this should not throw
    const jwti = new Jwti(jwt, {} as RedisClientType, {
      internals: {
        errorLogger: mockErrorLogger,
      },
    });
    await jwti.verify(await jwti.sign('PAYLOAD', 'SECRET'), 'SECRET');
    expect(mockConsoleError.mock.calls.length).toBe(0);
    expect(mockErrorLogger.mock.calls.length).toBe(1);
  });

  test('Internal error is logged to console.error', async () => {
    const jwti = new Jwti(jwt, {} as RedisClientType);
    await jwti.verify(await jwti.sign('PAYLOAD', 'SECRET'), 'SECRET');
    expect(mockConsoleError.mock.calls.length).toBe(1);
  });
});
