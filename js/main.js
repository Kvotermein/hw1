'use strict'
/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 *
 * @param {View} view view instance.
 * @param {Model} model model instance.
 *
 * @constructor
 */
function Controller(View, Model) {

	let self = this;

	this.init = function() {

		let comboBox = View.getComboBox();
		let calendar = View.getCalendar();
		let vacationDays = View.getQuantityOfDays();
		let saveVacationBtn = View.getSaveVacationBtn();
		let nameSortTitle = View.getnameSortTitle();
		let startDate = View.getStartDateTitle();

		comboBox.addEventListener("input", this._onComboboxChange);
		calendar.addEventListener("input", this._onCalendarChange);
		vacationDays.addEventListener("input", this._onQuantityOfDaysChange);
		saveVacationBtn.addEventListener("click", this._onSaveVacationBtnClick);
		nameSortTitle.addEventListener("click", this._onnameSortTitleClick);
		startDate.addEventListener("click", this._onstartDateClick);
	};

	this._onnameSortTitleClick = function(e) {
		self.reloadTable( Model.sortName( Model.fetchDataOfVacations() ) );
	};
	this._onstartDateClick = function(e) {
		self.reloadTable( Model.sortTable( Model.fetchDataOfVacations() ) );
	};

	this.onThrashbtnClick = function(e) {
		Model.deleteVacation(this.id, (this.dataset.id-1));
		self.reloadTable(Model.sortTable(Model.fetchDataOfVacations()));
	};

	this.onEditBtn = function(e) {

		console.log(this.firstChild)
		this.classList.remove("edit__btn");
		this.classList.add("save__btn");
		this.firstChild.classList.remove("fa","fa-pencil");
		this.firstChild.classList.add("fa", "fa-floppy-o");
		View.makeEditable(e.path[2].cells, (this.dataset.id-1), this.id);
		addListenerForCancelBtn();
		addListenerForSaveBtn();
		this.removeEventListener('click', self.onEditBtn)
	};

	this.onCancelBtn = function(e) {
		self.reloadTable();
	};

	this.onSaveBtn = function(e) {

	let dataObject = View.getDateFromEditInputs(this.id, Model.fetchDataOfVacations());
		console.log(dataObject.vacation, dataObject.period)
		Model.putEditVacation(this.id, dataObject.vacation, dataObject.period);
		Model.reBuildWorkers(dataObject.daysCount, this.dataset.id-1);
		self.reloadTable();		
	}

	this._onComboboxChange = function(e) {
		View.setCalendarValues(Model.fetchDataOfVacations(), View.getOptionValue(e.target.value), Model.fetchDataWorkers());
	};

	this._onCalendarChange = function(e) {
		let date = new Date(e.target.value);
	};

	this._onQuantityOfDaysChange = function(e) {
		View.getSaveVacationBtn().removeAttribute("disabled");
	};

	this._onSaveVacationBtnClick = function(e) {
		let vacation = View.getFormData(View.getVacationAddForm());
		if (Model.isHalfOfWorkersInVacation(vacation, Model.fetchDataOfVacations())) {
			Model.fetchDataOfVacations().push(vacation);
		} else {
			tostedMessage();
		}
		Model.reBuildWorkers( View.getDiffDays( View.getVacationAddForm() ).quantity, View.getDiffDays( View.getVacationAddForm() ).id );
		self.reloadTable(Model.sortTable(Model.fetchDataOfVacations()));
	};

	function addListenerForDeleteVacationBtn() {
		let trashBtn = document.querySelectorAll(".thrash__btn");
		for (let i = 0; i < trashBtn.length; i++) {
			trashBtn[i].addEventListener("click", self.onThrashbtnClick);
		}
	}

	function tostedMessage() {
		var x = document.getElementById("snackbar")
		x.className = "show";
		setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
	}
	function addListenerForEditBtn() {
		let trashBtn = document.querySelectorAll(".edit__btn");
		for (let i = 0; i < trashBtn.length; i++) {
			trashBtn[i].addEventListener("click", self.onEditBtn);
		}
	}
	function addListenerForCancelBtn() {
		let trashBtn = document.querySelectorAll(".cancel__btn");
		for (let i = 0; i < trashBtn.length; i++) {
			trashBtn[i].addEventListener("click", self.onCancelBtn);
		}
	}
	function addListenerForSaveBtn() {
		let trashBtn = document.querySelectorAll(".save__btn");
		for (let i = 0; i < trashBtn.length; i++) {
			trashBtn[i].addEventListener("click", self.onSaveBtn);
		}
	}
	this.reloadTable = function(sorting){
		View.deleteAllTable();
		View.renderComboBox(Model.fetchDataWorkers());
		View.getCalendar().value = '';
		View.getCalendar().setAttribute("disabled", "disabled");
		View.getQuantityOfDays().value = '';
		View.getQuantityOfDays().setAttribute("disabled", "disabled");
		sorting;
		View.renderTable(Model.fetchDataWorkers(), Model.fetchDataOfVacations());
		View.getSaveVacationBtn().setAttribute("disabled", "disabled");
		document.querySelector("#selectWorker").setAttribute("selected", "selected");
		addListenerForDeleteVacationBtn();
		addListenerForEditBtn();
	}

	window.onload = function () {
		if (localStorage.length === 0) {
			let stringifyWorkers = JSON.stringify(WORKERS);
			let stringifyVacations = JSON.stringify(VACATIONS);
			localStorage.setItem("workers", stringifyWorkers);
			localStorage.setItem("vacations", stringifyVacations);
			console.log('231');
		} else {
			WORKERS = JSON.parse(localStorage.getItem("workers"));
			VACATIONS = JSON.parse(localStorage.getItem("vacations"));
			console.log('123')
		}
		self.reloadTable(Model.sortTable(Model.fetchDataOfVacations()));
		// localStorage.removeItem("workers")
		// localStorage.removeItem("vacations")
	}

	function setActiveVacation(now) {
		let vacations = Model.fetchDataOfVacations();
		vacations.forEach(function(V, I, A) {
			dateObjectStart = new Date(V.vacation.start);
			dateObjectEnd = new Date(V.vacation.end);
			if (dateObjectStart.getDate() === now.getDate() && dateObjectStart.getMonth() === now.getMonth()) {
				View.changeVisualOfVacaionThatCome(I , "active");
			}
			if (dateObjectEnd.getDate() === now.getDate() && dateObjectEnd.getMonth() === now.getMonth()) {
				View.changeVisualOfVacaionThatCome(I, "passed");
			}

		});
	}

	function newDayCome(makeChange) {
		(function loop() {
			let now = new Date();
			if (now.getHours() === 24) {
				makeChange(now);
			}
			now = new Date();   // actual time in (ms)
			let then = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0);
			let delay = then - now; // how much time to midnight (ms)
			setTimeout(loop, delay);
		})();
	}
	newDayCome(setActiveVacation);
}


(new Controller(new View, new Model)).init();