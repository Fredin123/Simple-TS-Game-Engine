const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  //res.send('Hello World!')
  console.log(__dirname+'/dist/index.html');
  res.sendFile(__dirname+'/dist/index.html');
})

app.use(express.static(__dirname + '/dist'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



/*const express = require('express');
const app = new express();

app.get('/', function(request, response){
    response.sendFile('./dist/index.html');
});*/