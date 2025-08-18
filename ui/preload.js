const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Add functions here to call Python scripts or other main process logic
    // downloadContent: (entry) => ipcRenderer.invoke('download-content', entry),
    // ... add more functions as needed
});