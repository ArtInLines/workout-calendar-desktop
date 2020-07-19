// Requirements
const url = require('url');
const path = require('path');
const mongoose = require('mongoose');
const electron = require('electron');
const dotenv = require('dotenv');
// ENV config
dotenv.config({ path: './config/config.env' });

// Connect to mongoDB
const connectDB = async () => {
	const conn = await mongoose.connect(process.env.DB, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useFindAndModify: false,
	});

	console.log(`MongoDB connected: ${conn.connection.host}`);
};
connectDB();

// Electron stuff
const store = require('./store.js');
const { app, BrowserWindow, Menu, ipcMain } = electron;

let win;
// Start when app is ready
app.on('ready', () => {
	win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	});

	console.log(app.getPath('userData'));

	let page;
	// Check if user is logged in
	if (store.has('name')) {
		// Load 'user' Page
		page = 'user.html';
	} else {
		// Load 'index' Page for user to login
		page = 'index.html';
	}

	win.loadURL(
		url.format({
			pathname: path.join(__dirname, page),
			protocol: 'file',
			slashes: true,
		}),
	);

	// Quit app when closed
	win.on('closed', () => {
		app.quit();
	});

	// Build menu from template
	Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
});

ipcMain.on('login', (e, userName) => {
	// Write config.json with userName as name
	store.set('name', userName);

	createChild('user.html');
});

function createChild(childPage) {
	// Change window to 'user.html'
	let child = new BrowserWindow({
		parent: win,
		modal: true,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
		backgroundColor: 'transparent',
	});
	child.loadURL(
		url.format({
			pathname: path.join(__dirname, childPage),
			protocol: 'file',
			slashes: true,
		}),
	);
	child.once('ready-to-show', () => {
		win.hide();
		child.show();
	});
	child.on('closed', () => {
		app.quit();
	});
}

const menuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Logout',
				accelerator: 'CmdOrCtrl+Backspace',
				click() {
					// TODO: Delete userName
					store.delete('name');
					// TODO: Open 'index.html'
					createChild('index.html');
				},
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				},
			},
		],
	},
];

/* // If mac, open empty object to menu, so that the first menu item isn't "electron"
if (process.platform == 'darwin') {
	menuTemplate.unshift({ label: '' });
} */

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
	menuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toggle Devtools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				},
			},
			{
				role: 'reload',
			},
		],
	});
}
