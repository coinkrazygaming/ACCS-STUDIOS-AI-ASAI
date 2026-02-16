import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-base-300 border-t-primary ${sizeClasses[size]}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const AiTypingIndicator: React.FC = () => (
    <div className="flex items-center gap-2 text-sm text-accent bg-base-300/50 px-3 py-1.5 rounded-md border border-base-300/50 backdrop-blur-sm">
        <div className="typing-indicator"><div/><div/><div/></div>
        <span className="font-semibold hidden sm:inline">AI is thinking...</span>
    </div>
);


export default Spinner;
