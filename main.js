const elemento = document.getElementById("tarjetas");

let html = '';

function mostrarProyectos(proyectos) {
    proyectos.forEach(proyecto => {
        html = `
            <div class="proyecto">
                <img src="${proyecto.imagen}" alt="${proyecto.nombre}" style="width: 400px; height: 400px;">
                <h1 class="title-project">${proyecto.nombre}</h1>
                <p class="description-project">${proyecto.descripcion}</p>
                <a class="button-project" href="${proyecto.url}" target="_black">Github</a>
            </div>
        `;
        elemento.innerHTML += html;
    });
}

window.addEventListener('load', () => {
    fetch('proyectos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el JSON');
            }
            return response.json();
        })
        .then(data => mostrarProyectos(data))
        .catch(error => console.log(error));
})