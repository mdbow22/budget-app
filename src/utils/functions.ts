export const formatCurrency = (rawBal: number) => {
    const formatter = new Intl.NumberFormat('en-us', { style: 'currency', currency: 'USD', currencySign: 'accounting'})

    return formatter.format(rawBal);
};
