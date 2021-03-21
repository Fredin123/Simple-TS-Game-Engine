fs = require('fs');
const path = require('path');
const glob = require("glob");




var getDirectories = function (src, callback) {
    glob(src + '/**/*', callback);
};



getDirectories(path.join(__dirname, '../')+'src/resources', function (err, res) {
    let textFile = "";
    if (err) {
        console.log('Error', err);
    } else {
        res.forEach(dir => {
            let pos = dir.indexOf("/resources");
            let parts = dir.split("/");
            if(parts[parts.length-1].indexOf(".") != -1){
                textFile += dir.substring(pos+11)+"\n";
            }
        });
    
        textFile = textFile.substring(0, textFile.length-1);
        fs.writeFileSync(path.join(__dirname, '../')+'dist/resources.txt', textFile, "utf8", function(err){
            if (err) return console.log(err);
        });
    }
});