# 📮 Postman Collection for Auth API

This directory contains a complete Postman collection for testing the authentication backend API.

## 📦 Files

- **Auth API.postman_collection.json** - Main Postman collection with all endpoints
- **Environment.postman_environment.json** - Postman environment variables
- **README.md** - This file

## 🚀 Quick Start

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Auth API.postman_collection.json`
4. Click **Import**

### 2. Import Environment

1. Click **Import** button
2. Select `Environment.postman_environment.json`
3. Click **Import**
4. Select the environment from the dropdown (top right)

### 3. Configure Environment

The environment comes with default values, but you can customize:

- **base_url**: API base URL (default: `http://localhost:3000`)
- **access_token**: Auto-populated after login/register
- **refresh_token**: Auto-populated after login/register
- **user_id**: Auto-populated after login/register

## 📋 Collection Structure

### Authentication Endpoints

1. **Register** - Create a new user account
2. **Login** - Authenticate with email/password
3. **Refresh Token** - Get new access token
4. **Get Current User** - Get authenticated user info
5. **Logout** - Logout current session
6. **Logout All Devices** - Revoke all sessions

### Health Check

- **Health Check** - Server health status

## ✨ Features

### Auto Token Management

The collection automatically:

- ✅ Saves tokens after login/register
- ✅ Updates tokens after refresh
- ✅ Clears tokens after logout
- ✅ Uses tokens in authenticated requests

### Automated Tests

Each request includes automated tests that verify:

- ✅ Status codes
- ✅ Response structure
- ✅ Data validation
- ✅ Token rotation (for refresh endpoint)

### Documentation

Every endpoint includes:

- 📝 Detailed description
- 🔒 Security notes
- 📊 Response examples
- ⚠️ Error scenarios

## 🔄 Usage Flow

### 1. Register a New User

```
POST /api/auth/register
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**What happens:**

- Creates new user
- Generates tokens
- Saves tokens to environment variables
- Runs automated tests

### 2. Login (Alternative)

```
POST /api/auth/login
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**What happens:**

- Authenticates user
- Generates tokens
- Saves tokens to environment variables

### 3. Get Current User

```
GET /api/auth/me
```

**Headers:**

```
Authorization: Bearer {{access_token}}
```

**What happens:**

- Uses saved access token
- Returns user information
- Validates response

### 4. Refresh Token

```
POST /api/auth/refresh
```

**Body:**

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

**What happens:**

- Uses saved refresh token
- Gets new tokens (with rotation)
- Updates environment variables
- Verifies token rotation

### 5. Logout

```
POST /api/auth/logout
```

**Headers:**

```
Authorization: Bearer {{access_token}}
```

**Body:**

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

**What happens:**

- Revokes refresh token
- Clears environment variables

## 🧪 Testing Scenarios

### Happy Path

1. Register → Get tokens
2. Get Current User → Verify user data
3. Refresh Token → Get new tokens
4. Get Current User → Still works
5. Logout → Tokens cleared

### Error Scenarios

#### Invalid Credentials

```
POST /api/auth/login
{
  "email": "wrong@example.com",
  "password": "wrong"
}
```

Expected: `401 Unauthorized`

#### Expired Token

```
GET /api/auth/me
Authorization: Bearer expired_token
```

Expected: `401 Unauthorized`

#### Rate Limiting

Make 6 login attempts in 15 minutes
Expected: `429 Too Many Requests` on 6th attempt

#### Invalid Refresh Token

```
POST /api/auth/refresh
{
  "refreshToken": "invalid_token"
}
```

Expected: `401 Unauthorized`

## 📊 Environment Variables

| Variable        | Description      | Auto-set? |
| --------------- | ---------------- | --------- |
| `base_url`      | API base URL     | ❌ Manual |
| `access_token`  | JWT access token | ✅ Auto   |
| `refresh_token` | Refresh token    | ✅ Auto   |
| `user_id`       | User UUID        | ✅ Auto   |

## 🔧 Customization

### Change Base URL

1. Select environment
2. Edit `base_url` variable
3. Save

### Add Custom Headers

1. Open request
2. Go to **Headers** tab
3. Add custom headers

### Modify Tests

1. Open request
2. Go to **Tests** tab
3. Edit JavaScript code
4. Save

## 📝 Notes

### Token Storage

- Tokens are stored in environment variables
- They persist across requests
- Automatically cleared on logout

### Cookie Support

The server sets HttpOnly cookies, but Postman:

- Can send cookies if configured
- Also accepts tokens in Authorization header
- Collection uses Bearer token for clarity

### Rate Limiting

- Auth endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Tests may hit rate limits if run repeatedly

## 🐛 Troubleshooting

### Tokens Not Saving

- Check environment is selected
- Verify tests are running (check console)
- Ensure response has `success: true`

### 401 Unauthorized

- Token may be expired (refresh it)
- Token may be invalid (login again)
- Check Authorization header format

### 429 Too Many Requests

- Wait 15 minutes
- Or restart server (if rate limit is in-memory)

### Connection Refused

- Ensure server is running
- Check `base_url` is correct
- Verify port is not blocked

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/)
- [API Documentation](../README.md)
- [Architecture Documentation](../ARCHITECTURE.md)

## 🎯 Best Practices

1. **Use Environment Variables** - Don't hardcode values
2. **Run Tests** - Verify responses automatically
3. **Check Console** - See logs and warnings
4. **Save Examples** - Save successful responses
5. **Document Changes** - Update descriptions if needed

---

**Happy Testing! 🚀**
