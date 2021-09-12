import { hitbox } from "../hitboxes/hitbox";
import { iVector } from "../dataObjects/vector/iVector";
import { iObject } from "../objectHandlers/iObject";
import { roomEvent } from "../roomEvent";

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}
type uploadCallback = (text:string) => any;
declare var LZString: any;


export class tools{


    /*download(filename: string, text:string) {
        var element = document.createElement('a');
        console.log(text)
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }*/

    static download(filename: string, text: string, type="text/plain") {
        // Create an invisible A element
        const a = document.createElement("a");
        a.style.display = "none";
        document.body.appendChild(a);
      
        // Set the HREF to a Blob representation of the data to be downloaded
        a.href = window.URL.createObjectURL(
          new Blob([text], { type })
        );
      
        // Use download attribute to set set desired file name
        a.setAttribute("download", filename);
      
        // Trigger the download by simulating click
        a.click();
      
        // Cleanup
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
      }


      static upload(callback: uploadCallback){
        var element = document.createElement("input");
        element.type = "file";
        element.style.display = "none";

        document.body.appendChild(element);

        element.onchange = (e: Event)=> {
            this.uploadOnChange(e, callback);
        }

        element.click();
    }

    static getClassNameFromConstructorName(constructorName: string){
        var funcNameOnly = constructorName.replace("function ", "");
        var paramsStartIndex = funcNameOnly.indexOf("(");
        funcNameOnly = funcNameOnly.substring(0, paramsStartIndex);
        return funcNameOnly;
    }


    static functionName( func: ()=>any )
    {
        console.log(func.toString());
        var result = /^function\s+([\w\$]+)\s*\(/.exec( func.toString() )

        return  result  ?  result[ 1 ]  :  '' // for an anonymous function there won't be a match
    }

    private static uploadOnChange(e: any, callback: uploadCallback){
        var ev:HTMLInputEvent = e as HTMLInputEvent;
        console.log(ev.target.files);

        var reader = new FileReader();
        reader.readAsText(ev.target.files![0], "UTF-8");
        reader.onload = function (evt) {
            var t:string|undefined = evt.target?.result?.toString();
            callback(LZString.decompressFromEncodedURIComponent(t!));
        }
        reader.onerror = function (evt) {
            alert("Could not read file");
        }
    }


    

}