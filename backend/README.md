# Smart AI Builder Backend

Backend service for Smart AI Builder with GitHub integration, OAuth authentication, and project management.

## Features

- GitHub OAuth integration
- Secure commit creation and push to GitHub
- Pull request management
- Firebase Authentication integration
- RESTful API with TypeScript

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Fill in your credentials (see [GITHUB_INTEGRATION_SETUP.md](./GITHUB_INTEGRATION_SETUP.md) for detailed instructions).

### 3. Start Development Server

```bash
npm run dev
```

The server will start on port 5000 (or the PORT in your `.env`).

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── routes/
│   │   ├── github.ts         # GitHub OAuth and connection endpoints
│   │   ├── github-pr.ts      # Pull request management
│   │   └── project.ts        # Project-specific GitHub operations
│   └── middleware/
│       └── auth.ts           # Firebase auth verification
├── package.json
├── tsconfig.json
└── .env.example              # Environment variables template
```

## API Documentation

### Authentication

All API endpoints (except `/health`) require Firebase ID token in Authorization header:

```
Authorization: Bearer {firebase_id_token}
```

### GitHub Integration Endpoints

#### Connect GitHub Account
- **POST** `/api/github/oauth/start`
- **Body**: `{ projectId: string }`
- **Returns**: `{ url: string }` - OAuth redirect URL

#### Handle OAuth Callback
- **POST** `/api/github/oauth/callback`
- **Body**: `{ code: string, projectId: string }`
- **Returns**: User info and connection status

#### Get Connection Status
- **GET** `/api/github/:projectId/status`
- **Returns**: Connection status, username, avatar

#### Disconnect GitHub
- **POST** `/api/github/:projectId/disconnect`
- **Returns**: `{ success: true }`

### Repository Management

#### Get User's Repositories
- **GET** `/api/projects/:projectId/github/repos`
- **Returns**: Array of repositories with metadata

#### Configure Repository
- **POST** `/api/projects/:projectId/github/configure`
- **Body**: `{ owner: string, repo: string, branch?: string }`
- **Returns**: Configuration confirmation

#### Push to GitHub
- **POST** `/api/projects/:projectId/github/push`
- **Body**: 
  ```json
  {
    "owner": "username",
    "repo": "repo-name",
    "branch": "main",
    "message": "Commit message",
    "files": [
      { "path": "src/App.tsx", "content": "...", "type": "file" }
    ]
  }
  ```
- **Returns**: Commit info with SHA and URL

### Pull Request Management

#### Create Pull Request
- **POST** `/api/projects/:projectId/github/create-pr`
- **Body**:
  ```json
  {
    "owner": "username",
    "repo": "repo-name",
    "branch": "feature/new-feature",
    "baseBranch": "main",
    "title": "Add new feature",
    "description": "Detailed description"
  }
  ```
- **Returns**: PR number, title, and URL

#### List Pull Requests
- **GET** `/api/projects/:projectId/github/prs?owner=username&repo=repo-name&state=open`
- **Returns**: Array of pull requests

## Security

- Firebase ID tokens are verified on all protected endpoints
- GitHub tokens are stored securely (consider adding encryption for production)
- OAuth uses GitHub's secure flow
- All user operations are verified against project ownership

## Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Other Platforms

- **Heroku**: Replace `npm run dev` with `npm start` in Procfile
- **Vercel**: Use serverless functions for each endpoint
- **AWS Lambda**: Package and deploy with AWS SDK

See [GITHUB_INTEGRATION_SETUP.md](./GITHUB_INTEGRATION_SETUP.md#step-6-deployment-to-railway) for detailed deployment instructions.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `SERVER_URL` | Backend server URL | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (with `\n` as `\\n`) | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | Yes |

## Troubleshooting

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### Firebase Auth Errors
- Verify FIREBASE_PRIVATE_KEY format (replace newlines with `\\n`)
- Check that Firebase project ID matches your console project

### GitHub OAuth Errors
- Verify GitHub callback URL matches in OAuth app settings
- Ensure client ID and secret are correct

### CORS Errors
- Update CLIENT_URL in .env to match your frontend URL
- Restart the server after changing environment variables

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
The project uses TypeScript strict mode. Code is checked on startup.

## License

MIT
