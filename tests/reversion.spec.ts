import jwt from 'jsonwebtoken';
import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
} from 'redis';
import { RedisMemoryServer } from 'redis-memory-server';
import { Jwti } from '../src';
import { InvalidatedTokenError, JwtiError } from '../src/errors';

let redisServer: RedisMemoryServer;
let redisClient: RedisClientType<
  RedisDefaultModules & RedisModules,
  RedisFunctions
>;

const setup = async () => {
  redisServer = new RedisMemoryServer({ instance: { port: 49475 } });
  const host = await redisServer.getHost();
  const port = await redisServer.getPort();
  const url = `redis://${host}:${port}`;

  redisClient = createClient({ url });
  await redisClient.connect();
};

const tearDown = async () => {
  await redisClient.disconnect();
  await redisServer.stop();
};

beforeEach(async () => {
  await setup();
});

afterEach(async () => {
  await tearDown();
});

describe('Reversion', () => {
  test('invalidated token should NOT be valid after revert is called with user param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });

    await jwti.invalidate(token);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }

    const reverted = await jwti.revert({ user });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }
  });

  test('invalidated token should NOT be valid after revert is called with client param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });

    await jwti.invalidate(token);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }

    const reverted = await jwti.revert({ client });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }
  });

  test('invalidated token should NOT be valid after revert is called with user AND client param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });

    await jwti.invalidate(token);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }

    const reverted = await jwti.revert({ user, client });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }
  });

  test('invalidated token should be valid again after revert is called with token param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate(token);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('token');
    }

    await jwti.revert(token);

    const decoded = await jwti.verify(token, 'SECRET');
    expect(decoded).toBe('PAYLOAD');
  });

  test('invalidated user token should NOT be valid after revert is called with token param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }

    const reverted = await jwti.revert(token);

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }
  });

  test('invalidated user token should NOT be valid after revert is called with client param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }

    const reverted = await jwti.revert({ client });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }
  });

  test('invalidated user token should NOT be valid after revert is called with user-lcient param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }

    const reverted = await jwti.revert({ user, client });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }
  });

  test('invalidated user token should be valid again after revert is called with user param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('user');
    }

    await jwti.revert({ user });

    const decoded = await jwti.verify(token, 'SECRET');
    expect(decoded).toBe('PAYLOAD');
  });

  test('invalidated client token should NOT be valid after revert is called with token param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }

    const reverted = await jwti.revert(token);

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }
  });

  test('invalidated client token should NOT be valid after revert is called with user param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }

    const reverted = await jwti.revert({ user });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }
  });

  test('invalidated client token should NOT be valid after revert is called with user AND client param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }

    const reverted = await jwti.revert({ user, client });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }
  });

  test('invalidated client token should be valid again after revert is called with client param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe('client');
    }

    await jwti.revert({ client });

    const decoded = await jwti.verify(token, 'SECRET');
    expect(decoded).toBe('PAYLOAD');
  });

  test('invalidated user-client token should NOT be valid after revert is called with token param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user, client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }

    const reverted = await jwti.revert(token);

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }
  });

  test('invalidated user-client token should NOT be valid after revert is called with user param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user, client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }

    const reverted = await jwti.revert({ user });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }
  });

  test('invalidated user-client token should NOT be valid after revert is called with client param', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user, client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }

    const reverted = await jwti.revert({ client });

    expect(reverted).toBe(false);

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }
  });

  test('invalidated user-client token should be valid again after revert is called with user AND client params', async () => {
    const jwti = new Jwti(jwt, redisClient);
    const user = { name: 'John', id: 1, lastOnline: new Date() };
    const client = { device: 'desktop', app: 'mobile' };
    const precise = true;
    const token = await jwti.sign('PAYLOAD', 'SECRET', {
      user,
      client,
      precise,
    });
    await jwti.invalidate({ user, client });

    try {
      await jwti.verify(token, 'SECRET');
    } catch (error) {
      expect(error).toBeInstanceOf(JwtiError);
      expect(error).toBeInstanceOf(InvalidatedTokenError);
      expect((error as InvalidatedTokenError).isJwtiError).toBe(true);
      expect((error as InvalidatedTokenError).invalidationType).toBe(
        'user-client',
      );
    }

    await jwti.revert({ user, client });

    const decoded = await jwti.verify(token, 'SECRET');
    expect(decoded).toBe('PAYLOAD');
  });
});
