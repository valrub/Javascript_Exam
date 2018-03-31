// WHAT WILL BE PRINTED AT LINE (*)
var a = 10;

(function(){
    console.log(a); // (*)
    var a = 11;

})();

//---------------------------
// ------ ANSWER ------------
// A is Not defined (hoisting)
//-------------------------------------------------------------------------------

// WHAT WILL BE PRINTED AT LINE (**)
var a = 10;

(function(){
    console.log(a); // (**)
    let a = 11;

})();
//---------------------------
// ------ ANSWER ------------
// A is Not defined and code fails (also not exists)
//-------------------------------------------------------------------------------
