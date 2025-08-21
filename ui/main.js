const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), // Use a preload script
        }
    });

    // Load the Vite development server URL or the built index.html
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile('dist/index.html');
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('run-python-script', async (event, functionName, args) => {
    return new Promise((resolve, reject) => {
        const projectRoot = path.join(__dirname, '..');
        const pythonArgs = [functionName, ...args];
        const pythonVenvPath = path.join(projectRoot, 'env', 'bin', 'python3');
        const pythonScriptPath = path.join(projectRoot, 'Main.py');

        const pythonProcess = spawn(pythonVenvPath, [pythonScriptPath, ...pythonArgs], { cwd: projectRoot });

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            // is toString real here?
            output += data.toString();
        })

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString()
        })

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                if (output) {
                    try {
                        const jsonOutput = JSON.parse(output);
                        resolve(jsonOutput);
                    } catch (e) {
                        reject(new Error(`Failed to parse output: ${e.message}`));
                    }
                } else {
                    resolve('Successfully ran script');
                }
            } else {
                reject(new Error(`Something went wrong. Code: ${code}, Error: ${error}`));
            }
        })

        pythonProcess.on('error', (err) => {
            reject(new Error(`Process failed to start: ${err}`));
        })
    })
})