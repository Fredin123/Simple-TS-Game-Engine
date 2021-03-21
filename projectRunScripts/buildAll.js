const { exec } = require("child_process");








//populate generator
exec("node populateObjectGenerator.js", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log("populateObjectGenerator done\n");
    buildDevTools();
});





function buildDevTools(){
    exec("cd .. && npm run build-tools", (error, stdout, stderr) => {
        console.log("Building tools:");
        console.log(stdout);
        console.log(stderr);
        
        console.log("build-tools done\n");
        buildGameEngine();
    });
}



function buildGameEngine(){
    exec("cd .. && npm run build", (error, stdout, stderr) => {
        console.log("Building engine\n");
        console.log(stdout);
        console.log(stderr);
        
        console.log("build done");
        startServer();
    });
}


function startServer(){
    console.log("Starting server. Listening to ttp://localhost:3000");
    exec("node simpleServer.js", (error, stdout, stderr) => {
        console.log("Building engine\n");
        console.log(stdout);
        console.log(stderr);
        
        console.log("build done");
    });
}