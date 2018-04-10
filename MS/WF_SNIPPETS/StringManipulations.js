// -----------------------------------------------------------------------------------------------
// clean string out of not alphanumeric characters 
// E.g. '#MyFavoroite  Tag 1969 - Die Young!' -> '#MyFavoroiteTag1969DieYoung!'

const inp = '#MyFavoroite  Tag 1969 - Die Young!';
var ans = '';

ans = inp.split('').filter(el => /[A-Za-z0-9]/.test(el)).join('');
console.log(ans);

// -----------------------------------------------------------------------------------------------
var sourceString = "#ГРЕ ФФ";
// Example with \w
var rs = sourceString.replace(/[^\w\s]/gi, '');
console.log(rs + ' 1');
// Example listing the specific chars we want to delete
var r = sourceString.replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, '');
console.log(r + ' 2');
// -----------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------