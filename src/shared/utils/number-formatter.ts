/**
 * Le da formato a un numero para moneda
 * Ej: $2,000.00
 * @param {number} value 
 * @returns {number}
 */
export const numberMoneyFormat = (value: number)=>{
    const format = new Intl.NumberFormat('es-MX',{
        style: 'currency',
        currency: 'MXN'
    });
    return format.format(value);
}

/**
 * Le da formato a un numero para que aparesca se parado por , y .
 * Ej: 2,000.00
 * @param {number} value 
 * @returns {number}
 */
export const numberBasicFormat = (value: number) => {
    const format = new Intl.NumberFormat();
    return format.format(value);
}