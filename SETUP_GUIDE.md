# Setup Guide

## 1. Supabase Database Setup

### Create Supabase Project
1. Go to https://supabase.com
2. Sign in and click "New Project"
3. Fill in:
   - Project name: `lotto-app`
   - Database Password: (save this!)
   - Region: Choose closest to you (e.g., Europe West)
4. Click "Create new project" and wait ~2 minutes

### Get Connection String
1. In your project, go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Select **URI** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### Test Connection
You can test your connection string works:
```bash
npm run prisma:generate
DATABASE_URL="your-connection-string-here" npx prisma db push
```

---

## 2. Auth0 Setup

### Part A: Create Auth0 Account & Tenant
1. Go to https://auth0.com
2. Sign up for free account
3. Choose a tenant domain (e.g., `lotto-app-yourname`)
   - This becomes: `lotto-app-yourname.auth0.com`

### Part B: Regular Web Application (for end-users)
1. Go to **Applications** → **Applications**
2. Click "Create Application"
3. Name: `Lotto Web App`
4. Type: Select **Regular Web Applications**
5. Click "Create"

**Configure Settings:**
- **Allowed Callback URLs**:
  ```
  http://localhost:3000/callback, https://your-app.onrender.com/callback
  ```
- **Allowed Logout URLs**:
  ```
  http://localhost:3000, https://your-app.onrender.com
  ```
- **Allowed Web Origins**:
  ```
  http://localhost:3000, https://your-app.onrender.com
  ```
- Click "Save Changes"

**Note these values:**
- Domain: `your-tenant.auth0.com`
- Client ID: `abc123...`
- Client Secret: (not needed for OIDC, but note it exists)

### Part C: Create API (for M2M protection)
1. Go to **Applications** → **APIs**
2. Click "Create API"
3. Fill in:
   - Name: `Lotto API`
   - Identifier: `https://lotto-api` (this is your audience)
   - Signing Algorithm: `RS256`
4. Click "Create"

**Note these values:**
- Identifier: `https://lotto-api` (this is your AUTH0_M2M_AUDIENCE)

### Part D: Create Machine to Machine Application
1. Go to **Applications** → **Applications**
2. Click "Create Application"
3. Name: `Lotto M2M Client`
4. Type: Select **Machine to Machine Applications**
5. Select your API: `Lotto API`
6. Click "Authorize" (you can grant all permissions or none - doesn't matter for this use case)
7. Click "Create"

**Note these values:**
- Client ID: `xyz789...`
- Client Secret: `abc123def456...`

**Test M2M Token (optional):**
```bash
curl --request POST \
  --url https://YOUR-TENANT.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_M2M_CLIENT_ID",
    "client_secret":"YOUR_M2M_CLIENT_SECRET",
    "audience":"https://lotto-api",
    "grant_type":"client_credentials"
  }'
```

### Part E: Create Test User
1. Go to **User Management** → **Users**
2. Click "Create User"
3. Fill in:
   - Email: `test@example.com`
   - Password: (create a strong password)
   - Connection: `Username-Password-Authentication`
4. Click "Create"

**Save these credentials - you'll need them for testing!**

---

## 3. Environment Variables

Create a `.env` file in the project root with all your credentials:

```env
# Node environment
NODE_ENV=development
PORT=3000

# Database (from Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Auth0 OIDC (from Regular Web Application)
AUTH0_SECRET=your-super-secret-key-min-32-characters-long-replace-this-with-random-string
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=abc123fromauth0
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com

# Auth0 M2M (from API and M2M Application)
AUTH0_M2M_DOMAIN=your-tenant.auth0.com
AUTH0_M2M_AUDIENCE=https://lotto-api

# Public app URL
APP_URL=http://localhost:3000
```

**Generate AUTH0_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Initialize Database

Once you have DATABASE_URL in .env:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# Or for first time setup
npx prisma migrate dev --name init
```

---

## 5. Run Locally

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 6. Testing M2M Endpoints

### Get M2M Access Token
```bash
curl --request POST \
  --url https://YOUR-TENANT.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_M2M_CLIENT_ID",
    "client_secret":"YOUR_M2M_CLIENT_SECRET",
    "audience":"https://lotto-api",
    "grant_type":"client_credentials"
  }'
```

This returns:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

### Test Endpoints

**Create new round:**
```bash
curl -X POST http://localhost:3000/new-round \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Close round:**
```bash
curl -X POST http://localhost:3000/close \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Store results:**
```bash
curl -X POST http://localhost:3000/store-results \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"numbers": [5, 12, 23, 34, 39, 45]}'
```

---

## 7. Deploy to Render

### Prepare for Deployment
1. Make sure code is pushed to GitHub
2. Update `render.yaml` if needed (region, etc.)

### Create Render Account & Deploy
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Blueprint"
4. Connect your GitHub repository: `nincur/web2`
5. Render will detect `render.yaml` automatically
6. Click "Apply"

### Add Environment Variables
In Render dashboard, go to your web service → Environment:
- Add all variables from your `.env` file
- Update `AUTH0_BASE_URL` to your Render URL (e.g., `https://lotto-app.onrender.com`)
- Update `APP_URL` to same URL
- `DATABASE_URL` will be auto-filled from database connection

### Update Auth0 Callbacks
Go back to Auth0 and add your Render URL to:
- Allowed Callback URLs: `https://your-app.onrender.com/callback`
- Allowed Logout URLs: `https://your-app.onrender.com`
- Allowed Web Origins: `https://your-app.onrender.com`

### Deploy
Render will automatically deploy. Check the logs for any errors.

---

## Troubleshooting

### "Invalid environment variables"
- Check that all required variables in `.env.example` are in your `.env`
- Make sure URLs are valid (start with http:// or https://)
- AUTH0_SECRET must be at least 32 characters

### "Cannot connect to database"
- Verify DATABASE_URL is correct
- Make sure your IP is allowed in Supabase (check Settings → Database → Connection Pooling)
- Test connection: `npx prisma db push`

### "UnauthorizedError: Invalid token"
- Make sure M2M token is fresh (they expire)
- Verify AUTH0_M2M_DOMAIN and AUTH0_M2M_AUDIENCE match your Auth0 API settings
- Check that M2M application is authorized to access your API

### "No active round available"
- You need to create a round first using `/new-round` endpoint
- Make sure you're sending the M2M token correctly

---

## Quick Start Checklist

- [ ] Supabase project created, connection string obtained
- [ ] Auth0 tenant created
- [ ] Auth0 Regular Web Application configured
- [ ] Auth0 API created
- [ ] Auth0 M2M Application created
- [ ] Test user created in Auth0
- [ ] `.env` file created with all credentials
- [ ] `npm run prisma:generate` executed
- [ ] `npm run prisma:migrate` executed
- [ ] `npm run dev` works locally
- [ ] Can login with test user
- [ ] Can create round with M2M token
- [ ] Can submit ticket
- [ ] Code pushed to GitHub
- [ ] Render deployment configured
- [ ] Production URLs added to Auth0

---

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test Auth0 token generation using curl
4. Check Prisma connection with `npx prisma db push`
