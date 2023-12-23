document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const historialRegistros = document.getElementById('historialRegistros');
    const btnDescargarCSV = document.getElementById('btnDescargarCSV');
    const viviendasHoy = document.getElementById('viviendasHoy');
    const viviendasManana = document.getElementById('viviendasManana');

    // Referencia a Firebase Realtime Database
    const dbRef = firebase.database().ref('registrosViviendas');

    dbRef.on('value', (snapshot) => {
        const registros = snapshot.val() || {};
        mostrarViviendas(registros);
        mostrarHistorialRegistros(registros);
    });

    registroForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const nuevoRegistro = {
            vivienda: registroForm.vivienda.value,
            fechaEntrada: registroForm.fechaEntrada.value,
            horaEntrada: registroForm.horaEntrada.value,
            fechaSalida: registroForm.fechaSalida.value,
            horaSalida: registroForm.horaSalida.value,
            horasLimpiadora: registroForm.horasLimpiadora.value || "0",
            extras: obtenerExtrasSeleccionados()
        };

        dbRef.push(nuevoRegistro);
        registroForm.reset();
    });

    function obtenerExtrasSeleccionados() {
        return Array.from(document.querySelectorAll('input[name="extras"]:checked')).map(el => el.value);
    }

    function mostrarViviendas(registros) {
        const hoy = new Date();
        const manana = new Date(hoy.getTime() + (24 * 60 * 60 * 1000));
        viviendasHoy.innerHTML = '';
        viviendasManana.innerHTML = '';

        for (let id in registros) {
            const registro = registros[id];
            const entradaDate = new Date(registro.fechaEntrada);
            const salidaDate = new Date(registro.fechaSalida);
            const registroDiv = document.createElement('div');
            registroDiv.classList.add('registro');

            if (entradaDate.toDateString() === hoy.toDateString()) {
                registroDiv.textContent = `${registro.vivienda} - Entrada: ${registro.fechaEntrada} ${registro.horaEntrada}`;
                viviendasHoy.appendChild(registroDiv);
            } else if (entradaDate.toDateString() === manana.toDateString()) {
                registroDiv.textContent = `${registro.vivienda} - Entrada: ${registro.fechaEntrada} ${registro.horaEntrada}`;
                viviendasManana.appendChild(registroDiv);
            }
        }
    }

    function mostrarHistorialRegistros(registros) {
        historialRegistros.innerHTML = '';
        for (let id in registros) {
            agregarRegistroAlHistorial(registros[id], id);
        }
    }

    function agregarRegistroAlHistorial(registro, id) {
        const div = document.createElement('div');
        div.classList.add('registro');
        div.innerHTML = `
            <p><strong>Vivienda:</strong> ${registro.vivienda}</p>
            <p><strong>Entrada:</strong> ${registro.fechaEntrada} a las ${registro.horaEntrada}</p>
            <p><strong>Salida:</strong> ${registro.fechaSalida} a las ${registro.horaSalida}</p>
            <p><strong>Horas de Limpieza:</strong> ${registro.horasLimpiadora}</p>
            <p><strong>Extras:</strong> ${registro.extras.join(", ")}</p>
            <button class="borrarBtn" data-id="${id}">Borrar</button>
            <button class="agregarHorasBtn" data-id="${id}">Agregar Horas de Limpieza</button>
            <button class="editarExtrasBtn" data-id="${id}">Editar Extras</button>
        `;

        div.querySelector('.borrarBtn').addEventListener('click', function() {
            borrarRegistro(this.dataset.id);
        });

        div.querySelector('.agregarHorasBtn').addEventListener('click', function() {
            const horas = prompt("Ingrese las horas de limpieza:", registro.horasLimpiadora);
            if (horas !== null && !isNaN(horas)) {
                registro.horasLimpiadora = horas;
                actualizarRegistro(this.dataset.id, { horasLimpiadora: horas });
            }
        });

        div.querySelector('.editarExtrasBtn').addEventListener('click', function() {
            const nuevosExtras = prompt('Editar Extras:', registro.extras.join(", "));
            if (nuevosExtras !== null) {
                registro.extras = nuevosExtras.split(',').map(extra => extra.trim());
                actualizarRegistro(this.dataset.id, { extras: registro.extras });
            }
        });

        historialRegistros.appendChild(div);
    }

    function borrarRegistro(id) {
        dbRef.child(id).remove();
    }

    function actualizarRegistro(id, datos) {
        dbRef.child(id).update(datos);
    }

    btnDescargarCSV.addEventListener('click', function() {
        dbRef.once('value', snapshot => {
            const registros = snapshot.val();
            descargarCSV(registros);
        });
    });

    function descargarCSV(registros) {
        let csvContent = "\uFEFF"; // BOM para UTF-8
        csvContent += "Vivienda;Fecha Entrada;Hora Entrada;Fecha Salida;Hora Salida;Horas Limpieza;Extras\r\n";
        
        for (let id in registros) {
            let registro = registros[id];
            let row = [
                registro.vivienda,
                registro.fechaEntrada,
                registro.horaEntrada,
                registro.fechaSalida,
                registro.horaSalida,
                registro.horasLimpiadora,
                registro.extras.join(", ")
            ].map(field => `"${field}"`).join(";");
            csvContent += row + "\r\n";
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "registros_viviendas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

