import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { db } from '../index.js';
import { verifyAuth } from '../middleware/auth.js';

export const githubRouter = Router();

// Start OAuth flow
githubRouter.post('/oauth/start', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.SERVER_URL}/api/github/oauth/callback`;
  const scope = 'repo,user';

  if (!clientId) {
    return res.status(500).json({ error: 'GitHub client ID not configured' });
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${req.body.projectId}`;
  res.json({ url: authUrl });
});

// Handle OAuth callback
githubRouter.post('/oauth/callback', verifyAuth, async (req: Request, res: Response) => {
  const { code, projectId } = req.body;
  const userId = (req as any).userId;

  if (!code || !projectId) {
    return res.status(400).json({ error: 'Missing code or projectId' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.SERVER_URL}/api/github/oauth/callback`,
    }, {
      headers: { Accept: 'application/json' },
    });

    const { access_token, error } = tokenResponse.data;

    if (error) {
      return res.status(400).json({ error });
    }

    // Get GitHub user info
    const octokit = new Octokit({ auth: access_token });
    const { data: githubUser } = await octokit.users.getAuthenticated();

    // Store GitHub connection in Firestore
    const projectRef = db.collection('projects').doc(projectId);
    await projectRef.update({
      github: {
        connected: true,
        username: githubUser.login,
        userId: githubUser.id,
        connectedAt: new Date(),
        token: access_token, // Store securely - in production, use encryption
      },
    });

    res.json({
      success: true,
      message: 'GitHub connected successfully',
      github: {
        username: githubUser.login,
        name: githubUser.name,
        avatar: githubUser.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect GitHub
githubRouter.post('/:projectId/disconnect', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = (req as any).userId;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify user owns the project
    if (projectDoc.data()?.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await projectRef.update({
      github: {
        connected: false,
        disconnectedAt: new Date(),
      },
    });

    res.json({ success: true, message: 'GitHub disconnected' });
  } catch (error: any) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get GitHub connection status
githubRouter.get('/:projectId/status', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const github = projectDoc.data()?.github || {};

    res.json({
      connected: github.connected || false,
      username: github.username,
      name: github.name,
      avatar: github.avatar,
      connectedAt: github.connectedAt,
    });
  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});
