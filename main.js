const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");
const db = require('./db');

db.init();
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: path.join(__dirname, "assets/icon.png"),
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow = win;

    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// IPC handlers for DB operations
ipcMain.handle('db-get-month', async (e, month, year) => {
    return await db.getMonth(month, year);
});

ipcMain.handle('db-save-day', async (e, month, year, day, data) => {
    return await db.saveDay(month, year, day, data);
});

ipcMain.handle('db-get-cost', async (e, month, year) => {
    return await db.getCost(month, year);
});

ipcMain.handle('db-set-cost', async (e, month, year, cost) => {
    return await db.setCost(month, year, cost);
});

ipcMain.handle('db-clear-month', async (e, month, year) => {
    return await db.clearMonth(month, year);
});

ipcMain.handle('db-select-whole-month', async (e, month, year, days) => {
    return await db.selectWholeMonth(month, year, days);
});

ipcMain.handle('db-export-csv', async (e, month, year, days) => {
    return await db.exportCSV(month, year, days);
});

ipcMain.handle('db-delete-day', async (e, month, year, day) => {
    return await db.deleteDay(month, year, day);
});

ipcMain.handle('export-pdf', async (e) => {
    if(!mainWindow) return { canceled: true };
    try{
        const pdfData = await mainWindow.webContents.printToPDF({});
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Save PDF',
            defaultPath: 'meal-report.pdf',
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if(canceled || !filePath) return { canceled: true };
        fs.writeFileSync(filePath, pdfData);
        return { canceled: false, filePath };
    }catch(err){
        return { canceled: true, error: err.message };
    }
});