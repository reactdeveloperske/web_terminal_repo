import { useState, useRef, useCallback } from 'react';

export const useTerminal = () => {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('~');
  const inputRef = useRef(null);
  const terminalOutputRef = useRef(null);

  const [fileSystem, setFileSystem] = useState({
    '~': ['documents/', 'downloads/', 'pictures/', 'README.md', 'my_script.sh'],
    '~/documents': ['report.docx', 'notes.txt'],
    '~/downloads': ['setup.exe', 'archive.zip'],
    '~/pictures': ['vacation.jpg', 'profile.png'],
  });

  const commands = [
    'help', 'echo', 'clear', 'date', 'ls', 'whoami', 'pwd', 'cd', 'mkdir', 'touch', 'rm'
  ];

  const processCommand = useCallback((command) => {
    let output = '';
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    const updateFS = (newFS) => setFileSystem({ ...newFS });

    switch (cmd) {
      case 'help':
        output = `Available commands:
- help: Displays this help message.
- echo [text]: Prints the given text.
- clear: Clears the terminal output.
- date: Displays the current date and time.
- ls: Lists files in the current directory.
- whoami: Displays the current user.
- pwd: Displays the current working directory.
- cd [directory]: Changes the current directory (simulated).
- mkdir [dir]: Creates a new directory.
- touch [file]: Creates a new file.
- rm [name]: Deletes a file or directory.`;
        break;
      case 'echo':
        output = args;
        break;
      case 'clear':
        setHistory([]);
        setCurrentCommand('');
        return;
      case 'date':
        output = new Date().toLocaleString();
        break;
      case 'ls':
        {
          const pathContent = fileSystem[currentPath];
          if (fileSystem.hasOwnProperty(currentPath)) {
            output = pathContent && pathContent.length > 0 ? pathContent.join('\n') : '';
          } else {
            output = `ls: cannot access '${currentPath}': No such directory`;
          }
        }
        break;
      case 'whoami':
        output = 'guest@reactdev';
        break;
      case 'pwd':
        output = currentPath;
        break;
      case 'cd':
        {
          const targetDir = args.trim();
          if (targetDir === '' || targetDir === '~') {
            setCurrentPath('~');
          } else if (targetDir === '..') {
            if (currentPath === '~') {
              setCurrentPath('~');
            } else {
              const pathParts = currentPath.split('/');
              pathParts.pop();
              const newPath = pathParts.join('/');
              setCurrentPath(newPath === '' ? '~' : newPath);
            }
          } else {
            const newPath = currentPath === '~' ? `~/${targetDir}` : `${currentPath}/${targetDir}`;
            // Only show error if the directory does not exist
            if (fileSystem.hasOwnProperty(newPath)) {
              setCurrentPath(newPath);
            } else {
              output = `cd: ${targetDir}: No such file or directory`;
            }
          }
        }
        break;
      case 'mkdir':
        {
          const dirName = args.trim();
          if (!dirName) {
            output = 'mkdir: missing operand';
            break;
          }
          const dirKey = currentPath === '~' ? `~/${dirName}` : `${currentPath}/${dirName}`;
          if (fileSystem[dirKey] || (fileSystem[currentPath] && fileSystem[currentPath].includes(dirName + '/'))) {
            output = `mkdir: cannot create directory '${dirName}': File exists`;
            break;
          }
          // Add directory to current path
          const newFS = { ...fileSystem };
          newFS[dirKey] = [];
          newFS[currentPath] = [...(newFS[currentPath] || []), dirName.endsWith('/') ? dirName : dirName + '/'];
          updateFS(newFS);
        }
        break;
      case 'touch':
        {
          const fileName = args.trim();
          if (!fileName) {
            output = 'touch: missing file operand';
            break;
          }
          if (fileSystem[currentPath] && fileSystem[currentPath].includes(fileName)) {
            // File already exists, do nothing (like UNIX touch)
            break;
          }
          // Add file to current path
          const newFS = { ...fileSystem };
          newFS[currentPath] = [...(newFS[currentPath] || []), fileName];
          updateFS(newFS);
        }
        break;
      case 'rm':
        {
          const name = args.trim();
          if (!name) {
            output = 'rm: missing operand';
            break;
          }
          const dirKey = currentPath === '~' ? `~/${name.replace(/\/$/, '')}` : `${currentPath}/${name.replace(/\/$/, '')}`;
          const isDir = name.endsWith('/') || !!fileSystem[dirKey];
          const newFS = { ...fileSystem };
          if (isDir && fileSystem[dirKey]) {
            // Remove directory and its contents
            delete newFS[dirKey];
            // Remove from parent listing
            newFS[currentPath] = (newFS[currentPath] || []).filter(item => item !== (name.endsWith('/') ? name : name + '/'));
            updateFS(newFS);
          } else if (fileSystem[currentPath] && fileSystem[currentPath].includes(name)) {
            // Remove file
            newFS[currentPath] = newFS[currentPath].filter(item => item !== name);
            updateFS(newFS);
          } else {
            output = `rm: cannot remove '${name}': No such file or directory`;
          }
        }
        break;
      default:
        output = `Command not found: ${command}`;
        break;
    }

    setHistory(prev => [...prev, { command, output }]);
    setCurrentCommand('');
    setCommandIndex(-1);
  }, [currentPath, fileSystem]);

  const handleInputChange = (e) => setCurrentCommand(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      currentCommand.trim() !== ''
        ? processCommand(currentCommand)
        : setHistory(prev => [...prev, { command: '', output: '' }]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = commandIndex < history.length - 1 ? commandIndex + 1 : history.length - 1;
        setCurrentCommand(history[history.length - 1 - newIndex].command);
        setCommandIndex(newIndex);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1;
        setCurrentCommand(history[history.length - 1 - newIndex].command);
        setCommandIndex(newIndex);
      } else if (commandIndex === 0) {
        setCurrentCommand('');
        setCommandIndex(-1);
      }
    }
  };

  const handleAutocomplete = () => {
    const input = currentCommand;
    const parts = input.trim().split(' ');
    const isFirst = parts.length === 1;
    let matches = [];

    if (isFirst) {
      // Autocomplete command
      matches = commands.filter(cmd => cmd.startsWith(parts[0]));
      if (matches.length === 1) {
        setCurrentCommand(matches[0] + ' ');
      } else if (matches.length > 1) {
        setHistory(prev => [...prev, { command: currentCommand, output: matches.join('    ') }]);
      }
    } else {
      // Autocomplete file/dir in current path
      const arg = parts[parts.length - 1];
      const entries = (fileSystem[currentPath] || []);
      matches = entries.filter(entry => entry.startsWith(arg));
      if (matches.length === 1) {
        // Replace last part with match
        parts[parts.length - 1] = matches[0];
        setCurrentCommand(parts.join(' ') + (matches[0].endsWith('/') ? '' : ' '));
      } else if (matches.length > 1) {
        setHistory(prev => [...prev, { command: currentCommand, output: matches.join('    ') }]);
      }
    }
  };

  return {
    history,
    currentCommand,
    currentPath,
    inputRef,
    terminalOutputRef,
    handleInputChange,
    handleKeyDown,
    handleAutocomplete,
  };
};