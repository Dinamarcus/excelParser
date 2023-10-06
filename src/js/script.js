import * as XLSX from "xlsx/xlsx.mjs";

(function () {
	const fileInput = document.getElementById("file-input");
	const searchInput = document.getElementById("search-input");
	const lista = document.getElementById("lista");
	let registros = [];

	document.addEventListener("DOMContentLoaded", () => {
		eventListeners();
	});

	function eventListeners() {
		fileInput.addEventListener("change", showRegist);
		searchInput.addEventListener("input", searchRegist);
	}

	function showRegist(event) {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = (event) => {
			const data = event.target.result;
			const workbook = XLSX.read(data, { type: "binary", cellDates: true });
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
					const date = new Date(registro.FECHA_MOV);
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
				const li = document.createElement("li");
				li.classList.add("li");
				li.textContent = `${registro.RAZON_SOCI} ${registro.FECHA_MOV} ${registro["REMITO "]} ${registro.FACTURA} ${registro.DESCRIPCIO} ${registro.CANT_PEND} ${registro.OC} ${registro.AE}`;

				lista.appendChild(li);
			});

			console.log(registros);
		};

		reader.readAsBinaryString(file);
	}

	function searchRegist(e) {
		let copy = [...registros];

		if (e.target.value === "") {
			copy = [...registros];

			lista.innerHTML = "";
			registros.forEach((registro) => {
				const li = document.createElement("LI");
				li.textContent = `${registro.RAZON_SOCI} ${registro.FECHA_MOV} ${registro["REMITO "]} ${registro.FACTURA} ${registro.DESCRIPCIO} ${registro.CANT_PEND} ${registro.OC} ${registro.AE}`;
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
			li.textContent = "No se encontraron resultados";
			lista.appendChild(li);
		} else {
			copy.forEach((registro) => {
				const li = document.createElement("LI");
				li.textContent = `${registro.RAZON_SOCI} ${registro.FECHA_MOV} ${registro["REMITO "]} ${registro.FACTURA} ${registro.DESCRIPCIO} ${registro.CANT_PEND} ${registro.OC} ${registro.AE}`;
				lista.appendChild(li);
			});
		}
	}
})();
