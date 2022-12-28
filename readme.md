# jwti

Invalidate jwt tokens by user, client or user-client combinations.

JWT Invalidation uses [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
and [redis](https://www.npmjs.com/package/redis).

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

// Throws an InvalidatedTokenError
await jwti.verify(token);
```

## All tokens of a user

that were signed with jwti

```typescript
const token = await jwti.sign('payload', 'secret', { user: 1 });

await jwti.invalidate({ user: 1 });

// Throws an InvalidatedTokenError
await jwti.verify(token);
```

## All tokens of a client

that were signed with jwti

```typescript
const token = await jwti.sign('payload', 'secret', { client: 'mobile' });

await jwti.invalidate({ client: 'mobile' });

// Throws an InvalidatedTokenError
await jwti.verify(token);
```

## All tokens for a user-client combination

that were signed with jwti

```typescript
const token = await jwti.sign('payload', 'secret', {
  user: 1,
  client: 'mobile',
});

await jwti.invalidate({ user: 1, client: 'mobile' });

// Throws an InvalidatedTokenError
await jwti.verify(token);
```

### Error details

```typescript
try {
  await jwti.verify(invalidatedToken);
} catch (error) {
  // true
  console.log(error instanceof InvalidatedTokenError);
  // true
  console.log(error.isJwtiError);
  // Outputs 'token' | 'user' | 'client' | 'user-client'
  console.log(error.invalidationType);
}
```

# Reversion

You can revert your invalidations

## specific token

```typescript
const token = await jwti.sign('payload', 'secret');

await jwti.invalidate(token);

const reverted = await jwti.revert(token);

// Outputs 'payload'
await jwti.verify(token);
```

## user

```typescript
const token = await jwti.sign('payload', 'secret', { user: 1 });

await jwti.invalidate({ user: 1 });

const reverted = await jwti.revert({ user: 1 });

// Outputs 'payload'
console.log(await jwti.verify(token));
```

## client

```typescript
const token = await jwti.sign('payload', 'secret', { client: 'mobile' });

await jwti.invalidate({ client: 'mobile' });

const reverted = await jwti.revert({ client: 'mobile' });

// Outputs 'payload'
console.log(await jwti.verify(token));
```

## user-client comabination

```typescript
const token = await jwti.sign('payload', 'secret', {
  user: 1,
  client: 'mobile',
});

await jwti.invalidate({ user: 1, client: 'mobile' });

const reverted = await jwti.revert({ user: 1, client: 'mobile' });

// Outputs 'payload'
await jwti.verify(token);
```

#

### Quick reminder:

all new tokens (signed after an invalidation) will be valid

```typescript
const firstToken = await jwti.sign('payload', 'secret', { user: 1 });

await jwti.invalidate({ user: 1 });

const secondToken = await jwti.sign('payload', 'secret', { user: 1 });

// Throws an InvalidatedTokenError
console.log(await jwti.verify(firstToken));

// Outputs 'payload'
console.log(await jwti.verify(secondToken));
```
