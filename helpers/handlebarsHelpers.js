const handlebars = require('handlebars');
const moment = require('moment'); // Para formatação de datas

// Helper para subtrair dois valores
handlebars.registerHelper('subtract', (a, b) => a - b);

// Helper para adicionar dois valores
handlebars.registerHelper('add', (a, b) => a + b);

// Helper para criar uma faixa de números
handlebars.registerHelper('range', (start, end) => {
    const range = [];
    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
});

// Helper para verificar se um valor é maior que outro
handlebars.registerHelper('gt', (a, b) => a > b);

// Helper para verificar se dois valores são iguais
handlebars.registerHelper('eq', (a, b) => a === b);

// Helper para verificar se um valor é menor que outro
handlebars.registerHelper('lt', (a, b) => a < b);

// Helper para truncar uma string
handlebars.registerHelper('truncate', (str, len) => str.substring(0, len) + (str.length > len ? '...' : ''));

// Helper para formatar a data
handlebars.registerHelper('formatDate', function(date) {
    return date ? moment(date).format('DD/MM/YYYY') : 'Data não disponível';
});

// Helper para formatar a data e hora
handlebars.registerHelper('formatDateTime', function(date) {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : 'Data não disponível';
});

module.exports = handlebars;