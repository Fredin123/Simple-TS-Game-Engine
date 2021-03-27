const { contextBridge } = require('electron');
const glob = require("glob");
var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os'
const fs = require('fs');
const fsPromise = require('fs').promises;
path = require('path');

contextBridge.exposeInMainWorld('node', {

  clearPreviouslyGeneratedImages: (roomName) => {
    /*fs.writeFile("../../resources/_generated_tiles/tst.txt", "TEST", "utf8", function (err) {
      if (err) return console.log(err);
    });*/
    fsPromise.rmdir("../../resources/_generated_tiles/"+roomName, { recursive: true })
    .then(() => console.log('directory removed!'));
  },

  saveCompiledTiles: (roomName, fileName, arraybuffer) => {
    let nameWithNoEnding = roomName.split(".")[0];
    if(fs.existsSync("../../resources/_generated_tiles/"+nameWithNoEnding) == false){
      fs.mkdirSync("../../resources/_generated_tiles/"+nameWithNoEnding);
    }
    let buffer = arrayBufferToBufferCycle(arraybuffer);
    fs.createWriteStream("../../resources/_generated_tiles/"+nameWithNoEnding+"/"+fileName).write(buffer);
  },

  saveJsonData: (dataName, jsonString) => {
    let targetDir = path.resolve(dataName+".json");
    fs.writeFile(targetDir, jsonString, "utf8", function (err) {
      if (err) return console.log(err);
    });
  },

  getJsonData: (dataName, callback) => {
    let targetDir = path.resolve(dataName+".json");
    fs.readFile(targetDir, {encoding:'utf8', flag:'r'}, 
        function(err, data) { 
          if(err) {
            console.log(err); 
            callback(null);
          }
          else{
            callback(data); 
          }
    });

  },

  getFolderContent: (src, callback) => {
    var returnData = [];
    glob(src + '/**/*', function(err, res){
      let dirs = res;
      dirs.forEach(dir => {
        var dir = path.resolve(dir);
        var stats = fs.statSync(dir);
        var data = "";
        if(stats.isFile()){
          data = fs.readFileSync(dir, "utf8");
          let matchForExistingData = data.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
          if(matchForExistingData != null){
            data = data.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0].replace(/['"]+/g, '');
          }
          
        }

        
        returnData.push([dir, data]);
      });

      callback(returnData);
      
    });
  },


  saveRoom: (roomSrc, roomDataCompressed) => {
    let newFileContent = "export var room1: string = \""+roomDataCompressed+"\";";
    let dirs = roomSrc.split("/");
    dirs
    let currentFolder = "../../scenes";
    let i=0;
    dirs.forEach(item => {
      if(i > 0){
        if(item != ".."){
          if(item.indexOf(".ts") != -1){
            //Save file
            fs.writeFileSync(currentFolder+"/"+item, newFileContent);
          }else{
            //Go through folder
            currentFolder += "/"+item;
            if(fs.existsSync(currentFolder) == false){
              fs.mkdirSync(currentFolder);
            }
          }
        }
      }
      i++;
    });
    
  },

  prompt: (title, question, callback) => {
    vex.dialog.prompt({
      message: question,
      placeholder: '',
      callback: function (value) {
        if(value != false){
          callback(value);
        }else{
          callback(null);
        }
      }
    });
  }


});



function arrayBufferToBufferCycle(ab) {
  var buffer = Buffer.alloc(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
  }
  return buffer;
}