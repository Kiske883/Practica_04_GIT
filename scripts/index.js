/*
const listaProductos = {
"currency": "€",
"products": [ {"SKU": "0K3QOSOV4V","title": "iFhone 13 Pro","price": "938.99"},
              {"SKU": "TGD5XORY1L","title": "Cargador","price": "49.99"},
              {"SKU": "IOKW9BQ9F3","title": "Funda de piel","price": "79.99"} ] } ;
*/

let listaProductos = [];
let moneda = "";
let productos = [];

// Lo envolvemos en DomContentLoaded para asegurarnos que el render puede acceder a todos los objetos
document.addEventListener("DOMContentLoaded", () => {
    fetch("https://jsonblob.com/api/jsonBlob/1382678408647073792")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar los artículos");
            return response.json();
        })
        .then(data => {

            // Informo las variables en el momento que recibo la respuesta
            // para no tener problemas de undefined
            listaProductos = data;
            moneda = listaProductos.currency;
            productos = listaProductos.products;

            productsRender();

            // aqui renderizamos la moneda, ya que es cuando nos aseguramos que hemos recibido los datos
            // del API
            const myCurrency = document.querySelector('.moneda');
            myCurrency.textContent = moneda;
        })
        .catch(error => {
            console.error("Error al obtener productos:", error);
        });

    // Eliminamos textos del html
    const myTitleText = document.querySelector('.header-container--title');
    myTitleText.textContent = 'agoodShop';

    const myFooterText = document.querySelector('.container__wrapper-footer');
    myFooterText.textContent = '© agoodShop';

});

// Clase Carrito
class Carrito {

    constructor() {
        this.items = [];
    }

    actualizarUnidades(producto, cantidad) {
        const item = this.items.find(it => it.SKU === producto.SKU);

        if (item) {

            item.cantidad = cantidad;

            if (item.cantidad <= 0) {
                this.items = this.items.filter(it => it.SKU !== producto.SKU);
            }
        } else {
            if (cantidad > 0) {
                this.items.push({
                    SKU: producto.SKU,
                    title: producto.title,
                    price: parseFloat(producto.price),
                    cantidad: cantidad
                });
            }
        }
        renderizar(this);
    }
    
    obtenerInformacionProducto(sku) {
        // Devuelve los datos de un producto además de las unidades seleccionadas

        // , yo hubiera devuelto solo cantidad en lugar de todo el objeto        
        // return this.items.find(item => item.SKU === sku)?.cantidad || 0;

        // Ahora tengo dudas, no sé si devolver el producto entero será correcto
        // return this.items.find(item => item.SKU === sku) || null;

        // Es igual, devuelvo textualmente lo que pide la practica ( sku y quantity )
        const myItem = this.items.find(item => item.SKU === sku);

        return myItem ? { sku: myItem.SKU, quantity: myItem.cantidad } : null;

    }
    
    obtenerCarrito() {
        // Devuelve información de los productos añadidos al carrito
        // Además del total calculado de todos los productos y el currency
        return {
            total: this.getTotal().toFixed(2),
            currency: moneda,
            products: this.items.map(item => ({
                sku: item.SKU,
                title: item.title,
                price: item.price,
                cantidad: item.cantidad
            }))
        };
    }

    getTotal() {
        return this.items.reduce((acc, item) => acc + item.price * item.cantidad, 0);
    }
    
}
// Final Clase carrito

const carrito = new Carrito();

function renderizar(carrito) {

    // LAN0 - 20250606 - Modificamos la forma de localizar los objetos a raiz de la clase de Felix 20250605
    // const lista = document.getElementById("carrito-items");
    // const total = document.getElementById("carrito-total");
    // const contador = document.getElementById("cart-count");

    const lista = document.querySelector("#carrito-items");
    const total = document.querySelector("#carrito-total");
    const template = document.querySelector("#template-item");

    // Felix : aún utilizando template, para que no añada productos indefinidamente
    //         tengo que eliminar el contenido anterior, uso innerHTML por que creo es
    //         lo más comodo, he visto que puedo utilizar un bucle y eliminar todos 
    //         los nodos en luga de innerHTML ... 
    //         while (lista.firstChild) {
    //           lista.removeChild(lista.firstChild);
    //         }
    //         ... pero es que lo encuentro feo, no se, no creo que haya ningun problema de 
    //         seguridad, ya que es mi codigo quien controla lo que se añade al innerHtml en este caso ""

    lista.innerHTML = "";

    carrito.items.forEach(item => {
        // Clonar el contenido del template
        const clone = template.content.cloneNode(true);

        // Rellenar datos
        const spanTitle = clone.querySelector(".item-title");
        const spanPrice = clone.querySelector(".item-price");

        spanTitle.textContent = `${item.title} x ${item.cantidad}`;
        spanPrice.textContent = `${(item.price * item.cantidad).toFixed(2)} ${moneda}`;

        // Añadir al DOM
        lista.appendChild(clone);
    });    

    total.textContent = carrito.obtenerCarrito().total;

}

function productsRender(lista = productos) {

    const contenedor = document.querySelector(".tb-products-container");
    const template = document.getElementById("product-row-template");

    // LAN0 - 20250613 - Lo comentado anteriormente
    contenedor.innerHTML = "";

    lista.forEach(prod => {
        const clone = template.content.cloneNode(true);
        const tr = clone.querySelector("tr");

        const titleEl = clone.querySelector(".product-title");
        const skuEl = clone.querySelector(".product-sku");
        const priceEl = clone.querySelector(".product-price");
        const totalEl = clone.querySelector(".product-total");

        const inputCantidad = clone.querySelector(".inputNumber");
        const btnRestar = clone.querySelector(".btn-restar");
        const btnSumar = clone.querySelector(".btn-sumar");

        const precio = parseFloat(prod.price);

        titleEl.textContent = prod.title;
        skuEl.textContent = `Ref: ${prod.SKU}`;
        priceEl.textContent = `${prod.price} ${moneda}`;

        const actualizarTotal = (cantidad) => {
            totalEl.textContent = `${(precio * cantidad).toFixed(2)} ${moneda}`;
        };

        let producto = carrito.obtenerInformacionProducto(prod.SKU);
        let cantidad = producto ? producto.cantidad : 0;

        inputCantidad.value = cantidad;
        actualizarTotal(cantidad);

        btnRestar.addEventListener("click", () => {
            cantidad = Math.max(0, parseInt(inputCantidad.value) - 1);
            inputCantidad.value = cantidad;
            carrito.actualizarUnidades(prod, cantidad);
            actualizarTotal(cantidad);
        });

        btnSumar.addEventListener("click", () => {
            cantidad = parseInt(inputCantidad.value) + 1;
            inputCantidad.value = cantidad;
            carrito.actualizarUnidades(prod, cantidad);
            actualizarTotal(cantidad);
        });

        inputCantidad.addEventListener("change", () => {
            let nuevaCantidad = parseInt(inputCantidad.value);
            if (isNaN(nuevaCantidad) || nuevaCantidad < 0) nuevaCantidad = 0;
            inputCantidad.value = nuevaCantidad;
            carrito.actualizarUnidades(prod, nuevaCantidad);
            actualizarTotal(nuevaCantidad);
        });

        contenedor.appendChild(tr);
    });
}

