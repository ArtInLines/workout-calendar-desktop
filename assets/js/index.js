const registerBtn = document.getElementById('registerBtn');
const userNameInput = document.getElementById('userName');

const fetch = require('node-fetch');
const website = require('./assets/js/website.js');
const { ipcRenderer } = require('electron');

registerBtn.addEventListener('click', login);
document.addEventListener('keyup', (e) => {
	if (e.key == 'ENTER' || e.keyCode == 13) {
		login();
	}
});

async function login() {
	let userName = userNameInput.value.toLowerCase();
	userName.replace(' ', '_');
	const res = await fetch(`${website}/data`, {
		method: 'POST',
		mode: 'cors',
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userName }),
	});
	const data = await res.json();
	if (data.userName !== userName) return;
	console.log(userName);
	ipcRenderer.send('login', userName);
}
