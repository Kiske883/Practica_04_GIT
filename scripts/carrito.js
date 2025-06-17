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
