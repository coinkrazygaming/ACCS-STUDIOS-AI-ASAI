import { auth } from './firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function getGitHubAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

export async function startGitHubOAuth(projectId: string) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/github/oauth/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId }),
  });

  if (!response.ok) {
    throw new Error('Failed to start OAuth flow');
  }

  const data = await response.json();
  return data.url;
}

export async function handleGitHubOAuthCallback(code: string, projectId: string) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/github/oauth/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ code, projectId }),
  });

  if (!response.ok) {
    throw new Error('Failed to complete OAuth flow');
  }

  return response.json();
}

export async function getGitHubStatus(projectId: string) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/github/${projectId}/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get GitHub status');
  }

  return response.json();
}

export async function disconnectGitHub(projectId: string) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/github/${projectId}/disconnect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to disconnect GitHub');
  }

  return response.json();
}

export async function getGitHubRepositories(projectId: string) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/github/repos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }

  return response.json();
}

export async function configureGitHubRepo(
  projectId: string,
  owner: string,
  repo: string,
  branch: string = 'main'
) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/github/configure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ owner, repo, branch }),
  });

  if (!response.ok) {
    throw new Error('Failed to configure repository');
  }

  return response.json();
}

export async function pushToGitHub(
  projectId: string,
  owner: string,
  repo: string,
  files: any[],
  message: string = 'Update from Smart AI Builder'
) {
  const token = await getGitHubAuthToken();

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/github/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      owner,
      repo,
      message,
      files,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to push to GitHub');
  }

  return response.json();
}
