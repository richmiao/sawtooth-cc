# start the docker 
docker-compose -f sawtooth-default.yaml up -d

node ./utils/sleep.js 20

cd nodeApp
docker run -it -v=$(pwd):/work -w=/work/ --network=sawtoothexamples_default  node bash
npm install

VALIDATOR=tcp://validator:4004 node tmpScripts/startTKVTransactionProcessor.js

node tmpScripts/submitTransaction.js