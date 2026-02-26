import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import Spinner from './ui/Spinner';
import {
  startGitHubOAuth,
  getGitHubStatus,
  disconnectGitHub,
  getGitHubRepositories,
  configureGitHubRepo,
  pushToGitHub,
} from '../services/githubService';
import { useAuth } from '../hooks/useAuth';
import AlertModal from './ui/AlertModal';

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  files: any[];
}

type Step = 'connect' | 'configure' | 'push';

const GitHubIntegrationModal: React.FC<GitHubIntegrationModalProps> = ({
  isOpen,
  onClose,
  project,
  files,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gitHubStatus, setGitHubStatus] = useState<any>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('Update from Smart AI Builder');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && project.id) {
      loadGitHubStatus();
    }
  }, [isOpen, project.id]);

  const loadGitHubStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getGitHubStatus(project.id);
      setGitHubStatus(status);

      if (status.connected) {
        setStep('configure');
        loadRepositories();
      } else {
        setStep('connect');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      const repos = await getGitHubRepositories(project.id);
      setRepositories(repos.repositories || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authUrl = await startGitHubOAuth(project.id);

      // Open GitHub OAuth in new window
      const width = 500;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'github-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll for OAuth completion
      const interval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(interval);
          // Reload status after OAuth
          await new Promise(resolve => setTimeout(resolve, 1000));
          loadGitHubStatus();
        }
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!window.confirm('Are you sure you want to disconnect GitHub?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await disconnectGitHub(project.id);
      setGitHubStatus(null);
      setStep('connect');
      setSuccessMessage('GitHub disconnected');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigureRepo = async () => {
    if (!selectedRepo) {
      setError('Please select a repository');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [owner, repo] = selectedRepo.split('/');
      await configureGitHubRepo(project.id, owner, repo, selectedBranch);

      setStep('push');
      setSuccessMessage('Repository configured successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToGitHub = async () => {
    if (!selectedRepo) {
      setError('Please select a repository');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [owner, repo] = selectedRepo.split('/');

      // Format files for push
      const formattedFiles = files.map(file => ({
        path: file.path,
        content: file.content || '',
        type: file.type,
      }));

      const result = await pushToGitHub(
        project.id,
        owner,
        repo,
        formattedFiles,
        commitMessage
      );

      setSuccessMessage(`Changes pushed successfully! Commit: ${result.commit.sha.substring(0, 7)}`);
      setCommitMessage('Update from Smart AI Builder');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">GitHub Integration</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {isLoading && <Spinner />}

            {!isLoading && step === 'connect' && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect your GitHub account to push project changes directly to your repositories.
                </p>
                <button
                  onClick={handleConnectGitHub}
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  Connect GitHub Account
                </button>
              </div>
            )}

            {!isLoading && step === 'configure' && gitHubStatus?.connected && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="font-semibold text-blue-900">
                    Connected as: @{gitHubStatus.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Repository</label>
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Choose a repository...</option>
                    {repositories.map((repo) => (
                      <option key={repo.id} value={`${repo.owner}/${repo.name}`}>
                        {repo.owner}/{repo.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Branch</label>
                  <input
                    type="text"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    placeholder="main"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfigureRepo}
                    disabled={isLoading || !selectedRepo}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    Configure Repository
                  </button>
                  <button
                    onClick={handleDisconnectGitHub}
                    disabled={isLoading}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            {!isLoading && step === 'push' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="font-semibold text-green-900">
                    Ready to push to {selectedRepo}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Commit Message</label>
                  <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 h-20"
                    placeholder="Describe your changes..."
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-2">Files to push: {files.length}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handlePushToGitHub}
                    disabled={isLoading || !commitMessage.trim()}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    Push to GitHub
                  </button>
                  <button
                    onClick={() => setStep('configure')}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GitHubIntegrationModal;
