document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const historialRegistros = document.getElementById('historialRegistros');
    let registros = JSON.parse(localStorage.getItem('registrosViviendas')) || [];

    registroForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const vivienda = registroForm.vivienda.value;
        const fechaEntrada = registroForm.fechaEntrada.value;
        const horaEntrada = registroForm.horaEntrada.value;
        const fechaSalida = registroForm.fechaSalida.value;
        const horaSalida = registroForm.horaSalida.value;
        const horasLimpiadora = registroForm.horasLimpiadora.value;
        const extras = Array.from(registroForm.querySelectorAll('input[name="extras"]:checked'))
                            .map(checkbox => checkbox.value)
                            .join(", ");

        // Validación básica
        if (!vivienda || (!fechaEntrada && !fechaSalida)) {
            alert('Debe seleccionar una vivienda y al menos una fecha de entrada o salida.');
            return;
        }

        const registro = {
            vivienda,
            fechaEntrada,
            horaEntrada,
            fechaSalida,
            horaSalida,
            horasLimpiadora,
            extras
        };

        registros.push(registro);
        localStorage.setItem('registrosViviendas', JSON.stringify(registros));
        agregarRegistroAlHistorial(registro);
        registroForm.reset();
        mostrarViviendasParaHoyYManana();
    });

    function agregarRegistroAlHistorial(registro) {
        const div = document.createElement('div');
        div.classList.add('registro');
        div.innerHTML = `
            <p><strong>Vivienda:</strong> ${registro.vivienda}</p>
            <p><strong>Entrada:</strong> ${registro.fechaEntrada} a las ${registro.horaEntrada}</p>
            <p><strong>Salida:</strong> ${registro.fechaSalida} a las ${registro.horaSalida}</p>
            <p><strong>Horas de Limpieza:</strong> ${registro.horasLimpiadora}</p>
            <p><strong>Extras:</strong> ${registro.extras}</p>
            <button class="borrarBtn">Borrar</button>
        `;
        historialRegistros.appendChild(div);
        div.querySelector('.borrarBtn').addEventListener('click', function() {
            if (confirm('¿Está seguro de que desea eliminar este registro?')) {
                borrarRegistro(registros.indexOf(registro));
            }
        });
    }

    function borrarRegistro(indice) {
        registros.splice(indice, 1);
        localStorage.setItem('registrosViviendas', JSON.stringify(registros));
        historialRegistros.children[indice].remove();
        mostrarViviendasParaHoyYManana();
    }

    function mostrarViviendasParaHoyYManana() {
        const viviendasHoy = document.getElementById('viviendasHoy');
        const viviendasManana = document.getElementById('viviendasManana');
        const hoy = new Date();
        const manana = new Date(hoy.getTime() + (24 * 60 * 60 * 1000));
        hoy.setHours(0, 0, 0, 0);
        manana.setHours(0, 0, 0, 0);

        viviendasHoy.innerHTML = '';
        viviendasManana.innerHTML = '';

        registros.forEach(registro => {
            const fechaDeEntrada = new Date(registro.fechaEntrada);
            fechaDeEntrada.setHours(0, 0, 0, 0);
            if (fechaDeEntrada.getTime() === hoy.getTime()) {
                viviendasHoy.innerHTML += `<p>${registro.vivienda}</p>`;
            } else if (fechaDeEntrada.getTime() === manana.getTime()) {
                viviendasManana.innerHTML += `<p>${registro.vivienda}</p>`;
            }
        });
    }

    registros.forEach(agregarRegistroAlHistorial);
    mostrarViviendasParaHoyYManana();
});


