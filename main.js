// script.js

// Función para cargar el JSON y mostrar los proyectos
function cargarProyectos() {
    fetch('proyectos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el JSON');
            }
            return response.json();
        })
        .then(data => mostrarProyectos(data))
        .catch(error => console.log(error));
}

// Función para mostrar los proyectos en el HTML
function mostrarProyectos(proyectos) {
    const elemento = document.getElementById("proyectos");
    elemento.innerHTML = ''; // Limpiar el contenido previo

    // Crear una variable para almacenar el HTML
    let html = '<h1>Proyectos Realizados</h1>';

    proyectos.forEach(proyecto => {
        html += `
            <div class="proyecto">
                <img src="${proyecto.imagen}" alt="${proyecto.nombre}" class="Image-project">
                <h1 class="title-project">${proyecto.nombre}</h1>
                <p class="description-project">${proyecto.descripcion}</p>
                <a class="button-project" href="${proyecto.url}" target="_black">Github</a>
            </div>
        `;
    });

    // Asignar el HTML generado a innerHTML una sola vez
    elemento.innerHTML = html;
}

// Llamar a la función para cargar los proyectos
cargarProyectos();