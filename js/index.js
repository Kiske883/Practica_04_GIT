// Lista de productos simulados

// Pongo las 2 APIs, ya que la de Render es un tanto caprichosa de vez en cuando se cae el servicio
// pero es donde tengo publicado mi API realizada en Node.js : dejo el link de gitHub
// https://github.com/Kiske883/Practica04_API_Node

// Llamada al Api JsonBlob : https://jsonblob.com/api/jsonBlob/1372498670355931136
// Llamada al Api Node de Render : "https://practica04-api-node.onrender.com/api/articulos"

/*
const productos = [
  { id: 1, empresa: "Levis", nombre: "Camisa", familia: "Camisa", descripcion: "Camisa chulisima hawaiana que filipas", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 20, valoracion: "5", dto: "5" },
  { id: 2, empresa: "Dickies", nombre: "Pantalón", familia: "Pantalón", descripcion: "Pantalones xanxan que caben 4", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 35, valoracion: "4", dto: "" },
  { id: 3, empresa: "Nike", nombre: "Zapatos", familia: "Zapatos", descripcion: "Unas Jordan que haces orejas nen", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 60, valoracion: "3", dto: "" },
  { id: 4, empresa: "Nike", nombre: "Zapatos", familia: "Zapatos", descripcion: "Otras Jordan bonitas no, lo siguiente", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 120.5, valoracion: "5", dto: "10" },
  { id: 5, empresa: "Nike", nombre: "Zapatos", familia: "Zapatos", descripcion: "Estas no son Jordan, pero son las Nike guarache", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 90.99, valoracion: "4", dto: "" }
];
*/

let productos = [];

fetch("https://jsonblob.com/api/jsonBlob/1372498670355931136")
  .then(response => {
    if (!response.ok) throw new Error("Error al cargar los artículos");
    return response.json();
  })
  .then(data => {
    productos = data;
    productsRender(); 
  })
  .catch(error => {
    console.error("Error al obtener productos:", error);
  });


// Clase Carrito
class Carrito {
  constructor() {
    this.items = [];
  }

  agregar(producto) {
    const existente = this.items.find(item => item.id === producto.id);
    if (existente) {
      existente.cantidad++;
    } else {
      this.items.push({ ...producto, cantidad: 1 });
    }
    this.renderizar();
  }

  vaciar() {
    this.items = [];
    this.renderizar();
  }

  total() {
    return this.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  renderizar() {

    const lista = document.getElementById("carrito-items");
    const total = document.getElementById("carrito-total");
    const contador = document.getElementById("cart-count");

    lista.innerHTML = "";

    this.items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}`;
      lista.appendChild(li);
    });

    total.textContent = this.total();

    const totalCantidad = this.items.reduce((nConta, item) => nConta + item.cantidad, 0);
    contador.textContent = totalCantidad;
  }
}

// Genracion de estrellas por producto
function generarEstrellas(valoracion, cantidadReseñas) {
  const maxEstrellas = 5;
  const estrellasLlenas = Math.floor(valoracion);
  const estrellasVacias = maxEstrellas - estrellasLlenas;

  let estrellas = "⭐".repeat(estrellasLlenas) + "☆".repeat(estrellasVacias);

  return `
    <div class="product-rating">
      ${estrellas} <span class="rating-count">(${cantidadReseñas})</span>
    </div>
  `;
}

// Instanciar carrito
const carrito = new Carrito();

// Renderizar productos en pantalla
// Lo encapsulamos en una function, para poder tener el control y ejecutar el render justo despues 
// de la recepcion de la respuesta del API
function productsRender() {
  
  const contenedor = document.getElementById("product-container");

  productos.forEach(prod => {

    const div = document.createElement("article");
    div.classList.add("product-card");

    let html;

    html = `
    <img src="${prod.imagen}" alt="" class="product-image" />  
    <h3 class="product-brand">${prod.empresa}</h3>
    <p class="product-title">${prod.descripcion}</p>
  `;

    html += generarEstrellas(prod.valoracion, "2950");

    html += `
    <div class="product-price">
      <span class="price-amount">${prod.precio} €</span>
  `;

    if (prod.dto !== "") {
      html += `<span class="discount-badge">Ahorra ${prod.dto} %</span>`;
    }

    html += `
    </div>    

    <button class="add-to-cart">Añadir a la cesta</button>
  `;

    div.innerHTML = html;

    div.querySelector("button").addEventListener("click", () => carrito.agregar(prod));
    contenedor.appendChild(div);
  });
}

// Vaciar carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => carrito.vaciar());