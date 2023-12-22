document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const historialRegistros = document.getElementById('historialRegistros');
    let registros = JSON.parse(localStorage.getItem('registrosViviendas')) || [];

    registroForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Recolectar la información del formulario
        const vivienda = registroForm.querySelector('#vivienda').value;
        const fechaEntrada = registroForm.querySelector('#fechaEntrada').value;
        const horaEntrada = registroForm.querySelector('#horaEntrada').value;
        const fechaSalida = registroForm.querySelector('#fechaSalida').value;
        const horaSalida = registroForm.querySelector('#horaSalida').value;
        const horasLimpiadora = registroForm.querySelector('#horasLimpiadora').value;
        const extras = Array.from(registroForm.querySelectorAll('input[name="extras"]:checked'))
                            .map(checkbox => checkbox.value)
                            .join("; "); // Usamos punto y coma para separar los extras

        // Crear un objeto de registro
        const registro = {
            vivienda,
            fechaEntrada,
            horaEntrada,
            fechaSalida,
            horaSalida,
            horasLimpiadora,
            extras
        };

        // Añadir al historial y almacenar en localStorage
        registros.push(registro);
        localStorage.setItem('registrosViviendas', JSON.stringify(registros));
        agregarRegistroAlHistorial(registro);
        registroForm.reset();
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
        `;
        historialRegistros.appendChild(div);
    }

    document.getElementById('descargarCSV').addEventListener('click', function() {
        descargarCSV(registros);
    });

    function descargarCSV(registros) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM para Excel
        csvContent += "Vivienda,Fecha Entrada,Hora Entrada,Fecha Salida,Hora Salida,Horas Limpieza,Extras\r\n";

        registros.forEach(function(reg) {
            const row = [
                reg.vivienda,
                reg.fechaEntrada,
                reg.horaEntrada,
                reg.fechaSalida,
                reg.horaSalida,
                reg.horasLimpiadora,
                reg.extras
            ].map(field => `"${field}"`).join(','); // Envuelve cada campo en comillas dobles
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "registros_viviendas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Cargar el historial previo al abrir la página
    registros.forEach(registro => agregarRegistroAlHistorial(registro));
});

