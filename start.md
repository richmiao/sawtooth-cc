# sawtooth examples

first start the sawtooth network:
  docker-compose -f sawtooth-default.yaml up -d


then login to a new docker
  cd nodeApp
  docker run -it -v=$(pwd):/work -w=/work/ --network=sawtoothexamples_default  node bash
  npm install
  
then start the transaction processor
  VALIDATOR=tcp://validator:4004 node tmpScripts/startTKVTransactionProcessor.js

then from an other console, invoke a transaction.
  node tmpScripts/submitTransaction.js
