const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

app.on('ready', function() {
  const win = new BrowserWindow({
    width: 1000, height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  //win.openDevTools()
  win.loadFile('index.html')

  win.webContents.openDevTools();
  setMainMenu();

  //win.maximize();
})


function setMainMenu() {
  const template = [
    {
      label: 'Filter',
      submenu: [
        {
          label: 'Hello',
          accelerator: 'Shift+CmdOrCtrl+H',
          click() {
              console.log('Oh, hi there!')
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}