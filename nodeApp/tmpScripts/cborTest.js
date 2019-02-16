var cbor = require('cbor');

var transaction = {
    'Verb': 'verb',
    'Name': 'name',
    'Value': 1234,
};

console.log(cbor.encode(transaction).length,JSON.stringify(transaction).length)
