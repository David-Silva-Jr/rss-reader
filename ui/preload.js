const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Add functions here to call Python scripts or other main process logic
    // downloadContent: (entry) => ipcRenderer.invoke('download-stuff', entry)
    runPythonScript: (functionName, args) => ipcRenderer.invoke('run-python-script', functionName, args)
});