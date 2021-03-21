const { contextBridge } = require('electron');
const glob = require("glob");
var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os'
fs = require('fs');
path = require('path');

contextBridge.exposeInMainWorld('node', {

  saveJsonData: (dataName, jsonString) => {
    let targetDir = path.resolve(dataName+".json");
    console.log(targetDir);
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


})