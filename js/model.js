'use strict'
/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
 * @constructor
 */
function Model() {
	let self = this;

	window.WORKERS = [
		{
			id: 1,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Gurinovich",
				name			: "Ivan",
				position		: "Director"
			}
		},
		{
			id: 2,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Kruk",
				name			: "Andrei",
				position		: "Deputy"
			}
		},
		{
			id: 3,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Zelenkov",
				name			: "Valeriy",
				position		: "Deputy"
			}
		},
		{
			id: 4,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Leshok",
				name			: "Vladimir",
				position		: "ChiefEngineer"
			}
		},
		{
			id: 5,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Zhinovich",
				name			: "Pavel",
				position		: "ChiefEngineer"
			}
		},
		{
			id: 6,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Vilyuha",
				name			: "Nikolai",
				position		: "Engineer"
			}
		},
		{
			id: 7,
			vacationDays : 24,
			coWorkerInfo : {
				lastName		: "Novik",
				name			: "Dmitriy",
				position		: "Engineer"
			}
		}
	];

	const staticPosition = {
		Engineer : 2,
		ChiefEngineer : 1,
		Deputy : 1,
		Director : 1		
	};


	window.VACATIONS = [
		// {
		// 	id: 1,
		// 	vacation : {start:"1507747052464", end:"1508094473986"},
		// 	period	 : '',
		//  lastName  : "LastName",
		//  position: ""
		// },
	];

	this.fetchDataWorkers = function() {
		return WORKERS;
	};
	this.fetchDataOfVacations = function() {
		return VACATIONS;
	};


	let SORT_DIR = "desc";

	this.sortTable = function(VACATIONS) {

		let sortDate = VACATIONS;

		if (SORT_DIR === "asc") {
			sortDate.sort(function(a, b) {
				return a.vacation.start - b.vacation.start;
			});
			SORT_DIR ="desc";
		} else if (SORT_DIR === "desc") {
			sortDate.sort(function(a, b) {
				return b.vacation.start - a.vacation.start;
			});
			SORT_DIR = "asc";
		}
	};

	this.sortName = function(VACATIONS) {

		let sortDate = VACATIONS;

		if (SORT_DIR === "asc") {
			sortDate.sort(function(a, b) {
				return a.lastName > b.lastName;
			});
			SORT_DIR ="desc";
		} else if (SORT_DIR === "desc") {
			sortDate.sort(function(a, b) {
				return a.lastName < b.lastName;
			});
			SORT_DIR = "asc";
		}
	};

	this.reBuildWorkers = function(quantity, id) {
		WORKERS[id].vacationDays = WORKERS[id].vacationDays - quantity;
	};

	this.deleteVacation = function(id, datasetId) {
		let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		WORKERS[datasetId].vacationDays = Math.round( WORKERS[datasetId].vacationDays + VACATIONS[id].period/oneDay );
		VACATIONS[id].period
		VACATIONS.splice(id, 1);
	};
	this.putEditVacation = function(id, setVacation, setPeriod) {
		VACATIONS[id].vacation = setVacation;
		VACATIONS[id].period = setPeriod;
	};

	this.isHalfOfWorkersInVacation = function(newVacation, currentVacations) {
		// console.log(newVacation.vacation.start newVacation.vacation.end);
		let boolean;
		let i = 0;

		currentVacations.some(function(V, I, A) {
				if (V.vacation.start > newVacation.vacation.end)  {
					boolean = true;
				} else if (V.vacation.end < newVacation.vacation.start) {
					boolean = true;
				} else {
					if (V.position === newVacation.position) {
						i++;
					}
					if (i <= staticPosition[V.position]) {
						boolean = false;
						return boolean;
					} else {
						boolean = true;
					}	
				}
		});

		if (currentVacations.length === 0 && newVacation.position !=="Director") {
				return true
			} else return boolean;
	};

	window.onunload = function() {
		let stringifyWorkers = JSON.stringify(WORKERS);
		let stringifyVacations = JSON.stringify(VACATIONS);
		localStorage.setItem("workers", stringifyWorkers);
		localStorage.setItem("vacations", stringifyVacations);		
	}
}