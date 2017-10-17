'use strict'
/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
 */
function View() {

	let self = this;

	function createDomElement(typeOfDomElement, className, datasetId, id, textContent) {
		let newDomElement = document.createElement(typeOfDomElement);

		if (className) {
			newDomElement.classList.add(className);		
		}
		if (datasetId || datasetId === 0) {
			newDomElement.dataset.id = datasetId;
		}
		if (id || id === 0) {
			newDomElement.id = id;
		}
		if (textContent) {
			newDomElement.textContent = textContent;
		}

		return newDomElement;
	}

	this.renderTable = function (workers, vacations) {
		let table = document.querySelector("tbody");

		vacations.forEach(function (V, I, A) {

			let tr = document.createElement("tr");
			tr.classList.add("itemsList__container");
			tr.id = I;
			for (let key in workers[V.id - 1].coWorkerInfo) {
				let td = document.createElement("td");
				td.classList.add('first__article');
				td.textContent = workers[V.id - 1].coWorkerInfo[key];
				tr.appendChild(td);
			}

			// startTd = createDomElement("td", "first__article", )
			for (let key in V.vacation) {
				let td = document.createElement("td");
				td.classList.add('first__article');
				let date = new Date(+V.vacation[key]);
				let stringDate = date.toLocaleString("ru", { year: 'numeric', month: 'numeric', day: 'numeric' })
				td.textContent = stringDate;
				tr.appendChild(td);
			}
			if (V.vacation.start > (new Date().getTime())) {

				tr.appendChild(self.createIbtn("thrash__btn", "fa-trash-o", V.id, I));
				tr.appendChild(self.createIbtn("edit__btn", "fa-pencil", V.id, I));
				tr.classList.add('will__be');

			} else if (V.vacation.end < (new Date().getTime())) {
				tr.classList.add('passed');
			} else if (V.vacation.start < (new Date().getTime()) && V.vacation.end > (new Date().getTime())) {
				tr.classList.add('active');					
			}
			table.appendChild(tr);
		});
	};

	this.createIbtn = function(classStyle, fontClass, datasetId, id){
		let btn   = createDomElement("span", classStyle, datasetId, id);
		let	i 	  = document.createElement("i");
		i.classList.add("fa", fontClass);
		btn.appendChild(i);
		return btn;
	};

	this.renderComboBox = function(workers) {
		let comboBox = document.querySelector("#coWorkers");
		while (comboBox.options.length !== 1) comboBox.removeChild(comboBox.lastChild);
		workers.forEach(function(V, I, A) {
			if (V.vacationDays > 0) {
				let htmlOption = document.createElement("option");
				htmlOption.value = V.coWorkerInfo.lastName;
				htmlOption.textContent = V.coWorkerInfo.lastName;
				htmlOption.dataset.id = I;
				comboBox.appendChild(htmlOption);
			}
		});
	};

	this.getFormData = function(formData) {
		let vacationHash;
		let idOfWorker = self.getOptionValue(formData[0].value);
		let startVacation = new Date(formData[1].value);
		let endVacation   = new Date(formData[1].value);
		endVacation.setDate(startVacation.getDate() + (+formData[2].value));

		return vacationHash = {
			id : +idOfWorker+1,
			vacation : {
				start: startVacation.getTime(),
				end  :  endVacation.getTime()
			},
			lastName : formData[0].value,
			period	: endVacation.getTime() - startVacation.getTime(),
			position : WORKERS[idOfWorker].coWorkerInfo.position
		};
	};

	this.getDiffDays = function(formData) {
		let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		let startVacation = new Date(formData[1].value);
		let endVacation   = new Date(formData[1].value);
		endVacation.setDate(startVacation.getDate() + (+formData[2].value));

		return { 
			quantity : Math.round(Math.abs((endVacation.getTime() - startVacation.getTime())/(oneDay))),
			id 	  : self.getOptionValue(formData[0].value)
		};
	};

	this.setCalendarValues = function(vacation, dataID, workers) {
		let dataInput = self.getCalendar();
		let quantityInput = self.getQuantityOfDays();

		dataInput.removeAttribute("disabled");
		quantityInput.removeAttribute("disabled");

		let minValue;
		let maxValueOfQuantityDays;

		if (workers[dataID].vacationDays > 15) {
			maxValueOfQuantityDays = 15;
		} else {
			maxValueOfQuantityDays = workers[dataID].vacationDays;
		}

		if (vacation.length !== 0) {
			for (let i = 0; i < vacation.length; i++) {
				if (vacation[i].id === +dataID+1) {
					let getlastVacationEnd = +vacation[i].vacation.end + (+vacation[i].period);
					let date = new Date(getlastVacationEnd);
					let stringDate = date.toLocaleString("en-GB", { year: 'numeric', month: 'numeric', day: 'numeric' })
					minValue = stringDate.split('/').reverse().join("-");
					break
				}
			}

			dataInput.min = minValue;
		}
			quantityInput.max = maxValueOfQuantityDays;
	};

	this.makeEditable = function(HTMLCollection, datasetId, id) {

		let inputStartDate = document.createElement('input');
		inputStartDate.type = "date";
		inputStartDate.classList.add("edit"+id);
		inputStartDate.min  = HTMLCollection[3].textContent.split('.').reverse().join("-");		
		let inputEndDate = document.createElement('input');
		inputEndDate.type = "date";
		inputEndDate.classList.add("edit"+id);
		inputEndDate.min  = HTMLCollection[4].textContent.split('.').reverse().join("-");
		HTMLCollection[3].textContent = '';
		HTMLCollection[3].appendChild(inputStartDate);
		HTMLCollection[4].textContent = '';
		HTMLCollection[4].appendChild(inputEndDate);
		HTMLCollection[4].appendChild(self.createIbtn("cancel__btn", "fa-ban", datasetId, id));

	};

	this.getDateFromEditInputs = function(id, vacations) {
		let inputs = document.querySelectorAll(".edit"+id);
		console.log(vacations[id].period);
		console.log(inputs[0].value, inputs[1].value);
		if (inputs[0].value === '' || inputs[1].value === '') {
			return {
				vacation : {
					start : vacations[id].vacation.start,
					end : vacations[id].vacation.end
				},
				period : vacations[id].vacation.end - vacations[id].vacation.start,
				daysCount : 0
			};
		} else {
			let startVacation = new Date(inputs[0].value);
			let endVacation   = new Date(inputs[1].value);
			return {
				vacation : {
					start: startVacation.getTime(),
					end  :  endVacation.getTime()
				},
				period	: endVacation.getTime() - startVacation.getTime(),
				daysCount : vacations[id].period - endVacation.getTime() - startVacation.getTime()
			};
		}
	};

	this.deleteAllTable = function() {
		let table = document.querySelector("tbody");
		while (table.rows.length !== 1) table.removeChild(table.lastChild);
	};

	this.getComboBox = function() {
		return document.querySelector("#coWorkers");
	};
	this.getCalendar = function() {
		return document.querySelector(".date");
	};
	this.getOptionValue = function(intireValue) {
		return document.querySelector("#coWorkers option[value='"+intireValue+"']").dataset.id;
	};
	this.getQuantityOfDays = function() {
		return document.querySelector(".quantityOfDays");
	};
	this.getVacationAddForm = function() {
		return document.querySelector("#addVacation");
	};
	this.getSaveVacationBtn = function() {
		return document.querySelector(".saveVacation");
	};
	this.getThrashButtons = function() {
		return document.querySelector(".thrash__btn");
	};
	this.getnameSortTitle = function() {
		return document.querySelector("#nameSort");
	};
	this.getStartDateTitle = function() {
		return document.querySelector("#startDate");
	};
	this.changeVisualOfVacaionThatCome = function(I, styleClass) {
		let row = document.querySelector("#"+I);
			row.classList.remove("will__be");
			row.classList.remove("active");
			row.classList.add(styleClass);
	};

}