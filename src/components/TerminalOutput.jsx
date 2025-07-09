import React, {useEffect} from 'react';

const TerminalOutput = ({ history, currentPath terminalOutputRef }) => {
        useEffect(() => {
           if  (terminalOutputRef.current) {
                terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
                }
           }, [history]);

          return (
            <div
               ref={terminalOutputRef}
               className=flex-grow overflow-y-auto p r-2 custom-scrollbar"
                style=({ scrollBehavior: 'smooth' }}
             >

            {history.map((entry, index) => (
              <div key={index} className="mb-1">
              <div className="flex">
                <span className="text-purple-400 mr-2">guest@reactdev:{currentPath}$</span>
                      <span className="flex-1">{entry.command}</span>
                </div>
                 {entry.output && (
                    <pre className="whitespace-pre-wrap text-gray-200 ml-4">
                     {entry.output
                     </pre>
                 )}
             </div>
             ))}
          </div>
  );
};


export default TerminalOuput;

