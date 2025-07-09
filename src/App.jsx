import React from 'react';
import TerminalOutput from './components/TerminalOutput';
import TerminalInput from './components/TerminalInput';
import { useTerminal } from './components/TerminalLogic';

const App = () => {
  const {
    history,
    currentCommand,
    currentPath,
    inputRef,
    terminalOutputRef,
    handleInputChange,
    handleKeyDown,
    handleAutocomplete,
  } = useTerminal();

  return (
    <div className="flex flex-col h-screen p-4 rounded-lg shadow-lg overflow-hidden">
      <TerminalOutput
        history={history}
        currentPath={currentPath}
        terminalOutputRef={terminalOutputRef}
      />
      <TerminalInput
        currentCommand={currentCommand}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleAutocomplete={handleAutocomplete}
        currentPath={currentPath}
        inputRef={inputRef}
      />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
      `}</style>
    </div>
  );
};

export default App;