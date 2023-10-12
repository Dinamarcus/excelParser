import * as XLSX from "xlsx/xlsx.mjs";

(function () {
	let workbook;
	let file;
	let headers;
	const fileInput = document.getElementById("file-input");
	const searchInput = document.getElementById("search-input");
	searchInput.disabled = true;
	const lista = document.getElementById("lista");
	let registros = [];
	let copy = [];

	document.addEventListener("DOMContentLoaded", () => {
		eventListeners();
	});

	function eventListeners() {
		fileInput.addEventListener("change", showRegist);
		searchInput.addEventListener("input", searchRegist);
	}

	function showRegist(event) {
		file = event.target.files[0];
		console.log(file);
		const reader = new FileReader();

		reader.onload = (event) => {
			const data = event.target.result;
			workbook = XLSX.read(data, {
				type: "binary",
				cellDates: true,
				cellNF: false,
				cellText: false,
				dateNF: "dd/mm/yyyy",
			});
			const worksheet = workbook.Sheets["Hoja1"];
			registros = XLSX.utils.sheet_to_json(worksheet);
			registros = registros.map((registro) => {
				if (registro.OC !== undefined) {
					registro.OC = registro.OC.toString();
				}
				if (registro.FECHA_MOV !== undefined) {
					registro.FECHA_MOV = registro.FECHA_MOV.toString();
				}
				if (registro.CANT_PEND !== undefined) {
					registro.CANT_PEND = registro.CANT_PEND.toString();
				}
				if (registro.AE !== undefined) {
					registro.AE = registro.AE.toString();
				}
				if (registro.FECHA_MOV !== undefined) {
					let date = new Date(registro.FECHA_MOV);
					registro.FECHA_MOV = date.toLocaleDateString();
				}

				return { ...registro };
			});

			for (let i = 0; i < registros.length - 1; i++) {
				for (let j = 1; j < registros.length - i; j++) {
					if (registros[j]["REMITO "] == registros[j - 1]["REMITO "]) {
						let temp = registros[j - 1];

						if (registros[j].FACTURA === undefined) {
							registros[j].FACTURA = temp.FACTURA;
						}
						if (registros[j].OC === undefined) {
							registros[j].OC = temp.OC;
						}
						if (registros[j].AE === undefined) {
							registros[j].AE = temp.AE;
						}
					}
				}
			}

			registros.forEach((registro) => {
				if (registro.FACTURA === undefined) {
					registro.FACTURA = "";
				}
				if (registro.OC === undefined) {
					registro.OC = "";
				}
				if (registro.AE === undefined) {
					registro.AE = "";
				}
			});

			registros.forEach((registro) => {
				const li = document.createElement("LI");
				li.classList.add("li");
				li.innerHTML = `
				<i class="fa fa-pencil"></i>
				${registro.RAZON_SOCI} ${registro.FECHA_MOV} ${registro["REMITO "]} ${registro.FACTURA} ${registro.DESCRIPCIO} ${registro.CANT_PEND} ${registro.OC} ${registro.AE}
				`;

				const icon = li.querySelector("i");
				icon.style.cursor = "pointer";
				icon.addEventListener("click", editRegist);

				lista.appendChild(li);
			});

			searchInput.disabled = false;

			console.log(registros);
		};

		reader.readAsBinaryString(file);
	}

	function searchRegist(e) {
		copy = [...registros];

		if (e.target.value === "") {
			copy = [...registros];

			lista.innerHTML = "";
			registros.forEach((registro) => {
				const li = document.createElement("LI");
				li.classList.add("li");
				li.innerHTML = `
				<i class="fa fa-pencil"></i>
				${registro.RAZON_SOCI} ${registro.FECHA_MOV} ${registro["REMITO "]} ${registro.FACTURA} ${registro.DESCRIPCIO} ${registro.CANT_PEND} ${registro.OC} ${registro.AE}
				`;

				const icon = li.querySelector("i");
				icon.style.cursor = "pointer";
				icon.addEventListener("click", editRegist);

				lista.appendChild(li);
			});
		}

		copy = copy.filter((registro) => {
			return registro["REMITO "].includes(e.target.value.toString());
		});

		console.log(copy, "copia del array filtrado");

		lista.innerHTML = "";

		if (copy.length === 0) {
			const li = document.createElement("LI");
			li.classList.add("li");
			li.innerHTML = `
			<p>No se encontró el registro</p>
			`;
			lista.appendChild(li);
		} else {
			copy.forEach((registro) => {
				const li = document.createElement("LI");
				li.classList.add("li");
				li.innerHTML = `
				<i class="fa fa-pencil"></i>
				${registro.RAZON_SOCI} ${registro.FECHA_MOV} ${registro["REMITO "]} ${registro.FACTURA} ${registro.DESCRIPCIO} ${registro.CANT_PEND} ${registro.OC} ${registro.AE}
				`;

				const icon = li.querySelector("i");
				icon.style.cursor = "pointer";
				icon.addEventListener("click", editRegist);

				lista.appendChild(li);
			});
		}
	}

	function editRegist(e) {
		const string = e.target.parentElement.innerText;
		const stringArray = string.split(" ");
		console.log(stringArray);

		const body = document.querySelector(".body");
		const modal = document.createElement("DIV");
		modal.classList.add("modal");
		modal.innerHTML = `
		<div class="modal-content">
			<div class="modal-header">
				<h2>Edit Register</h2>
			</div>
			<div class="modal-body">
			<div>
				<p>${string}</p>
			</div>
			<div>
				<input id="searchAe" type="text" placeholder="Ingrese el numero de AE">
			</div>
			</div>
			<div class="modal-footer">
				<button class="saveButton">Save</button>
				<button class="close__modal">Cancel</button>
			</div>
		  </div>
		`;

		body.appendChild(modal);

		const cancel = modal.querySelector(".close__modal");
		cancel.addEventListener("click", () => {
			modal.remove();
		});

		const aeInpt = modal.querySelector("#searchAe");
		aeInpt.addEventListener("input", (e) => {
			let value = e.target.value;

			registros.forEach((registro) => {
				if (registro["REMITO "] === stringArray[5]) {
					console.log("entro el if");
					registro.AE = value;
				}
			});
		});

		const saveButton = modal.querySelector(".saveButton");
		saveButton.addEventListener("click", () => {
			// Update the worksheet in the XLSX file with the modified values
			const worksheet = workbook.Sheets["Hoja1"];
			Object.keys(worksheet).forEach((cell) => {
				if (cell[0] === "A") {
					worksheet[cell].s = { fill: { fgColor: { rgb: "FF0000" } } }; // Set the fill color to red for header cells
				}
			});
			registros.forEach((registro, index) => {
				const row = index + 2; // Add 2 to the index to account for the header row
				if (worksheet[`A${row}`]) worksheet[`A${row}`].v = registro.RAZON_SOCI;
				if (worksheet[`B${row}`]) worksheet[`B${row}`].v = registro.FECHA_MOV;
				if (worksheet[`C${row}`]) worksheet[`C${row}`].v = registro["REMITO "];
				if (worksheet[`D${row}`]) worksheet[`D${row}`].v = registro.FACTURA;
				if (worksheet[`E${row}`]) worksheet[`E${row}`].v = registro.DESCRIPCIO;
				if (worksheet[`F${row}`]) worksheet[`F${row}`].v = registro.CANT_PEND;
				if (worksheet[`G${row}`]) worksheet[`G${row}`].v = registro.OC;
				if (worksheet[`H${row}`]) worksheet[`H${row}`].v = registro.AE;
			});

			// Write the updated XLSX file
			XLSX.writeFile(workbook, file.name);

			modal.style.display = "none";
		});
	}
})();
