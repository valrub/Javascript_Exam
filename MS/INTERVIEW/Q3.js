// Input: any string including names of numbers like One, three, Seven, two etc.
// Task: Write function which will replace them to digits (1,2,3 .. )
// E.g. String "There are two good apples out of Seven found in three boxes"
// will be translated to "There are 2 good apples out of 7 found in 3 boxes"

//Note: DO NOT USE FOR LOOP.

//---------------------------
// ------ ANSWER ------------
// See code below:
//-------------------------------------------------------------------------------

const dNumbers = [
    {w : 'One', d : 1},
    {w : 'one', d : 1},
    {w : 'Two', d : 2},
    {w : 'two', d : 2},
    {w : 'Three', d : 3},
    {w : 'three', d : 3},
    {w : 'Seven', d : 7}
]

const dPairs = [
    {w : 'oo', d : 666},
    {w : 'pp', d : 777}
]

var inp = "There are two good apples out of Seven found in three boxes";

// -----------------------------------------------------------------------------
var Translate = function(inDict) {
    var translate = function(inStr){
        var outStr = inDict.reduce((currStr, el) => {
            currStr = currStr.replace(el.w, el.d);
            return currStr;
            }, inStr); 
        return outStr;
    }
    return translate;
};

var translateNumbers = new Translate(dNumbers);
console.log(translateNumbers(inp));

var translateOO = new Translate(dPairs);
console.log(translateOO(inp));
// -----------------------------------------------------------------------------