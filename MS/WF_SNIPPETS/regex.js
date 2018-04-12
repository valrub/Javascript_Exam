var inp = 'https://webalert.verint.com/#/query-data/17753'


queryID = inp.match(/(https:\/\/webalert.verint.com\/#\/query-data\/)(.+)/)[2];

console.log(queryID);