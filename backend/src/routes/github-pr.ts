import express, { Router, Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { db } from '../index.js';
import { verifyAuth } from '../middleware/auth.js';

export const githubPrRouter = Router();

// Create a pull request
githubPrRouter.post('/:projectId/github/create-pr', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { owner, repo, branch, baseBranch = 'main', title, description = '' } = req.body;
  const userId = (req as any).userId;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = projectDoc.data();

    // Verify user owns the project
    if (projectData?.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get GitHub token
    const githubToken = projectData?.github?.token;
    if (!githubToken) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    if (!branch || !title) {
      return res.status(400).json({ error: 'Missing required fields: branch, title' });
    }

    // Initialize Octokit
    const octokit = new Octokit({ auth: githubToken });

    // Create pull request
    const prResponse = await octokit.pulls.create({
      owner,
      repo,
      title,
      body: description,
      head: branch,
      base: baseBranch,
    });

    // Update project with PR info
    await projectRef.update({
      'github.lastPRUrl': prResponse.data.html_url,
      'github.lastPRCreatedAt': new Date(),
    });

    res.json({
      success: true,
      message: 'Pull request created successfully',
      pr: {
        number: prResponse.data.number,
        url: prResponse.data.html_url,
        title: prResponse.data.title,
      },
    });
  } catch (error: any) {
    console.error('PR creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pull requests for a repository
githubPrRouter.get('/:projectId/github/prs', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { owner, repo, state = 'open' } = req.query;
  const userId = (req as any).userId;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = projectDoc.data();

    // Verify user owns the project
    if (projectData?.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get GitHub token
    const githubToken = projectData?.github?.token;
    if (!githubToken) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Missing owner or repo query parameter' });
    }

    // Initialize Octokit
    const octokit = new Octokit({ auth: githubToken });

    // Get PRs
    const { data: prs } = await octokit.pulls.list({
      owner: owner as string,
      repo: repo as string,
      state: state as any,
      per_page: 20,
    });

    res.json({
      pullRequests: prs.map(pr => ({
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        state: pr.state,
        createdAt: pr.created_at,
        author: pr.user.login,
      })),
    });
  } catch (error: any) {
    console.error('PR fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});
