export const cardRegex = {
    visa: /^4/,
    mastercard: /^(5[1-5]|2[2-7])/,
    amex: /^3[47]/,
    diners: /^3(?:0[0-5]|[68])/,
    discover: /^6(?:011|5)/,
    jcb: /^(?:2131|1800|35)/,
    unionpay: /^62/,
    korean: /^9/, // 임의 설정 (국내전용)
};

export const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\D/g, '');
    if (cardRegex.visa.test(number)) return 'visa';
    if (cardRegex.mastercard.test(number)) return 'mastercard';
    if (cardRegex.amex.test(number)) return 'amex';
    if (cardRegex.diners.test(number)) return 'diners';
    if (cardRegex.discover.test(number)) return 'discover';
    if (cardRegex.jcb.test(number)) return 'jcb';
    if (cardRegex.unionpay.test(number)) return 'unionpay';
    return 'unknown';
};

export const formatCardNumber = (cardNumber: string) => {
    const number = cardNumber.replace(/\D/g, '');
    const cardType = getCardType(number);

    // Amex: 4-6-5
    if (cardType === 'amex') {
        return number.replace(/(\d{4})(\d{6})(\d{1,5})/, '$1 $2 $3').trim().substring(0, 17); // 15 digits + 2 spaces
    }

    // Diners: 4-6-4
    if (cardType === 'diners') {
        return number.replace(/(\d{4})(\d{6})(\d{1,4})/, '$1 $2 $3').trim().substring(0, 16); // 14 digits + 2 spaces
    }

    // Default: 4-4-4-4 (Visa, Master, etc.)
    return number.replace(/(\d{4})(?=\d)/g, '$1 ').trim().substring(0, 19); // 16 digits + 3 spaces
};
