document.addEventListener('DOMContentLoaded', function () {
    const registroForm = document.getElementById('registroForm');
    const historialRegistros = document.getElementById('historialRegistros');
    const btnDescargarCSV = document.getElementById('btnDescargarCSV');
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
            } else if (salidaDate.toDateString() === hoy.toDateString()) {
                registroDiv.textContent = `${registro.vivienda} - Salida: ${registro.fechaSalida} ${registro.horaSalida}`;
                viviendasHoy.appendChild(registroDiv);
            }

            if (entradaDate.toDateString() === manana.toDateString()) {
                registroDiv.textContent = `${registro.vivienda} - Entrada: ${registro.fechaEntrada} ${registro.horaEntrada}`;
                viviendasManana.appendChild(registroDiv);
            } else if (salidaDate.toDateString() === manana.toDateString()) {
                registroDiv.textContent = `${registro.vivienda} - Salida: ${registro.fechaSalida} ${registro.horaSalida}`;
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
        const registrosAgrupados = agruparRegistrosPorFecha(registros);

        // Ordenar los grupos por fecha de manera ascendente
        const gruposOrdenados = Array.from(registrosAgrupados.entries()).sort((a, b) => {
            const fechaA = new Date(a[0]);
            const fechaB = new Date(b[0]);
            return fechaA - fechaB;
        });

        gruposOrdenados.forEach(([fecha, registrosPorFecha]) => {
            const grupo = document.createElement('div');
            grupo.classList.add('grupo');

            const titulo = document.createElement('h3');
            titulo.textContent = fecha;

            const contenido = document.createElement('div');
            contenido.classList.add('contenido');

            registrosPorFecha.forEach(registro => {
                const entrada = document.createElement('div');
                entrada.classList.add('registro');
                entrada.innerHTML = `
                    <p><strong>Vivienda:</strong> ${registro.vivienda}</p>
                    <p><strong>Entrada:</strong> ${registro.fechaEntrada ? `${registro.fechaEntrada} a las ${registro.horaEntrada || ''}` : 'N/A'}</p>
                    <p><strong>Salida:</strong> ${registro.fechaSalida ? `${registro.fechaSalida} a las ${registro.horaSalida || ''}` : 'N/A'}</p>
                    <p><strong>Horas de Limpieza:</strong> ${registro.horasLimpiadora}</p>
                    <p><strong>Extras:</strong> ${registro.extras.join(", ")}</p>
                    <button class="borrarBtn">Borrar</button>
                    <button class="agregarHorasBtn">Agregar Horas de Limpieza</button>
                    <button class="editarExtrasBtn">Editar Extras</button>
                `;
                contenido.appendChild(entrada);

                const borrarBtn = entrada.querySelector('.borrarBtn');
                borrarBtn.addEventListener('click', function () {
                    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
                        borrarRegistro(registro);
                        entrada.remove();
                    }
                });

                const agregarHorasBtn = entrada.querySelector('.agregarHorasBtn');
                agregarHorasBtn.addEventListener('click', function () {
                    agregarHoras(registro, entrada);
                });

                const editarExtrasBtn = entrada.querySelector('.editarExtrasBtn');
                editarExtrasBtn.addEventListener('click', function () {
                    editarExtras(registro, entrada);
                });
            });

            grupo.appendChild(titulo);
            grupo.appendChild(contenido);
            historialRegistros.appendChild(grupo);
        });
    }

    function agruparRegistrosPorFecha(registros) {
        const registrosAgrupados = new Map();

        registros.forEach(registro => {
            const fechaEntrada = registro.fechaEntrada ? new Date(registro.fechaEntrada) : null;
            const fechaKey = obtenerFechaFormateada(fechaEntrada);

            if (!registrosAgrupados.has(fechaKey)) {
                registrosAgrupados.set(fechaKey, []);
            }

            registrosAgrupados.get(fechaKey).push(registro);
        });

        return registrosAgrupados;
    }

    function obtenerFechaFormateada(fecha) {
        if (!fecha) {
            return 'N/A';
        }

        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1; // Meses en JavaScript son de 0 a 11
        const año = fecha.getFullYear();

        return `${año}-${mes < 10 ? '0' : ''}${mes}-${dia < 10 ? '0' : ''}${dia}`;
    }

    registroForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const nuevoRegistro = {
            vivienda: registroForm.vivienda.value,
            fechaEntrada: registroForm.fechaEntrada.value || null,
            horaEntrada: registroForm.horaEntrada.value || '',
            fechaSalida: registroForm.fechaSalida.value || null,
            horaSalida: registroForm.horaSalida.value || '',
            horasLimpiadora: registroForm.horasLimpiadora.value || "0",
            extras: obtenerExtrasSeleccionados()
        };

        if ((nuevoRegistro.fechaEntrada || nuevoRegistro.fechaSalida) && nuevoRegistro.vivienda) {
            registros.push(nuevoRegistro);
            localStorage.setItem('registrosViviendas', JSON.stringify(registros));
            agregarRegistroAlHistorial(nuevoRegistro);
            registroForm.reset();
            actualizarUI();
        } else {
            alert('Por favor, complete el nombre del piso y al menos una entrada o salida.');
        }
    });

    function obtenerExtrasSeleccionados() {
        return Array.from(document.querySelectorAll('input[name="extras"]:checked')).map(el => el.value);
    }

    function agregarRegistroAlHistorial(registro) {
        const div = document.createElement('div');
        div.classList.add('registro');
        div.innerHTML = `
            <p><strong>Vivienda:</strong> ${registro.vivienda}</p>
            <p><strong>Entrada:</strong> ${registro.fechaEntrada ? `${registro.fechaEntrada} a las ${registro.horaEntrada || ''}` : 'N/A'}</p>
            <p><strong>Salida:</strong> ${registro.fechaSalida ? `${registro.fechaSalida} a las ${registro.horaSalida || ''}` : 'N/A'}</p>
            <p><strong>Horas de Limpieza:</strong> ${registro.horasLimpiadora}</p>
            <p><strong>Extras:</strong> ${registro.extras.join(", ")}</p>
            <button class="borrarBtn">Borrar</button>
            <button class="agregarHorasBtn">Agregar Horas de Limpieza</button>
            <button class="editarExtrasBtn">Editar Extras</button>
        `;
        historialRegistros.appendChild(div);

        // Agregar eventos para expandir y contraer
        const borrarBtn = div.querySelector('.borrarBtn');
        borrarBtn.addEventListener('click', function () {
            if (confirm('¿Está seguro de que desea eliminar este registro?')) {
                borrarRegistro(registro);
                div.remove();
            }
        });

        const agregarHorasBtn = div.querySelector('.agregarHorasBtn');
        agregarHorasBtn.addEventListener('click', function () {
            agregarHoras(registro, div);
        });

        const editarExtrasBtn = div.querySelector('.editarExtrasBtn');
        editarExtrasBtn.addEventListener('click', function () {
            editarExtras(registro, div);
        });
    }

    function agregarHoras(registro, div) {
        const inputDecimalHoras = prompt("Ingrese las horas de limpieza en formato decimal (por ejemplo, 4.45 para 4 horas y 45 minutos):", "4.45");

        if (inputDecimalHoras !== null && !isNaN(inputDecimalHoras)) {
            const decimalHoras = parseFloat(inputDecimalHoras);

            const horas = Math.floor(decimalHoras);
            const minutos = Math.round((decimalHoras % 1) * 60);

            registro.horasLimpiadora = horas + minutos / 60;
            actualizarRegistro(registro);
            actualizarVistaRegistro(div, registro);
        } else {
            alert("Formato de entrada no válido. Por favor, ingrese las horas en formato decimal.");
        }
    }

    function editarExtras(registro, div) {
        const extras = registro.extras.join(", ");
        const nuevosExtras = window.prompt('Editar Extras:', extras);

        if (nuevosExtras !== null) {
            registro.extras = nuevosExtras.split(',').map(extra => extra.trim());
            actualizarRegistro(registro);
            actualizarVistaRegistro(div, registro);
        }
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

    function descargarCSV() {
        let csvContent = "\uFEFF"; // BOM para UTF-8
        csvContent += "Vivienda;Fecha Entrada;Hora Entrada;Fecha Salida;Hora Salida;Horas Limpieza;Extras\r\n";
        registros.forEach(function (registro) {
            let row = [
                registro.vivienda,
                registro.fechaEntrada || '',
                registro.horaEntrada || '',
                registro.fechaSalida || '',
                registro.horaSalida || '',
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

    btnDescargarCSV.addEventListener('click', descargarCSV);
    btnDescargar2CSV.addEventListener('click', descargarCSV);

    actualizarUI();
});
