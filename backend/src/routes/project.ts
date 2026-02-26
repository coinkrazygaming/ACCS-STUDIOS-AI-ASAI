import express, { Router, Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { db } from '../index.js';
import { verifyAuth } from '../middleware/auth.js';

export const projectRouter = Router();

// Push project files to GitHub
projectRouter.post('/:projectId/github/push', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { owner, repo, branch = 'main', message = 'Update from Smart AI Builder', files } = req.body;
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

    // Initialize Octokit with user's token
    const octokit = new Octokit({ auth: githubToken });

    // Get files from Firestore if not provided in request
    let filesToCommit = files;
    if (!filesToCommit) {
      const filesSnapshot = await db.collection('projects').doc(projectId).collection('files').get();
      filesToCommit = filesSnapshot.docs.map(doc => ({
        path: doc.data().path,
        content: doc.data().content || '',
        type: doc.data().type,
      }));
    }

    // Get the latest commit SHA for the branch
    const refResponse = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const latestCommitSha = refResponse.data.object.sha;

    // Get the tree SHA from the latest commit
    const commitResponse = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });

    const baseTreeSha = commitResponse.data.tree.sha;

    // Create blobs and tree entries for all files
    const treeEntries: any[] = [];

    for (const file of filesToCommit) {
      if (file.type === 'file') {
        // Create blob for file content
        const blobResponse = await octokit.git.createBlob({
          owner,
          repo,
          content: file.content,
          encoding: 'utf-8',
        });

        treeEntries.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobResponse.data.sha,
        });
      }
    }

    // Create a new tree with the updated files
    const treeResponse = await octokit.git.createTree({
      owner,
      repo,
      tree: treeEntries,
      base_tree: baseTreeSha,
    });

    // Create a new commit
    const newCommitResponse = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: treeResponse.data.sha,
      parents: [latestCommitSha],
    });

    // Update the branch reference to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitResponse.data.sha,
    });

    // Update project with latest push info
    await projectRef.update({
      'github.lastPushedAt': new Date(),
      'github.lastCommitSha': newCommitResponse.data.sha,
      'github.lastCommitUrl': newCommitResponse.data.html_url,
    });

    res.json({
      success: true,
      message: 'Changes pushed to GitHub successfully',
      commit: {
        sha: newCommitResponse.data.sha,
        url: newCommitResponse.data.html_url,
        message: newCommitResponse.data.message,
      },
    });
  } catch (error: any) {
    console.error('Push error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get GitHub repository info
projectRouter.get('/:projectId/github/repos', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
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

    // Get user's repositories
    const octokit = new Octokit({ auth: githubToken });
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      type: 'owner',
      per_page: 100,
    });

    res.json({
      repositories: repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
      })),
    });
  } catch (error: any) {
    console.error('Repos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Configure GitHub repo for a project
projectRouter.post('/:projectId/github/configure', verifyAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { owner, repo, branch = 'main' } = req.body;
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

    // Verify repo access
    const octokit = new Octokit({ auth: githubToken });
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    // Update project with GitHub repo config
    await projectRef.update({
      'github.owner': owner,
      'github.repo': repo,
      'github.branch': branch,
      'github.repoId': repoData.id,
      'github.configuredAt': new Date(),
    });

    res.json({
      success: true,
      message: 'Repository configured successfully',
      config: {
        owner,
        repo,
        branch,
        defaultBranch: repoData.default_branch,
      },
    });
  } catch (error: any) {
    console.error('Configure error:', error);
    res.status(500).json({ error: error.message });
  }
});
