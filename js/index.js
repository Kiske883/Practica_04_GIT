// Lista de productos simulados

// Pongo las 2 APIs, ya que la de Render es un tanto caprichosa de vez en cuando se cae el servicio
// pero es donde tengo publicado mi API realizada en Node.js : dejo el link de gitHub
// https://github.com/Kiske883/Practica04_API_Node

// Llamada al Api JsonBlob : https://jsonblob.com/api/jsonBlob/1372498670355931136
// Llamada al Api Node de Render : "https://practica04-api-node.onrender.com/api/articulos"

/*
const productos = [
  { id: 1, empresa: "Levis", nombre: "Camisa", familia: "Camisa", descripcion: "Camisa chulisima hawaiana que filipas", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 20, valoracion: "5", totalValoraciones: "2950", dto: "5" },
  { id: 2, empresa: "Dickies", nombre: "Pantalón", familia: "Pantalón", descripcion: "Pantalones xanxan que caben 4", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 35, valoracion: "4", totalValoraciones: "2950", dto: "" },
  { id: 3, empresa: "Nike", nombre: "Zapatos", familia: "Zapatos", descripcion: "Unas Jordan que haces orejas nen", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 60, valoracion: "3", totalValoraciones: "2950", dto: "" },
  { id: 4, empresa: "Nike", nombre: "Zapatos", familia: "Zapatos", descripcion: "Otras Jordan bonitas no, lo siguiente", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 120.5, valoracion: "5", totalValoraciones: "2950", dto: "10" },
  { id: 5, empresa: "Nike", nombre: "Zapatos", familia: "Zapatos", descripcion: "Estas no son Jordan, pero son las Nike guarache", opciones: "", informacion: "", imagen: "https://placehold.co/1000x1000", precio: 90.99, valoracion: "4", totalValoraciones: "2950", dto: "" }
];
*/

let productos = [];

fetch("https://jsonblob.com/api/jsonBlob/1372590868086841344")
  .then(response => {
    if (!response.ok) throw new Error("Error al cargar los artículos");
    return response.json();
  })
  .then(data => {
    productos = data;
    poblarSelectMarcas();
    productsRender();
    filtroPorMarca();
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

  eliminar(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.renderizar();
    }
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

      li.innerHTML = `${item.nombre} x${item.cantidad} - ${item.precio * item.cantidad}€
                        <button class="btn-eliminar" data-id="${item.id}" title="Eliminar">❌</button>
                        `;

      lista.appendChild(li);
    });

    lista.querySelectorAll(".btn-eliminar").forEach(boton => {
      boton.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        this.eliminar(id);
      });
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

// Poblamos el select con las marcas que recibamos de la API
function poblarSelectMarcas() {
  const select = document.getElementById("search-category");
  const marcasUnicas = [...new Set(productos.map(p => p.empresa))];

  // Limpiar opciones antiguas y añadir "Todas las marcas"
  select.innerHTML = `<option value="">Todas las marcas</option>`;

  marcasUnicas.forEach(marca => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    select.appendChild(option);
  });
}

function filtroPorMarca() {

  const boton = document.getElementById("search-button");
  const input = document.getElementById("search-input");
  const select = document.getElementById("search-category");

  // forzamos el click del boton si el select de marca cambia
  select.addEventListener("change", () => boton.click());

  // forzamos el click del boton si apretamos enter con focus del input
  input.addEventListener("keyup", e => {
    if (e.key === "Enter") boton.click();
  });

  boton.addEventListener("click", () => {
    const texto = input.value.toLowerCase();
    const marcaSeleccionada = select.value;

    const filtrados = productos.filter(prod => {
      const coincideTexto =
        prod.nombre.toLowerCase().includes(texto) ||
        prod.descripcion.toLowerCase().includes(texto);

      const coincideMarca =
        marcaSeleccionada === "" || prod.empresa === marcaSeleccionada;

      return coincideTexto && coincideMarca;
    });

    productsRender(filtrados);
  });
}

// Instanciar carrito
const carrito = new Carrito();

// Renderizar productos en pantalla
// Lo encapsulamos en una function, para poder tener el control y ejecutar el render justo despues 
// de la recepcion de la respuesta del API
function productsRender(lista = productos) {

  const contenedor = document.getElementById("product-container");

  contenedor.innerHTML = "";

  lista.forEach(prod => {

    const div = document.createElement("article");
    div.classList.add("product-card");

    let html;

    html = `
    <img src="${prod.imagen}" alt="" class="product-image" />  
    <h3 class="product-brand">${prod.empresa}</h3>
    <p class="product-title">${prod.descripcion}</p>
  `;

    html += generarEstrellas(prod.valoracion, prod.totalValoraciones);

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
