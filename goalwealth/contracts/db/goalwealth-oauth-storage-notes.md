# GoalWealth OAuth Storage Notes

This note explains what OAuth/OIDC data belongs in PostgreSQL versus configuration/secret stores.

## Store in PostgreSQL

### `user_identities`
Use PostgreSQL to persist durable external identity linkage:
- `provider` (example: `google`)
- `provider_subject` (Google `sub`)
- `issuer`
- `provider_email`
- `email_verified`
- `linked_at`
- `last_login_at`

Why:
- this is business identity linkage
- it lets the backend map an incoming verified token to the internal `users.id`
- this data is stable enough to persist as canonical product identity state

## Do NOT store in PostgreSQL product tables

These belong in environment config / secret storage, not product schema:
- Google web client id
- Google Android client id
- OAuth client secret
- redirect URIs
- PKCE verifier/state
- provider JWKS URL
- tokeninfo URL
- allowed audiences list

Why:
- these are auth configuration values, not user/business data
- secrets must not be mixed into product tables
- configuration changes should not require schema/data changes

## Recommended storage locations

### Non-secret config
Store in:
- environment variables
- AWS Systems Manager Parameter Store

Examples:
- allowed audience/client ids
- issuer URL
- JWKS URL
- tokeninfo URL

### Secrets
Store in:
- AWS Secrets Manager

Examples:
- OAuth client secret
- encrypted refresh-token key material if later needed

## Optional later PostgreSQL tables

Only add these if backend auth/session behavior needs them:

### `auth_sessions`
Use when:
- backend issues/keeps its own sessions
- you want revocation/expiry tracking in DB

### `oauth_refresh_tokens`
Use when:
- backend intentionally stores provider refresh tokens
- encrypted-at-rest token persistence is part of product design

Current recommendation:
- keep them out of DDL v1
- add only when the backend flow truly requires them
