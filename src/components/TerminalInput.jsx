import React from 'react';

const TerminalInput = ( {
    currentCommand,
    handleInputChange,
    handleKeyDown,
    handleAutoComplete,
    currentPath,
    inputRef
}) => {
    const onKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleAutoComplete();
        } else {
            handleKeyDown(e);
        }
    };

    return (
        <div className="flex items-center mt-2">
          <span className="text-purple-400 mr-2"> guest@reactdev: {currentPath}$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400 caret-green             -400"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
       );
};

export default TerminalInput;
