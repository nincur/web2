# Deployment Guide - Render

## Pre-Deployment Checklist

✅ Code pushed to GitHub: https://github.com/nincur/web2
✅ Supabase database configured
✅ Auth0 applications created
✅ Local testing successful

---

## Deployment to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. **Sign up with GitHub** (easiest option)
4. Authorize Render to access your GitHub repositories

### Step 2: Create Web Service

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - Search for: `nincur/web2`
   - Click **"Connect"**

### Step 3: Configure Web Service

Render should auto-detect your `render.yaml`, but if not, configure manually:

**Basic Settings:**
- **Name:** `lotto-app` (or whatever you prefer)
- **Region:** Choose **Frankfurt (EU Central)** (closest to you)
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && npm start`

**Instance Type:**
- Select **Free** tier

### Step 4: Add Environment Variables

Click on **"Environment"** tab and add these variables:

```
NODE_ENV=production
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://postgres.gmabxwpfeykvgmqvoohi:WXnh3n7U@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# Auth0 OIDC
AUTH0_SECRET=938cdd16b6a17039627b9d3ba3a9de37e2892e5f85e7aa09c0986d88d2a29af0
AUTH0_CLIENT_ID=2n3Wm7oRykGUU5mAAorCulgW7rgaR0Ja
AUTH0_ISSUER_BASE_URL=https://dev-y0u48fv5p33d7tk4.us.auth0.com

# Auth0 M2M
AUTH0_M2M_DOMAIN=dev-y0u48fv5p33d7tk4.us.auth0.com
AUTH0_M2M_AUDIENCE=https://lotto-api
```

**IMPORTANT:** Leave `AUTH0_BASE_URL` and `APP_URL` empty for now - we'll add them after getting your Render URL.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (~5 minutes)
4. You'll get a URL like: `https://lotto-app-xxxx.onrender.com`

### Step 6: Update Environment Variables with Render URL

Once deployed, you need to add these two variables:

1. Go to your web service → **Environment**
2. Add:
   ```
   AUTH0_BASE_URL=https://your-app-name.onrender.com
   APP_URL=https://your-app-name.onrender.com
   ```
3. Click **"Save Changes"**
4. Render will automatically redeploy

### Step 7: Update Auth0 Callback URLs

**CRITICAL:** Go back to Auth0 and update your Regular Web Application:

1. Go to https://manage.auth0.com
2. **Applications** → **Applications** → **Lotto Web App**
3. Click **Settings** tab
4. Update these fields to include your Render URL:

**Allowed Callback URLs:**
```
http://localhost:3000/callback, https://your-app-name.onrender.com/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000, https://your-app-name.onrender.com
```

**Allowed Web Origins:**
```
http://localhost:3000, https://your-app-name.onrender.com
```

5. Click **"Save Changes"**

### Step 8: Test Production App

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Test user login
3. Test ticket submission
4. Test M2M endpoints using curl with your production URL

---

## Testing M2M in Production

Get an access token:
```bash
curl --request POST \
  --url https://dev-y0u48fv5p33d7tk4.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"h8hEkkUsL0tu8NbL3tIpHXr63T3Clfst",
    "client_secret":"GcCbwo-xFFVUcid_flGNurGVQ8Y6qb0HoENvNaalysc2RMHyuyIYNG-Yay1Zi7Am",
    "audience":"https://lotto-api",
    "grant_type":"client_credentials"
  }'
```

Test endpoints (replace `YOUR_TOKEN` and `YOUR_RENDER_URL`):
```bash
# Create new round
curl -X POST https://your-app.onrender.com/new-round \
  -H "Authorization: Bearer YOUR_TOKEN"

# Close round
curl -X POST https://your-app.onrender.com/close \
  -H "Authorization: Bearer YOUR_TOKEN"

# Store results
curl -X POST https://your-app.onrender.com/store-results \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"numbers": [5, 12, 23, 34, 39, 45]}'
```

---

## Troubleshooting

### "Application Error" on Render
- Check the **Logs** tab in Render dashboard
- Look for environment variable errors
- Verify all required env vars are set

### Auth0 Login Not Working
- Double-check callback URLs in Auth0
- Make sure `AUTH0_BASE_URL` matches your Render URL exactly
- Check Render logs for auth errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Render environment
- Check Supabase project is active
- Test database connection in Render shell

### M2M Endpoints Return 401
- Verify `AUTH0_M2M_DOMAIN` and `AUTH0_M2M_AUDIENCE` are correct
- Test token generation with curl
- Check that M2M app is authorized for the API in Auth0

---

## Important Notes

### Free Tier Limitations
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid tier for always-on service

### Supabase Free Tier
- Projects pause after 7 days of inactivity
- Database has storage limits
- Good for development/testing

---

## Final Deliverables for Assignment

When submitting your assignment, provide:

1. **GitHub Repository URL:**
   ```
   https://github.com/nincur/web2
   ```

2. **Application URL:**
   ```
   https://your-app-name.onrender.com
   ```

3. **Test User Credentials:**
   ```
   Email: test@lotto.com
   Password: TestPass123!
   ```

4. **M2M Credentials:**
   ```
   Auth0 Tenant: https://dev-y0u48fv5p33d7tk4.us.auth0.com
   Audience: https://lotto-api
   Client ID: h8hEkkUsL0tu8NbL3tIpHXr63T3Clfst
   Client Secret: GcCbwo-xFFVUcid_flGNurGVQ8Y6qb0HoENvNaalysc2RMHyuyIYNG-Yay1Zi7Am
   ```

---

## Success! 🎉

Your lotto application is fully deployed and ready for use!
