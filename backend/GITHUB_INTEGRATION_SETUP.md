# GitHub Integration Setup Guide

This guide will help you set up the GitHub integration for the Smart AI Builder backend.

## Prerequisites

- Node.js 18+ installed
- A GitHub account
- A Firebase project with Firestore enabled
- Railway account (or other deployment service)

## Step 1: Create a GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Smart AI Builder
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:5173` for development)
   - **Authorization callback URL**: `https://yourdomain.com/api/github/oauth/callback` (or `http://localhost:5000/api/github/oauth/callback` for development)
4. Click "Register application"
5. You'll be shown:
   - **Client ID**
   - **Client Secret** (click "Generate a new client secret")

## Step 2: Configure Environment Variables

1. Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
# Server Configuration
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Getting Firebase Credentials

1. Go to Firebase Console
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Copy the values:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the `\n` characters as `\\n`)
   - `client_email` → FIREBASE_CLIENT_EMAIL

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

## Step 4: Start the Backend Server

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Step 5: Update Client Configuration

In your frontend `.env` or configuration file, set:
```
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```
REACT_APP_API_URL=https://yourdomain.com/api
```

## Step 6: Deployment to Railway

1. Push your code to GitHub
2. Go to https://railway.app
3. Create a new project
4. Select "Deploy from GitHub"
5. Choose your repository
6. Add environment variables:
   - Copy all variables from your `.env` file
   - Set `SERVER_URL` to your Railway URL
7. Deploy

## API Endpoints

### GitHub OAuth Flow

**Start OAuth**
- Method: `POST /api/github/oauth/start`
- Body: `{ projectId: string }`
- Returns: `{ url: string }`

**Handle Callback**
- Method: `POST /api/github/oauth/callback`
- Headers: `Authorization: Bearer {firebase_token}`
- Body: `{ code: string, projectId: string }`
- Returns: GitHub user info

**Disconnect GitHub**
- Method: `POST /api/github/:projectId/disconnect`
- Headers: `Authorization: Bearer {firebase_token}`
- Returns: `{ success: true }`

**Get GitHub Status**
- Method: `GET /api/github/:projectId/status`
- Headers: `Authorization: Bearer {firebase_token}`
- Returns: Connection status and username

### Project Operations

**Get Repositories**
- Method: `GET /api/projects/:projectId/github/repos`
- Headers: `Authorization: Bearer {firebase_token}`
- Returns: List of user's repositories

**Configure Repository**
- Method: `POST /api/projects/:projectId/github/configure`
- Headers: `Authorization: Bearer {firebase_token}`
- Body: `{ owner: string, repo: string, branch?: string }`
- Returns: Configuration confirmation

**Push to GitHub**
- Method: `POST /api/projects/:projectId/github/push`
- Headers: `Authorization: Bearer {firebase_token}`
- Body: `{ owner: string, repo: string, branch?: string, message?: string, files?: array }`
- Returns: Commit info with URL

## Security Considerations

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Keep secrets secure** - Use environment variables, not hardcoded values
3. **Token storage** - Currently stores tokens in Firestore; consider encryption for production
4. **OAuth scopes** - Limited to `repo` and `user` scopes
5. **User verification** - All endpoints verify Firebase auth token

## Troubleshooting

### "GitHub not connected" error
- Make sure you've completed the OAuth flow
- Check that the token is stored in Firestore project.github.token

### "Failed to push to GitHub"
- Verify the repository owner and name are correct
- Ensure the branch exists or main/master exists
- Check that your GitHub token has repo access

### "Invalid or expired token" error
- Re-authenticate with GitHub
- Disconnect and reconnect the account

## Next Steps

1. Test the OAuth flow in development
2. Test pushing a small project to GitHub
3. Deploy the backend to Railway
4. Update frontend API URL for production
5. Test the full integration in production
