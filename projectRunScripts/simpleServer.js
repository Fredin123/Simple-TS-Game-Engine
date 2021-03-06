const express = require('express');
path = require('path');
const open = require('open');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  //res.send('Hello World!')
  res.sendFile(path.join(__dirname, '../')+'/dist/index.html');
})

app.use(express.static(path.join(__dirname, '../') + '/dist'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  open(`http://localhost:${port}`);
})



/*const express = require('express');
const app = new express();

app.get('/', function(request, response){
    response.sendFile('./dist/index.html');
});*/