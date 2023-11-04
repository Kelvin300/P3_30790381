var modal = document.getElementById("modal-agregar");
var btn = document.getElementById("btn-agregar");
var span = document.getElementsByClassName("close")[0];

// Función para mostrar la ventana al hacer clic en el botón
btn.onclick = function() {
  modal.classList.add("show");
}

// Función para cerrar la ventana al hacer clic en la x
span.onclick = function() {
  modal.classList.remove("show");
}

// Función para cerrar la ventana al hacer clic fuera de ella
window.onclick = function(event) {
  if (event.target == modal) {
    modal.classList.remove("show");
  }
}