const duration = parseInt(process.argv[process.argv.length-1]) || 0;
const startTime = Date.now();
console.log('sleep', 0, '/', duration);
setInterval(function(){
  var time = parseInt((Date.now() - startTime)/1000);
  console.log('sleep', time, '/', duration);
},5000);

setTimeout(function(){
  console.log('sleep', duration, '/', duration);
  process.exit(0);
},duration*1000 || 0);

