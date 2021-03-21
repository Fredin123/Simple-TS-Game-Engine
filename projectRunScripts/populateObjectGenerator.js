fs = require('fs');
const path = require('path');
const glob = require("glob");

const stringAnchorStart = "//{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)";
const stringAnchorEnd = "//{NEW OBJECT HERE END} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)";

const startImportAnchor = "//{NEW IMPORTS START HERE}";
const endImportAnchor = "//{NEW IMPORTS END HERE}";




let objectNames = [];
let objectDirsAndName = [];

var getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};
//console.log(path.join(__dirname, '../')+'src/objects');
getDirectories(path.join(__dirname, '../')+'src/objects', function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    res.forEach(dir => {
        objectDirsAndName.push(dir);
        let exploded = dir.split("/");
        if(exploded[exploded.length-1].indexOf(".ts") != -1){
            objectNames.push(exploded[exploded.length-1]);
        }
    });

    //console.log(objectNames);
    insertNewObjects(objectNames);
  }
});


function insertNewObjects(objectNames){
    fs.readFile(path.join(__dirname, '../')+'src/objectGenerator.ts', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        let newFileData = insertObjects(data);
        newFileData = insertImports(newFileData);
        
        fs.writeFileSync(path.join(__dirname, '../')+'src/objectGenerator.ts', newFileData, "utf8", function(err){
          if (err) return console.log(err);
        });
    });

    
}


function insertObjects(data){
  let indexStart = data.indexOf(stringAnchorStart);
  let indexEnd = data.indexOf(stringAnchorEnd);

  let firstStringPart = data.substring(0, indexStart)+stringAnchorStart+"\n";
  let lastStringPart = stringAnchorEnd+data.substring(indexEnd + stringAnchorEnd.length)

  let insertString = "";
  objectNames.forEach(objName => {
    let objNameOnly = objName.split(".")[0];
      insertString += "\t\t(xp: number, yp: number)=>{return new "+objNameOnly+"(xp, yp);},\n";
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
      insertString += "import { "+name+" } from \"."+fixedDir+"\";\n";
    }
    
  });
  return firstStringPart + insertString + lastStringPart;
}

