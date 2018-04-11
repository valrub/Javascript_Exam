var delayInMilliseconds = Math.random() * 1000; 

var i=0;

console.log('start');

var toOne = setInterval(function() {
  delayInMilliseconds = Math.random() * 1000; 
  console.log('TIMEOUT = ' + delayInMilliseconds);
  if(delayInMilliseconds < 200){
    clearInterval(toOne);
  }
}, 2000);



console.log('stop');