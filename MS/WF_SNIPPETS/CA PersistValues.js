// function main(re, ie, oe, executor) {
//     try {
//       setGlobalLogger(re, ie, oe, executor);
  
//       Logger.production('CA started');

//      setPersistedKey('P_ONE', 'v_ONE');
//      var ans =  getPersistedKey('P_ONE');
     
//      executor.ready();

      
//-----------------------------------------------------------------------------------------------------------

var loggfetcher = require('fetch');



function newPost(post) {
    const options = {
        method : 'POST',
        body : JSON.stringify(post),
        header : new Headers({
            'Content-Type' : 'application/json'
        })
    }


return fetch('http://jsonplaceholder.typicode.com/posts', options)
   .then(res => res.json())
   .then(res => console.log(res))
   .then(error => console.log(`Error: ${error}`))
}

var post = {
title : "THE BEST EVER TITLE",
body : "BY BEST BODY",
ID : 13
}


x = newPost(post);



      //--------------------------------------------------------------------------------------------------------------------
//       Logger.production('CA ended');
//     } catch (e) {
//       Logger.failure(e);
//     }
//   }
  