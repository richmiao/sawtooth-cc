const signing = require('sawtooth-sdk/signing');
const {createHash} = require('crypto');
const protobuf = require('sawtooth-sdk/protobuf');
const fetch = require('node-fetch');
const cbor = require('cbor');
const crypto = require('crypto')

const sleep = ms => new Promise(resolve => setTimeout(resolve, parseInt(ms)||0));

var context = signing.createContext('secp256k1');

var privateKey = context.newRandomPrivateKey()
var signer = new signing.CryptoFactory(context).newSigner(privateKey)
var publicKey = signer.getPublicKey();

var family = 'tkv';

var sha512 = (payloadBytes) => createHash('sha512').update(payloadBytes).digest('hex')

var payload = {
    key: 'extra',
    value: JSON.stringify({some:"new Data 2"}),
}

var payloadBytes = cbor.encode(payload)
var address =  sha512(family).substr(0,6) + '' + sha512(payload.key).substr(0,64);

var transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: family,
    familyVersion: '1.0',
    inputs: [address],
    outputs: [address],
    signerPublicKey: signer.getPublicKey().asHex(),
    // In this example, we're signing the batch with the same private key,
    // but the batch can be signed by another party, in which case, the
    // public key will need to be associated with that key.
    batcherPublicKey: signer.getPublicKey().asHex(),
    // In this example, there are no dependencies.  This list should include
    // an previous transaction header signatures that must be applied for
    // this transaction to successfully commit.
    // For example,
    // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
}).finish()

var signature = signer.sign(transactionHeaderBytes)

var transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signature,
    payload: payloadBytes
})

var transactions = [transaction];

var batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
}).finish()

var signature = signer.sign(batchHeaderBytes)

var batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactions
});

var batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
}).finish();

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const TKV_FAMILY = 'tkv';
const TKV_NAMESPACE = _hash(TKV_FAMILY).substring(0, 6);

const _makeKeyAddress = (key) => 
  TKV_NAMESPACE + 
  crypto.createHash('sha512').update(key).digest('hex').toLowerCase().substring(0, 64);

function getKey(key){
  console.log(key)
  var address = _makeKeyAddress(key)
  console.log({address})
  return fetch('http://rest-api:8008/state/'+address,{
    method:'GET',
    //headers: {'Content-Type': 'application/octet-stream'},
  }).then((r)=>r.json()).then(data=>{
    console.log(data)
    if(data.data){

      //console.log('getKey ',key,'=',JSON.parse(cbor.decode(Buffer.from(data.data,'base64'))))
      return JSON.parse(cbor.decode(Buffer.from(data.data,'base64')));
    }
  });
}
(async ()=>{
  var text = await fetch('http://rest-api:8008/batches',{
    method:'POST',
    headers: {'Content-Type': 'application/octet-stream'},
    body:batchListBytes,
  }).then((r)=>r.text());
  console.log('batchUpdate result',text);
  await sleep(2000);


  var data = await getKey(payload.key);
  console.log('data',data);
})().catch(err=>console.log(err));