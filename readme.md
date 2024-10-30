# jwti

Invalidate jwt tokens by user, client or user-client combinations.

JWT Invalidation requires
[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) like and
[redis](https://www.npmjs.com/package/redis) like clients to work.

This package **DOES NOT** depend **directly** on any package or library.

# Setup

```typescript
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { Jwti } from 'jwti';

(async () => {
  const redis = createClient();
  await redis.connect();

  const jwti = new Jwti(jwt, redis);
  //...
})();
```

# Invalidation

## specific token

any token works, even ones that were not signed using jwti

```typescript
const token = await jwti.sign('payload', 'secret');

await jwti.invalidate(token);

// throws an InvalidatedTokenError
await jwti.verify(token);
```

## all of a user's token

that were signed with jwti

```typescript
const token = await jwti.sign('payload', 'secret', { user: 1 });

await jwti.invalidate({ user: 1 });

// throws an InvalidatedTokenError
await jwti.verify(token);
```

## all of a client's token

that were signed with jwti

```typescript
const token = await jwti.sign('payload', 'secret', { client: 'mobile' });

await jwti.invalidate({ client: 'mobile' });

// throws an InvalidatedTokenError
await jwti.verify(token);
```

## all tokens for a given user AND a given client

that were signed with jwti

```typescript
const token = await jwti.sign('payload', 'secret', {
  user: 1,
  client: 'mobile',
});

await jwti.invalidate({ user: 1, client: 'mobile' });

// throws an InvalidatedTokenError
await jwti.verify(token);
```

### error details

```typescript
try {
  await jwti.verify(invalidatedToken);
} catch (error) {
  // true
  console.log(error instanceof InvalidatedTokenError);
  // true
  console.log(error.isJwtiError);
  // outputs 'token' | 'user' | 'client' | 'user-client'
  console.log(error.invalidationType);
}
```

# reversion

You can revert your invalidations

## specific token

```typescript
const token = await jwti.sign('payload', 'secret');

await jwti.invalidate(token);

// would throw an InvalidatedTokenError
await jwti.verify(token);

const reverted = await jwti.revert(token);

// outputs 'payload'
console.log(await jwti.verify(token));
```

## user

```typescript
const token = await jwti.sign('payload', 'secret', { user: 1 });

await jwti.invalidate({ user: 1 });

// would throw an InvalidatedTokenError
await jwti.verify(token);

const reverted = await jwti.revert({ user: 1 });

// outputs 'payload'
console.log(await jwti.verify(token));
```

## client

```typescript
const token = await jwti.sign('payload', 'secret', { client: 'mobile' });

await jwti.invalidate({ client: 'mobile' });

// would throw an InvalidatedTokenError
await jwti.verify(token);

const reverted = await jwti.revert({ client: 'mobile' });

// outputs 'payload'
console.log(await jwti.verify(token));
```

## user-client comabination

```typescript
const token = await jwti.sign('payload', 'secret', {
  user: 1,
  client: 'mobile',
});

await jwti.invalidate({ user: 1, client: 'mobile' });

// would throw an InvalidatedTokenError
await jwti.verify(token);

const reverted = await jwti.revert({ user: 1, client: 'mobile' });

// outputs 'payload'
console.log(await jwti.verify(token));
```

#

### reminder:

all new tokens (signed after an invalidation) will be valid

```typescript
const firstToken = await jwti.sign('payload', 'secret', { user: 1 });

await jwti.invalidate({ user: 1 });

const secondToken = await jwti.sign('payload', 'secret', { user: 1 });

// throws an InvalidatedTokenError
console.log(await jwti.verify(firstToken));

// outputs 'payload'
console.log(await jwti.verify(secondToken));
```
