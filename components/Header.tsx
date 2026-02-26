import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, KeyIcon, CodeIcon, SettingsIcon, UndoIcon, RedoIcon, AnalyzeIcon, AiIcon, RobotIcon, WrenchScrewdriverIcon, ArrowLeftIcon, UserIcon, ShareIcon, CommandLineIcon, RocketIcon, ExternalLinkIcon, PaintBrushIcon, CrownIcon, ComputerDesktopIcon } from './icons';
import { User } from '../types';
import { auth } from '../services/firebase';
import { useBranding } from '../contexts/BrandingContext';
import { AiTypingIndicator } from './ui/Spinner';

interface HeaderProps {
    user: User | null;
    project: { name: string, iconSvg?: string } | null;
    onDownload: () => void;
    onApiKeyClick: () => void;
    onSettingsClick: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onAnalyzeClick: () => void;
    onBuildClick: () => void;
    onAutoDevClick: () => void;
    onGodModeClick: () => void;
    onDebugRefactorClick: () => void;
    onBackToDashboard: () => void;
    onTogglePreview: () => void;
    onToggleFullScreenPreview: () => void;
    onToggleBottomPanel: () => void;
    onProfileClick: () => void;
    onShareClick: () => void;
    onDeployClick: () => void;
    onDesignClick: () => void;
    onGitHubClick: () => void;
    isAiLoading: boolean;
    isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({
    user, project, onDownload, onApiKeyClick, onSettingsClick,
    onUndo, onRedo, canUndo, canRedo, onAnalyzeClick, onBuildClick,
    onAutoDevClick, onGodModeClick, onDebugRefactorClick, onBackToDashboard,
    onTogglePreview, onToggleFullScreenPreview, onToggleBottomPanel,
    onProfileClick, onShareClick, onDeployClick, onDesignClick, onGitHubClick,
    isAiLoading,
    isMobile
}) => {
  const { brand } = useBranding();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const ProjectIcon: React.FC = () => {
    if (project?.iconSvg) {
        try {
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(project.iconSvg)}`;
            return <img src={svgDataUrl} alt="Project Icon" className="w-6 h-6 object-contain"/>;
        } catch (e) {
            console.error("Error encoding SVG for data URL:", e);
        }
    }
    if (brand?.logo) {
        return <img src={brand.logo} alt="Brand Logo" className="w-6 h-6 object-contain"/>;
    }
    return <CodeIcon className="w-6 h-6 text-base-content"/>;
  };

  const DesktopHeader = () => (
     <div className="flex items-center space-x-1 sm:space-x-2">
       <button onClick={onGodModeClick} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-600 hover:bg-yellow-500 text-white transition-colors" title="God Mode">
        <CrownIcon className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">God Mode</span>
      </button>
       <button onClick={onAutoDevClick} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:opacity-90 text-white transition-colors" title="Autonomous Mode">
        <RobotIcon className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">Auto-Dev</span>
      </button>
       <button onClick={onBuildClick} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary hover:opacity-90 text-white transition-colors" title="Build Mode">
        <AiIcon className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">Build</span>
      </button>
      <div className="h-6 w-px bg-base-300 mx-1"></div>
      <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Undo">
        <UndoIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Redo">
        <RedoIcon className="w-5 h-5 text-neutral" />
      </button>
      <div className="h-6 w-px bg-base-300 mx-1"></div>
      <button onClick={onToggleBottomPanel} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Toggle Console/Terminal Panel">
        <CommandLineIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onTogglePreview} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Toggle Preview Panel">
        <ComputerDesktopIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onToggleFullScreenPreview} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Full Screen Preview">
        <ExternalLinkIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onDeployClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Deploy Project">
          <RocketIcon className="w-5 h-5 text-green-400" />
      </button>
      <button onClick={onGitHubClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Push to GitHub">
          <svg className="w-5 h-5 text-neutral" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
      </button>
      <button onClick={onShareClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Share Project">
          <ShareIcon className="w-5 h-5 text-neutral" />
      </button>
       <button onClick={onDesignClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="AI Design Studio">
        <PaintBrushIcon className="w-5 h-5 text-accent" />
      </button>
      <button onClick={onAnalyzeClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Analyze Project">
        <AnalyzeIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onDebugRefactorClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Debug & Refactor with AI">
        <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />
      </button>
      <div className="h-6 w-px bg-base-300 mx-1"></div>
      <button data-testid="godmode-open-settings-modal" onClick={onSettingsClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Project Settings">
        <SettingsIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onApiKeyClick} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="API Key Settings">
        <KeyIcon className="w-5 h-5 text-neutral" />
      </button>
      <button onClick={onDownload} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Download Project as ZIP">
        <DownloadIcon className="w-5 h-5 text-neutral" />
      </button>
      {user && (
         <div className="flex items-center space-x-2 pl-2">
             <button onClick={onProfileClick} className="flex items-center gap-2 p-1 rounded-full hover:bg-base-300" title="Profile Settings">
                <span className="text-sm text-neutral hidden sm:inline">{user.displayName || user.email}</span>
                 {user.photoURL ? (
                     <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover"/>
                 ) : (
                     <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                         <UserIcon className="w-5 h-5 text-neutral"/>
                     </div>
                 )}
             </button>
         </div>
      )}
    </div>
  );

  const MobileMenu = () => {
    const MenuItem: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void }> = ({ icon, text, onClick }) => (
      <button onClick={() => { onClick(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-base-content hover:bg-base-300 text-sm">
        {icon}
        <span>{text}</span>
      </button>
    );

    return (
      <div ref={menuRef} className="absolute top-full right-2 mt-2 w-64 bg-base-200 border border-base-300 rounded-lg shadow-xl z-50 py-2">
        <MenuItem icon={<CrownIcon className="w-5 h-5 text-yellow-500" />} text="God Mode" onClick={onGodModeClick} />
        <MenuItem icon={<RobotIcon className="w-5 h-5 text-secondary" />} text="Autonomous Mode" onClick={onAutoDevClick} />
        <MenuItem icon={<AiIcon className="w-5 h-5 text-primary" />} text="Build Mode" onClick={onBuildClick} />
        <div className="h-px bg-base-300 my-1 mx-2"></div>
        <MenuItem icon={<PaintBrushIcon className="w-5 h-5 text-accent" />} text="AI Design Studio" onClick={onDesignClick} />
        <MenuItem icon={<ComputerDesktopIcon className="w-5 h-5 text-neutral" />} text="Full Screen Preview" onClick={onToggleFullScreenPreview} />
        <MenuItem icon={<CommandLineIcon className="w-5 h-5 text-neutral" />} text="Toggle Console" onClick={onToggleBottomPanel} />
        <div className="h-px bg-base-300 my-1 mx-2"></div>
        <MenuItem icon={<AnalyzeIcon className="w-5 h-5 text-neutral" />} text="Analyze Project" onClick={onAnalyzeClick} />
        <MenuItem icon={<WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />} text="Debug & Refactor" onClick={onDebugRefactorClick} />
        <div className="h-px bg-base-300 my-1 mx-2"></div>
        <MenuItem icon={<RocketIcon className="w-5 h-5 text-green-400" />} text="Deploy Project" onClick={onDeployClick} />
        <MenuItem icon={<svg className="w-5 h-5 text-neutral" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>} text="Push to GitHub" onClick={onGitHubClick} />
        <MenuItem icon={<ShareIcon className="w-5 h-5 text-neutral" />} text="Share Project" onClick={onShareClick} />
        <MenuItem icon={<DownloadIcon className="w-5 h-5 text-neutral" />} text="Download Project" onClick={onDownload} />
        <div className="h-px bg-base-300 my-1 mx-2"></div>
        <MenuItem icon={<SettingsIcon className="w-5 h-5 text-neutral" />} text="Project Settings" onClick={onSettingsClick} />
        <MenuItem icon={<KeyIcon className="w-5 h-5 text-neutral" />} text="API Key Settings" onClick={onApiKeyClick} />
        <MenuItem icon={<UserIcon className="w-5 h-5 text-neutral" />} text="Profile" onClick={onProfileClick} />
      </div>
    );
  };
  
  return (
    <header className="bg-base-200 p-3 flex items-center justify-between z-30 shrink-0 border-b border-base-300 relative">
      <div className="flex items-center space-x-2">
        <button onClick={onBackToDashboard} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Back to Dashboard">
          <ArrowLeftIcon className="w-5 h-5 text-neutral" />
        </button>
        <div className="bg-primary/20 p-2 rounded-md border border-primary/30">
            <ProjectIcon />
        </div>
        <div>
            <h1 className="text-lg font-bold text-base-content tracking-wider hidden sm:block">ASAI</h1>
            <p className="text-sm text-neutral truncate max-w-[150px] sm:max-w-none">{project?.name || 'Editor'}</p>
        </div>
      </div>
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {isAiLoading && <AiTypingIndicator />}
      </div>
      
      {isMobile ? (
        <div className="relative">
          <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-md hover:bg-base-300 transition-colors" title="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          {isMenuOpen && <MobileMenu />}
        </div>
      ) : (
        <DesktopHeader />
      )}
    </header>
  );
};

export default Header;
