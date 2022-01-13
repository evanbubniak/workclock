const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("api", {
    sendNotification: (currItem) => {
        console.log(currItem);
        ipcRenderer.send('asynchronous-message', {
            eventType: "notification",
            body: `Switch to ${currItem}!`
        })
    }
})