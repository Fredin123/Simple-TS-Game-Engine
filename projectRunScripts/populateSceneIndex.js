fs = require('fs');
const path = require('path');
const glob = require("glob");




let sceneNames = [];
let objectDirsAndName = [];

var getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};

getDirectories(path.join(__dirname, '../')+'src/scenes', function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    res.forEach(dir => {
        objectDirsAndName.push(dir);
        let exploded = dir.split("/");
        if(exploded[exploded.length-1].indexOf(".ts") != -1){
            sceneNames.push(exploded[exploded.length-1]);
        }
    });

    insertScenes(sceneNames);
  }
});


function insertScenes(sceneNames){
    console.log(sceneNames);
    var imports = "";
    var scriptBody = "";
    sceneNames.forEach(scene => {
        let sceneNoFileType = scene.substring(0, scene.indexOf(".ts"));
        if(sceneNoFileType != "scene_index"){
            imports += 'import { '+sceneNoFileType+' } from "./'+sceneNoFileType+'";\n';
            scriptBody += '"'+sceneNoFileType+'": '+sceneNoFileType+',';
        }
        
    });
    fs.writeFileSync(path.join(__dirname, '../')+'src/scenes/scene_index.ts',imports+`
    export var roomIndex: { [key: string]: string; } = {
        `+scriptBody+`
    };
    `, "utf8", function(err){
        if (err) return console.log(err);
    });
}


function insertObjects(data){
  let indexStart = data.indexOf(stringAnchorStart);
  let indexEnd = data.indexOf(stringAnchorEnd);

  let firstStringPart = data.substring(0, indexStart)+stringAnchorStart+"\n";
  let lastStringPart = stringAnchorEnd+data.substring(indexEnd + stringAnchorEnd.length)

  let insertString = "";
  sceneNames.forEach(objName => {
    let objNameOnly = objName.split(".")[0];
      insertString += "\t\t(xp: number, yp: number, input: string)=>{return new "+objNameOnly+"(xp, yp, input);},\n";
  });
  return firstStringPart + insertString + lastStringPart;
}


function insertImports(data){
  let indexStart = data.indexOf(startImportAnchor);
  let indexEnd = data.indexOf(endImportAnchor);

  let firstStringPart = data.substring(0, indexStart)+startImportAnchor+"\n";
  let lastStringPart = endImportAnchor+data.substring(indexEnd + endImportAnchor.length)

  let insertString = "";
  objectDirsAndName.forEach(objectDirs => {
    let exploded = objectDirs.split("/");
    let name = exploded[exploded.length-1].split(".")[0];
    if(objectDirs.substring(objectDirs.indexOf("/objects")).indexOf(".ts") != -1){
      let fixedDir = objectDirs.substring(objectDirs.indexOf("/objects")).replace(".ts", "");
      insertString += "import { "+name+" } from \".."+fixedDir+"\";\n";
    }
    
  });
  return firstStringPart + insertString + lastStringPart;
}

