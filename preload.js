const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getMonth: (month, year) => ipcRenderer.invoke('db-get-month', month, year),
    saveDay: (month, year, day, data) => ipcRenderer.invoke('db-save-day', month, year, day, data),
    getCost: (month, year) => ipcRenderer.invoke('db-get-cost', month, year),
    setCost: (month, year, cost) => ipcRenderer.invoke('db-set-cost', month, year, cost),
    clearMonth: (month, year) => ipcRenderer.invoke('db-clear-month', month, year),
    selectWholeMonth: (month, year, days) => ipcRenderer.invoke('db-select-whole-month', month, year, days),
    exportCSV: (month, year, days) => ipcRenderer.invoke('db-export-csv', month, year, days),
    exportPDF: () => ipcRenderer.invoke('export-pdf'),
    deleteDay: (month, year, day) => ipcRenderer.invoke('db-delete-day', month, year, day)
});
