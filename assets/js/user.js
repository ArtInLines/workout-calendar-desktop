const website = require('./assets/js/website.js');
const path = require('path');
const fetch = require('node-fetch');
const store = require('./store.js');

const selectYear = document.getElementById('year');
const selectMonth = document.getElementById('month');
const monthAndYear = document.getElementById('monthAndYear');
const calBody = document.getElementById('calBody');
const text = document.getElementById('text');

const userName = store.get('name');
console.log(userName);
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
let shownMonth = currentMonth,
	shownYear = currentYear,
	workouts = [],
	workoutsThisYear = [],
	workoutsThisMonth = [];

function previous() {
	shownYear = shownMonth === 0 ? shownYear - 1 : shownYear;
	shownMonth = shownMonth === 0 ? 11 : shownMonth - 1;
	showCalendar(shownMonth, shownYear);
}

function next() {
	shownYear = shownMonth === 11 ? shownYear + 1 : shownYear;
	shownMonth = (shownMonth + 1) % 12;
	showCalendar(shownMonth, shownYear);
}

function jump() {
	shownYear = parseInt(selectYear.value);
	shownMonth = parseInt(selectMonth.value);
	showCalendar(shownMonth, shownYear);
}

function showCalendar(month, year) {
	let firstDay = new Date(year, month).getDay() - 1;
	let daysAmount = 32 - new Date(year, month, 32).getDate();

	calBody.innerHTML = '';

	monthAndYear.innerHTML = `${months[month]} ${year}`;
	selectYear.value = year;
	selectMonth.value = month;

	// Creating the table's body's cells
	let date = 1;
	for (let i = 0; i < 6; i++) {
		// Create a table row
		const row = document.createElement('tr');

		// Create individual cells, filling them up with data
		for (let j = 0; j < 7; j++) {
			if (date > daysAmount) break;

			const cell = document.createElement('td');
			let cellText;

			if (i === 0 && j < firstDay) {
				cellText = document.createTextNode('');
			} else {
				cellText = document.createTextNode(date);
				if (date === today.getDate() && year === currentYear && month === currentMonth) {
					// Highlight that cell
					cell.classList.add('today');
				}
				date++;
			}

			cell.appendChild(cellText);
			row.appendChild(cell);
		}

		calBody.appendChild(row);
	}
	getData();
}

document.addEventListener('click', (e) => onClickPutData(e));

function onClickPutData(e) {
	if (e.target.tagName.toLowerCase() == 'td') {
		const data = {
			date: parseInt(e.target.innerText),
			month: shownMonth,
			year: shownYear,
			done: 'done',
		};
		if (e.target.classList.contains('done')) {
			data.done = 'half';
		}
		if (e.target.classList.contains('half')) {
			data.done = 'false';
		}
		e.target.classList.remove('done');
		e.target.classList.remove('half');
		console.log(data);
		putData(data);
	}
}

async function request(url = '', method = 'POST', data = {}) {
	const res = await fetch(url, {
		method: method,
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
	return res.json();
}

function getData() {
	fetch(`${website}/${userName}/data`)
		.then((res) => res.json())
		.then((res) => {
			showWorkedDays(res.data.data);
		});
}

function putData(data) {
	request(`${website}/${userName}/data`, 'PUT', data).then((res) => {
		if (res.success) {
			getData();
		}
	});
}

function showWorkedDays(array) {
	console.log(array);
	workoutsThisMonth = [];
	workoutsThisYear = [];
	workouts = array;
	const allRows = calBody.childNodes;
	for (let i = 0; i < array.length; i++) {
		if (array[i].done == 'false') continue;
		if (array[i].year !== shownYear) continue;
		workoutsThisYear.push(array[i]);
		if (array[i].month !== shownMonth) continue;
		workoutsThisMonth.push(array[i]);
		for (let j = 0; j < allRows.length; j++) {
			const singleRow = allRows[j].childNodes;
			for (let x = 0; x < singleRow.length; x++) {
				if (singleRow[x].innerText !== String(array[i].date)) continue;
				// Check if 'done' or 'half'-done
				else if (array[i].done == 'done') {
					singleRow[x].classList.add('done');
				} else if (array[i].done == 'half') {
					singleRow[x].classList.add('half');
				}
			}
		}
	}
	showText();
}

function showText() {
	text.innerHTML = '';
	if (workoutsThisMonth.length > 0) {
		text.innerHTML = `<br>You worked out <b>${workoutsThisMonth.length}</b> days this month.\n`;
	}
	if (workoutsThisMonth.length !== workoutsThisYear.length && workoutsThisYear.length > 0) {
		text.innerHTML += `<br>You worked out <b>${workoutsThisYear.length}</b> days this year.`;
	}
	if (workouts.length !== workoutsThisMonth.length && workouts.length !== workoutsThisYear.length && workouts.length > 0) {
		text.innerHTML += `<br>You worked out <b>${workouts.length}</b> days since recording.`;
	}
}

showCalendar(currentMonth, currentYear);
