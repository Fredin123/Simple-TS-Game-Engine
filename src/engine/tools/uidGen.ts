

export class uidGen{
    private static generatedIds: string[] = [];
    
    static new(){
        let tempId: string = "";
        while(true){
            tempId = uidGen.uuidv4();
            if(uidGen.generatedIds.indexOf(tempId) == -1){
                uidGen.generatedIds.push(tempId);
                return tempId;
            }
        }
    }

    private static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
}