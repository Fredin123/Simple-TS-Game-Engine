declare var window: any;

export class roomHandler{
  private roomData: Array<Array<string>> = [];
  private roomsLoadedCallbackExternal: ()=>void;

  constructor(roomsLoadedCallbackExternal: ()=>void){
    this.roomsLoadedCallbackExternal = roomsLoadedCallbackExternal;
    window.node.getFolderContent("../../scenes", this.roomsLoadedCallback.bind(this));
  }

  getRoomData(){
    return this.roomData;
  }

  roomsLoadedCallback(returnData: Array<Array<string>>){
    returnData.forEach(room => {
      room[0] = room[0].substr(room[0].indexOf("scenes"));
    });
    this.roomData = returnData;
    
    this.roomsLoadedCallbackExternal();
    //console.log(this.roomSelector);
  }


      
}