

export class logger{
    private static initialized: boolean = false;
    static container: HTMLElement = document.createElement("div");
    private static inputWaiter: number = -1;
    private static debugPresses: number = 0;
    private static showDebugger: boolean = false;

    static initialize(){
        if(logger.initialized == false){
            document.body.addEventListener("keyup", logger.listenForStartCommand);
            logger.container.style.position = "absolute";
            logger.container.style.width = "100%";
            logger.container.style.height = "25%";
            logger.container.style.backgroundColor = "rgba(0,0,0,0.6)";
            logger.container.style.color = "white";
            logger.container.style.top = "0px";
            logger.container.style.pointerEvents = "none";
            logger.container.style.display = "none";
            document.body.appendChild(logger.container);
            logger.initialized = true;
        }
    }

    static showMessage(...s: any[]){
        let newLog: string = "";
        s.forEach(text => {
            newLog += text;
        });
        this.container.innerHTML = newLog;
    }


    static listenForStartCommand(e: KeyboardEvent){
        if(e.key == "Escape" && logger.showDebugger){
            logger.showDebugger = false;
            logger.container.style.display = "none";
        }
        
        if(logger.showDebugger == false){
            logger.inputWaiter = setTimeout(()=>{
                this.debugPresses = 0;
            }, 1000);
            if(e.key == "%"){
                clearTimeout(logger.inputWaiter);
                logger.debugPresses += 1;
                if(logger.debugPresses >= 7){
                    logger.debugPresses = 0;
                    logger.showDebugger = true;
                    logger.container.style.display = "inline";

                }
            }
        }
        
    }

}