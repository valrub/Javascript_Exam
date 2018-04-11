var delayInMilliseconds = Math.random() * 1000; 

var i=0;

console.log('start');

var toOne = setInterval(function() {
  delayInMilliseconds = Math.random() * 10000; 
  console.log('TIMEOUT = ' + delayInMilliseconds);
  if(delayInMilliseconds < 100){
    clearInterval(toOne);
  }
}, delayInMilliseconds);



console.log('stop');