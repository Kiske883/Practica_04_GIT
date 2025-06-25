/*
const listaProductos = {
"currency": "€",
"products": [ {"SKU": "0K3QOSOV4V","title": "iFhone 13 Pro","price": "938.99"},
              {"SKU": "TGD5XORY1L","title": "Cargador","price": "49.99"},
              {"SKU": "IOKW9BQ9F3","title": "Funda de piel","price": "79.99"} ] } ;
*/

let moneda = "";
let productos = [];

// Utilizo constantes hardcodeadas para informar min y max de stocks
const minUds = 0;
const maxUds = 99;

// El init me he visto obligado a convertirlo en asincrono para poder llamar 
// a la function loadTemplates pero que realmente no sería necesario ya que al final no
// cargo los templates de templates.html sino directamente de los templates de index.html

const init = async (data) => {

    // LAN0 - 20250620 - Anulado por Error de CORS, una lastima pq el index.html era minimalista
    // Cargamos los templates al principio de todo
    // await loadTemplates();

    // Informo las variables en el momento que recibo la respuesta
    // para no tener problemas de undefined
    moneda = data.currency;

    productos = data.products;

    productsRender();

    // aqui renderizamos la moneda, ya que es cuando nos aseguramos que hemos 
    // recibido los datos del API
    const myCurrency = document.querySelector('.moneda');
    myCurrency.textContent = moneda;

    // Eliminamos textos del html y se los añadimos desde js, para dejar html lo mas limpio posible
    const myTotalHeader = document.querySelector('.cart-title');
    myTotalHeader.textContent = "Total";

    const myTotalQuantity = document.querySelector('.total-label');
    myTotalQuantity.textContent = "TOTAL";

    const myCarritoTotal = document.querySelector('#cart-total');
    myCarritoTotal.textContent = "0.00";

    const myTitleText = document.querySelector('.header-container--title');
    myTitleText.textContent = 'agoodShop';

    const myFooterText = document.querySelector('.container__wrapper-footer');
    myFooterText.textContent = '© agoodShop';

}

// LAN0 - 20250618 - He montado un html para tener los templates separados y darle más 
//                   claridad, y así dejar el index.html en su minimima expresión. Ahora
//                   no se si realmente es buena praxis ... creo que más claro queda

// LAN0 - 20250619 - Mi gozo en un pozo : CORS vino a visitarme :(

// Opcion 1 : chrome.exe --disable-web-security --user-data-dir="C:\temp\chrome"    
// Opcion 2 : https://cors-anywhere.herokuapp.com/corsdemo

// He tenido problemas con CORS en la petición fetch para recuperar template.html, ya que desde live Server de 
// VisualCode funciona sin problemas, pero si lo ejecuto directamente de file:// que entiendo es como lo vas a ejecutar,
// el navegador me devuelve Error de CORS, pensaba que seria tan facil como en java añadirle 
// Access-Control-Allow-Origin y listo, pero no lo he conseguido.

// He encontrado 2 / 3 soluciones ... 
// - modificar la configuración del navegador, desestimado. 
// - utilizar un proxy por ejemplo, cors-anywhere.herokuapp.com que tambien he desestimado.
// - o que se ejecute desde un servidor web, que tambien he desestimado. 

// así que al final he decidido hacer Rollback y dejar los tags de templates en el mismo index.html :S

// Esta es la función que iba a utilizar, pero solo funciona si lo lanzo desde vsCode con LiverServer o desde
// un servidor Web, así que la mantengo, pq me parece buena idea, siempre y cuando la web este ubicada
// en un Tomcat o XAMPP o parecido, pero no ejecutandose directamente desde local con dblClick a index.html
async function loadTemplates() {

    // Petición para obtener el contenido de mi templates  
    const response = await fetch('templates.html');

    // Convertimos la response a texto
    const text = await response.text();

    const parser = new DOMParser();

    // Convertimos nuestro texto a doc HTML completo
    const doc = parser.parseFromString(text, 'text/html');

    // Extraemos todos los nodos de body de nuestro doc y lo importamos al final del DOM
    // const children = doc.body.children;
    // for (const child of children) {
    // document.body.append(child);
    // }
    // Versión azucarada
    document.body.append(...doc.body.children);
}

// Lo envolvemos en DomContentLoaded para asegurarnos que el render puede acceder a todos los objetos
document.addEventListener("DOMContentLoaded", () => {

    // const proxy = 'https://cors-anywhere.herokuapp.com/';

    // FELIX : He dejado estas 2 URLs en jsonBlob, donde el API retorna 3 o 5 productos, para hacer pruebas
    //         de renderizado dinámico dependiendo del contenido de la API
    // Tres productos
    const url = 'https://jsonblob.com/api/jsonBlob/1382678408647073792';

    // Cinco productos
    // const url = 'https://jsonblob.com/api/jsonBlob/1385546057181749248'; 

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar los artículos");
            return response.json();
        })
        .then(data => {
            init(data);
        })
        .catch(error => {
            console.error("Error al obtener productos:", error);
        });

});

const carrito = new Carrito();

const totalRender = (carrito) => {

    // LAN0 - 20250606 - Modificamos el metodo de localizar los objetos a raiz de la clase de Felix 20250605
    // const lista = document.getElementById("cart-items");
    // const total = document.getElementById("cart-total");

    const lista = document.querySelector("#cart-items");
    const total = document.querySelector("#cart-total");
    const template = document.querySelector("#template-item");

    // Felix : aún utilizando template, para que no añada productos indefinidamente
    //         tengo que eliminar el contenido anterior, uso innerHTML por que creo es
    //         lo más comodo, he visto que puedo utilizar un bucle y eliminar todos 
    //         los nodos en lugar de innerHTML ... 
    //         while (lista.firstChild) {
    //           lista.removeChild(lista.firstChild);
    //         }
    //         ... pero es que lo encuentro feo, no creo que haya ningun problema de seguridad, 
    //         ya que es mi codigo quien controla lo que se añade al innerHtml, en este caso ""

    // lista.innerHTML = "";

    // LAN0 - 20250625 - Rectificación a raiz de la practica de la última clase 20250624, así me ahorro innerHTML
    lista.textContent = "";

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

const headerProductsRender = () => {

    const contenedor = document.querySelector(".th-header-container");
    const template = document.querySelector("#product-header-template");
    const clone = template.content.cloneNode(true);
    const tr = clone.querySelector("tr");

    /*
    const headerProduct = clone.querySelector(".header-product");
    const headerQuantity = clone.querySelector(".header-cantidad");
    const headerUnity = clone.querySelector(".header-unidad");
    const headerTotal = clone.querySelector(".header-total");
    */

    // LAN0 - 20250618 - Para refactorizar codigo, desestructuro el array devuelto por querySelectorAll
    const [
        headerProduct,
        headerQuantity,
        headerUnity,
        headerTotal
    ] = tr.querySelectorAll("th");

    headerProduct.textContent = "Producto";
    headerQuantity.textContent = "Cantidad";
    headerUnity.textContent = "Unidad";
    headerTotal.textContent = "Total";

    contenedor.appendChild(tr);

}

// LAN0 - 20250620 - Esta funcion, la añadiría como metodo a la clase carrito pero voy a mantenerme fiel
//                   salvo getTotal(), a los metodos descritos en la practica
const getReviewedQuantity = (cantidad) => {

    if (isNaN(cantidad)) cantidad = parseInt(minUds);

    if (cantidad < parseInt(minUds)) cantidad = parseInt(minUds);
    if (cantidad > parseInt(maxUds)) cantidad = parseInt(maxUds);

    return cantidad;

}

const productsRender = (lista = productos) => {

    headerProductsRender();

    const contenedor = document.querySelector(".tb-products-container");
    const template = document.querySelector("#product-row-template");

    contenedor.textContent = "";

    lista.forEach(prod => {
        const clone = template.content.cloneNode(true);
        const tr = clone.querySelector("tr");

        const titleEl = clone.querySelector(".product-title");
        const skuEl = clone.querySelector(".product-sku");
        const priceEl = clone.querySelector(".product-price");
        const totalEl = clone.querySelector(".product-total");

        const inputCantidad = clone.querySelector(".inputNumber");

        // LAN0 - 20250620 - Despues de clase 20250619 añadimos min y maximos
        //                   Aún viendo desde inspeccionador que lso inputs tienen los atributos min y max 
        //                   bien informados, puedo superar los limites, así que lo voy a controlarlo
        //                   en el momento en que reciba el evento tanto de los +/- como el change del input
        inputCantidad.min = minUds;
        inputCantidad.max = maxUds;

        // le asignamos a data-id el id unico del producto
        inputCantidad.dataset.id = prod.SKU;

        const btnRestar = clone.querySelector(".btn-restar");
        const btnSumar = clone.querySelector(".btn-sumar");

        const precio = parseFloat(prod.price);

        titleEl.textContent = prod.title;
        skuEl.textContent = `Ref: ${prod.SKU}`;
        priceEl.textContent = `${prod.price} ${moneda}`;

        const actualizarTotal = (cantidad) => {
            totalEl.textContent = `${(precio * cantidad).toFixed(2)} ${moneda}`;
        };

        let infoResultBean = carrito.obtenerInformacionProducto(prod.SKU);
        let cantidad = infoResultBean ? infoResultBean.cantidad : minUds;

        inputCantidad.value = cantidad;
        actualizarTotal(cantidad);

        // LAN0 - 20250620 - al añadir minUds, podria ser modificable en lugar de 0 por ejemplo 10, tengo que controlar que si minUds > 0
        //                   actualice el total, ya que si no arrancaria con los productos por ejemplo a 10, y carrito estaria vacio.
        if (minUds > 0) {
            carrito.actualizarUnidades(prod, cantidad);
        }

        /* LAN0 - 20250625 - Anulamos la asignación de eventos click en el mismo bucle, y lo asignamos directamente 
           al .tb-products-container para ahorrarnoos eventos a raiz del ejercicio de movies clase del 20250624

        btnRestar.addEventListener("click", () => {

            cantidad = Math.max(inputCantidad.min, parseInt(inputCantidad.value) - 1);

            // Compruebo que cantidad este entre los parametros min y max permitidos
            cantidad = getReviewedQuantity(cantidad);

            inputCantidad.value = cantidad;
            carrito.actualizarUnidades(prod, cantidad);
            actualizarTotal(cantidad);
        });

        btnSumar.addEventListener("click", () => {

            cantidad = Math.min(inputCantidad.max, parseInt(inputCantidad.value) + 1);

            // Compruebo que cantidad este entre los parametros min y max permitidos
            cantidad = getReviewedQuantity(cantidad);

            inputCantidad.value = cantidad;
            carrito.actualizarUnidades(prod, cantidad);
            actualizarTotal(cantidad);
        });


        inputCantidad.addEventListener("change", () => {

            cantidad = parseInt(inputCantidad.value);

            // Compruebo que cantidad este entre los parametros min y max permitidos
            cantidad = getReviewedQuantity(cantidad);

            inputCantidad.value = cantidad;
            carrito.actualizarUnidades(prod, cantidad);
            actualizarTotal(cantidad);

        });
        */
        contenedor.appendChild(tr);
    });

    contenedor.addEventListener("click", (event) => {

        if (event.target.matches(".btn-restar, .btn-sumar")) {

            const tr = event.target.closest("tr");
            const input = tr.querySelector(".inputNumber");
            const sku = input.dataset.id;

            cantidad = parseInt(input.value);

            if (event.target.classList.contains("btn-restar")) {
                cantidad = Math.max(minUds, cantidad - 1);
            } else if (event.target.classList.contains("btn-sumar")) {
                cantidad = Math.min(maxUds, cantidad + 1);
            }            

            // Compruebo que cantidad este entre los parametros min y max permitidos
            cantidad = getReviewedQuantity(cantidad);
            input.value = cantidad;

            const prod = lista.find(item => item.SKU === sku);

            carrito.actualizarUnidades(prod, cantidad);

            const precio = parseFloat(tr.querySelector(".product-price").textContent);
            tr.querySelector(".product-total").textContent = `${(precio * cantidad).toFixed(2)} ${moneda}`;
        }
    });

    contenedor.addEventListener("change", (event) => {

        if (event.target.matches(".inputNumber")) {

            const input = event.target;
            const tr = input.closest("tr");
            const sku = input.dataset.id;

            let cantidad = parseInt(input.value);
            const minUds = parseInt(input.min);
            const maxUds = parseInt(input.max);

            cantidad = Math.min(maxUds, Math.max(minUds, cantidad));

            // Compruebo que cantidad este entre los parametros min y max permitidos
            cantidad = getReviewedQuantity(cantidad);
            input.value = cantidad;

            const prod = lista.find(item => item.SKU === sku);
            carrito.actualizarUnidades(prod, cantidad);

            const precio = parseFloat(tr.dataset.precio || prod.price);
            tr.querySelector(".product-total").textContent = `${(precio * cantidad).toFixed(2)} ${moneda}`;
        }
    });

}
