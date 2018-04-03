// -----------------------------------------------------------------------------------------------
// clean string out of not alphanumeric characters 
// E.g. '#MyFavoroite  Tag 1969 - Die Young!' -> '#MyFavoroiteTag1969DieYoung!'

const inp = '#MyFavoroite  Tag 1969 - Die Young!';
var ans = '';

ans = inp.split('').filter(el => /[A-Za-z0-9]/.test(el)).join('');
console.log(ans);

// -----------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------