document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const historialRegistros = document.getElementById('historialRegistros');
    const btnDescargarCSV = document.getElementById('btnDescargarCSV'); // Asegúrate de tener este botón en tu HTML
    const viviendasHoy = document.getElementById('viviendasHoy');
    const viviendasManana = document.getElementById('viviendasManana');
    let registros = JSON.parse(localStorage.getItem('registrosViviendas')) || [];

    function mostrarViviendas() {
        const hoy = new Date();
        const manana = new Date(hoy.getTime() + (24 * 60 * 60 * 1000));

        viviendasHoy.innerHTML = '';
        viviendasManana.innerHTML = '';

        registros.forEach(registro => {
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
        });
    }

    function actualizarUI() {
        mostrarViviendas();
        mostrarHistorialRegistros();
    }

    function mostrarHistorialRegistros() {
        historialRegistros.innerHTML = '';
        registros.forEach(agregarRegistroAlHistorial);
    }

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

        registros.push(nuevoRegistro);
        localStorage.setItem('registrosViviendas', JSON.stringify(registros));
        agregarRegistroAlHistorial(nuevoRegistro);
        registroForm.reset();
        actualizarUI();
    });

    function obtenerExtrasSeleccionados() {
        return Array.from(document.querySelectorAll('input[name="extras"]:checked')).map(el => el.value);
    }

    function agregarRegistroAlHistorial(registro) {
        const div = document.createElement('div');
        div.classList.add('registro');
        div.innerHTML = `
            <p><strong>Vivienda:</strong> ${registro.vivienda}</p>
            <p><strong>Entrada:</strong> ${registro.fechaEntrada} a las ${registro.horaEntrada}</p>
            <p><strong>Salida:</strong> ${registro.fechaSalida} a las ${registro.horaSalida}</p>
            <p><strong>Horas de Limpieza:</strong> ${registro.horasLimpiadora}</p>
            <p><strong>Extras:</strong> ${registro.extras.join(", ")}</p>
            <button class="borrarBtn">Borrar</button>
            <button class="agregarHorasBtn">Agregar Horas de Limpieza</button>
            <button class="editarExtrasBtn">Editar Extras</button>
        `;
        historialRegistros.appendChild(div);

        div.querySelector('.borrarBtn').addEventListener('click', function() {
            if (confirm('¿Está seguro de que desea eliminar este registro?')) {
                borrarRegistro(registro);
                div.remove();
            }
        });

        div.querySelector('.agregarHorasBtn').addEventListener('click', function() {
            agregarHoras(registro, div);
        });

        div.querySelector('.editarExtrasBtn').addEventListener('click', function() {
            editarExtras(registro);
        });
    }

    function agregarHoras(registro, div) {
        const horas = prompt("Ingrese las horas de limpieza:", registro.horasLimpiadora);
        if (horas !== null && !isNaN(horas)) {
            registro.horasLimpiadora = horas;
            actualizarRegistro(registro);
            actualizarVistaRegistro(div, registro);
        }
    }

    function editarExtras(registro) {
        // Implementación de la función para editar los extras del registro.
        // Asegúrate de que esta función actualice el registro con los nuevos extras
        // y luego llame a 'actualizarRegistro(registro)' para guardar los cambios.
    }

    function borrarRegistro(registro) {
        registros = registros.filter(r => r !== registro);
        localStorage.setItem('registrosViviendas', JSON.stringify(registros));
        actualizarUI();
    }

    function actualizarRegistro(registro) {
        localStorage.setItem('registrosViviendas', JSON.stringify(registros));
        actualizarUI();
    }

    function actualizarVistaRegistro(div, registro) {
        div.querySelector('p:nth-child(4)').textContent = `Horas de Limpieza: ${registro.horasLimpiadora}`;
    }

    // Función para descargar registros como CSV
    function descargarCSV() {
        let csvContent = "\uFEFF"; // BOM para UTF-8
        csvContent += "Vivienda;Fecha Entrada;Hora Entrada;Fecha Salida;Hora Salida;Horas Limpieza;Extras\r\n";
        registros.forEach(function(registro) {
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
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "registros_viviendas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function editarExtras(registro) {
        const extras = registro.extras.join(", ");
        const nuevosExtras = window.prompt('Editar Extras:', extras);
    
        if (nuevosExtras !== null) {
            registro.extras = nuevosExtras.split(',').map(extra => extra.trim());
            actualizarRegistro(registro);
            actualizarVistaRegistro(div, registro);
        }
    }


    btnDescargarCSV.addEventListener('click', descargarCSV);

    actualizarUI();
});
