# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.3.x   | Yes        |
| < 0.3   | No        |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Email security findings to the maintainers. Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- The affected version(s)
- Any suggested remediation if known

You can expect an acknowledgement within 48 hours and a status update within 7 days.

## Scope

The following are in scope:

- Authentication and session handling (/api/auth/*)
- Admin routes that modify data (PATCH /api/db/tips/*/status, PATCH /api/db/stories/*/status)
- Whistleblower encryption and data handling
- API input validation and injection risks
- Rate limiting and denial-of-service vectors
- JWT token management (using jose library)

## Out of Scope

- Spam or low-impact social engineering
- Issues requiring physical access to a server
- Issues in third-party dependencies (report upstream)

## Security Architecture Notes

- Passwords are hashed with scrypt (N=16384, r=8, p=1)
- Sessions use HS256 JWT signed with a JWT_SECRET env variable
- Whistleblower submissions are encrypted client-side with AES-256-GCM (PBKDF2-derived key) before transmission
- API inputs are validated with Zod schemas on every route
- Structured logs automatically redact password, token, secret, authorization, description, and experience fields
- JWT Library: jose for secure JWT token generation and verification

## Dependencies

| Package | Purpose | Version |
|---|---|---|
| jose | JWT token handling | ^5.9.3 |
| @prisma/client | Database ORM | ^6.11.1 |
| prisma | Database CLI | ^6.11.1 |
| zod | Input validation | ^4.0.2 |