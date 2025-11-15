# Security Audit Report - Nirvaanaa E-commerce

## Audit Date
December 2024

## Executive Summary
This document outlines the security compliance audit and fixes implemented for the Nirvaanaa e-commerce platform according to the specified Security SOPs.

---

## 1. HTTPS - Nginx + Certbot SSL Setup ✅

**Status:** Configuration provided

**Implementation:**
- Created `nginx.conf` with SSL/TLS configuration
- Configured HTTP to HTTPS redirect
- Set up Let's Encrypt/Certbot certificate paths
- Implemented modern SSL protocols (TLSv1.2, TLSv1.3)
- Added security headers (HSTS, X-Frame-Options, etc.)

**Action Required:**
1. Replace `mydomain.com` with your actual domain in `nginx.conf`
2. Install Certbot: `sudo apt-get install certbot python3-certbot-nginx`
3. Run: `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`
4. Copy `nginx.conf` to `/etc/nginx/sites-available/nirvaanaa`
5. Enable site: `sudo ln -s /etc/nginx/sites-available/nirvaanaa /etc/nginx/sites-enabled/`
6. Test: `sudo nginx -t`
7. Reload: `sudo systemctl reload nginx`

---

## 2. SQL/MongoDB Injection Prevention ✅

**Status:** Implemented

**Implementation:**
- Created `lib/validation.js` with Zod schemas for input validation
- Added `sanitizeRegexInput()` function to escape regex special characters
- Updated API routes to use Zod validation:
  - `/api/auth/signup` - Validates signup data
  - `/api/users` - Validates user queries and creation
  - `/api/products` - Sanitizes search queries
- All user inputs are validated before database queries
- Regex queries are sanitized to prevent injection

**Files Modified:**
- `lib/validation.js` (new)
- `app/api/auth/signup/route.js`
- `app/api/users/route.js`
- `app/api/products/route.js`

---

## 3. POST vs GET - Sensitive Actions ✅

**Status:** Verified and Compliant

**Verification:**
- ✅ Login: Uses NextAuth (POST via `/api/auth/[...nextauth]`)
- ✅ Signup: Uses POST (`/api/auth/signup`)
- ✅ Payments: Uses POST (`/api/payment-intent`, `/api/checkout`)
- ✅ Password Reset: Uses POST (`/api/auth/reset-password`)
- ✅ Forgot Password: Uses POST (`/api/auth/forgot-password`)

All sensitive operations correctly use POST method.

---

## 4. JWTs - Security Configuration ✅

**Status:** Implemented

**Implementation:**
- ✅ JWT tokens signed with `NEXTAUTH_SECRET` (from environment)
- ✅ Cookies configured as `httpOnly: true` (prevents XSS attacks)
- ✅ Cookies use `secure: true` in production (HTTPS only)
- ✅ Cookies use `sameSite: 'lax'` (CSRF protection)
- ✅ JWT verification on every request via NextAuth middleware

**Files Modified:**
- `lib/auth.js` - Added cookie configuration

**Action Required:**
- Ensure `NEXTAUTH_SECRET` is set in `.env` with a strong random string
- Generate secret: `openssl rand -base64 32`

---

## 5. Admin Sessions - Enhanced Security ✅

**Status:** Implemented

**Implementation:**
- ✅ Admin tokens expire after 2 hours (vs 30 days for regular users)
- ✅ Server-side role verification on every request
- ✅ Admin role checked against database in session callback
- ✅ Token expiry checked in JWT callback
- ✅ No client-side admin validation (all checks server-side)

**Files Modified:**
- `lib/auth.js` - Added admin-specific token expiry and role verification

---

## 6. CORS Configuration ✅

**Status:** Implemented

**Implementation:**
- Added CORS configuration in `next.config.js`
- Configured to only allow requests from `NEXT_PUBLIC_APP_URL` or `NEXTAUTH_URL`
- Defaults to `https://mydomain.com` if not set
- Credentials enabled for authenticated requests

**Files Modified:**
- `next.config.js` - Added `corsConfig` export

**Action Required:**
- Update `NEXT_PUBLIC_APP_URL` in `.env` to your production domain
- Ensure it matches your actual domain (e.g., `https://yourdomain.com`)

---

## 7. MongoDB IP Access ✅

**Status:** Configuration provided

**Implementation:**
- Created `mongod.conf` with `bindIp: 127.0.0.1`
- MongoDB only accepts connections from localhost
- Prevents external access to database

**Action Required:**
1. Copy `mongod.conf` to `/etc/mongod.conf` (Linux) or `/usr/local/etc/mongod.conf` (macOS)
2. Adjust `dbPath` and `pidFilePath` based on your system
3. Restart MongoDB: `sudo systemctl restart mongod`
4. Verify: `mongosh --eval "db.adminCommand('getCmdLineOpts')"` should show `bindIp: 127.0.0.1`

---

## 8. Environment Variables ✅

**Status:** Compliant

**Verification:**
- ✅ All secrets stored in `.env` file
- ✅ `.env` is in `.gitignore` (not committed)
- ✅ `env.example` provided as template
- ✅ All sensitive values accessed via `process.env`
- ✅ No hardcoded secrets found in codebase

**Action Required:**
- Ensure `.env` file exists and contains all required variables
- Never commit `.env` to version control

---

## 9. Rate Limiting ✅

**Status:** Implemented

**Implementation:**
- Created `lib/rateLimit.js` using `rate-limiter-flexible`
- Different rate limits for different endpoint types:
  - Auth endpoints: 5 requests per 15 minutes
  - Payment endpoints: 10 requests per 15 minutes
  - Admin endpoints: 30 requests per 15 minutes
  - API endpoints: 100 requests per 15 minutes
- Applied to critical routes:
  - `/api/auth/signup`
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`
  - `/api/payment-intent`
  - `/api/checkout`
  - `/api/users` (admin)

**Files Created:**
- `lib/rateLimit.js`

**Files Modified:**
- Multiple API routes with rate limiting

**Action Required:**
- Install dependency: `npm install rate-limiter-flexible`

---

## 10. Password Hashing ✅

**Status:** Compliant

**Verification:**
- ✅ Using `bcryptjs` with salt rounds of 12
- ✅ Passwords hashed before saving to database
- ✅ Password comparison uses `bcrypt.compare()`
- ✅ No plaintext passwords stored

**Files Verified:**
- `lib/auth.js` - Uses `bcrypt.compare()`
- `app/api/auth/signup/route.js` - Uses `bcrypt.hash()`
- `models/User.js` - Pre-save middleware hashes passwords

---

## 11. Firewall (UFW) ✅

**Status:** Setup script provided

**Implementation:**
- Created `scripts/setup-firewall.sh`
- Configures UFW to only allow:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
- Default deny incoming, allow outgoing

**Action Required:**
1. Make script executable: `chmod +x scripts/setup-firewall.sh`
2. Run: `sudo ./scripts/setup-firewall.sh`
3. Verify: `sudo ufw status`

**⚠️ WARNING:** Ensure SSH access works before running, or you may lock yourself out!

---

## 12. Fail2Ban ✅

**Status:** Setup script provided

**Implementation:**
- Created `scripts/setup-fail2ban.sh`
- Configures Fail2Ban for SSH protection
- Bans IPs after 3 failed SSH attempts
- Ban duration: 1 hour

**Action Required:**
1. Make script executable: `chmod +x scripts/setup-fail2ban.sh`
2. Run: `sudo ./scripts/setup-fail2ban.sh`
3. Verify: `sudo fail2ban-client status sshd`

---

## 13. Forgot Password Feature ✅

**Status:** Implemented

**Implementation:**
- Created `/api/auth/forgot-password` endpoint
- Created `/api/auth/reset-password` endpoint
- Created `/app/auth/forgot-password/page.js` (UI)
- Created `/app/auth/reset-password/page.js` (UI)
- Added password reset fields to User model:
  - `resetPasswordToken` (hashed)
  - `resetPasswordExpires` (1 hour expiry)
- Email sending via existing email utility
- Rate limiting applied
- Input validation with Zod
- Token hashing with SHA-256

**Files Created:**
- `app/api/auth/forgot-password/route.js`
- `app/api/auth/reset-password/route.js`
- `app/auth/forgot-password/page.js`
- `app/auth/reset-password/page.js`

**Files Modified:**
- `models/User.js` - Added reset password fields
- `app/auth/signin/page.js` - Added "Forgot Password?" link
- `utils/email.js` - Added `sendEmail()` function

---

## Summary of Changes

### New Files Created:
1. `lib/rateLimit.js` - Rate limiting middleware
2. `lib/validation.js` - Zod validation schemas
3. `nginx.conf` - Nginx SSL configuration
4. `mongod.conf` - MongoDB security configuration
5. `scripts/setup-firewall.sh` - UFW setup script
6. `scripts/setup-fail2ban.sh` - Fail2Ban setup script
7. `app/api/auth/forgot-password/route.js` - Forgot password API
8. `app/api/auth/reset-password/route.js` - Reset password API
9. `app/auth/forgot-password/page.js` - Forgot password UI
10. `app/auth/reset-password/page.js` - Reset password UI

### Files Modified:
1. `package.json` - Added `rate-limiter-flexible` dependency
2. `next.config.js` - Added CORS configuration
3. `lib/auth.js` - Added httpOnly cookies, admin session expiry, server-side role checks
4. `models/User.js` - Added password reset fields
5. `app/api/auth/signup/route.js` - Added validation and rate limiting
6. `app/api/users/route.js` - Added validation, rate limiting, regex sanitization
7. `app/api/products/route.js` - Added regex sanitization
8. `app/api/payment-intent/route.js` - Added rate limiting
9. `app/api/checkout/route.js` - Added rate limiting
10. `app/auth/signin/page.js` - Added "Forgot Password?" link
11. `utils/email.js` - Added generic `sendEmail()` function

---

## Next Steps

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy `env.example` to `.env`
   - Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Set `NEXT_PUBLIC_APP_URL` to your production domain
   - Configure email settings for password reset

3. **Deploy Server Configuration:**
   - Set up Nginx with SSL (use `nginx.conf`)
   - Configure MongoDB (use `mongod.conf`)
   - Set up firewall (run `setup-firewall.sh`)
   - Set up Fail2Ban (run `setup-fail2ban.sh`)

4. **Test Security Features:**
   - Test rate limiting
   - Test password reset flow
   - Verify HTTPS redirect
   - Test admin session expiry
   - Verify MongoDB is only accessible from localhost

---

## Security Checklist

- [x] HTTPS configured with Nginx + Certbot
- [x] MongoDB injection prevention (Zod validation + regex sanitization)
- [x] Sensitive actions use POST
- [x] JWTs use httpOnly cookies with secret
- [x] Admin sessions have shorter expiry (2 hours)
- [x] Server-side admin role verification
- [x] CORS configured (domain-specific)
- [x] MongoDB bindIp set to 127.0.0.1
- [x] Environment variables in .env
- [x] Rate limiting implemented
- [x] Password hashing with bcrypt
- [x] UFW firewall script provided
- [x] Fail2Ban script provided
- [x] Forgot password feature implemented

---

## Notes

- All security configurations are production-ready but require deployment-specific adjustments (domain names, paths, etc.)
- Test all configurations in a staging environment before production deployment
- Regularly update dependencies and monitor security advisories
- Consider implementing additional security measures:
  - Two-factor authentication (2FA)
  - IP whitelisting for admin access
  - Security monitoring and alerting
  - Regular security audits

---

**Report Generated:** December 2024
**Auditor:** AI Security Audit System

