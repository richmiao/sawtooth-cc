const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const cbor = require('cbor');
const {
  InvalidTransaction,
  InternalError,
} = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto')

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const TKV_FAMILY = 'tkv';
const TKV_NAMESPACE = _hash(TKV_FAMILY).substring(0, 6);

const _makeKeyAddress = (key) => 
  TKV_NAMESPACE + 
  crypto.createHash('sha512').update(key).digest('hex').toLowerCase().substring(0, 64);

class TKVHandler extends TransactionHandler {
  constructor () {
    super(TKV_FAMILY, ['1.0'], [TKV_NAMESPACE]);
  }
  
  async apply (transaction, stateStore) {
    try{
      const pair = cbor.decode(transaction.payload);
      console.log('apply:',pair);
      if(typeof pair.key != 'string')throw new Error('missing key');
      if(typeof pair.value != 'string')throw new Error('missing value');
      JSON.parse(pair.value+'');
      var address = _makeKeyAddress(pair.key);
      let entries = {[address]: cbor.encode(pair.value)};
      console.log(stateStore)
      console.log({entries})
      var gameAddresses = await stateStore.setState(entries);
      if (gameAddresses.length < 1) {
        throw new InternalError('State Error!')
      }
      console.log(`Set ${address} to ${pair.value+''}`)
    }catch(err){
      var ne = new InvalidTransaction(err.message||err);
      ne.stack = err.stack;
      throw ne;
    }
  }
};
module.exports.TKVHandler = TKVHandler;