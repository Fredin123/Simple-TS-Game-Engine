export class fileSystemEntry{
    type: string;
    name: string;
    contains: fileSystemEntry[];
    id: number;
    customData: any;
    image: any;

    constructor(type: string,
        name: string,
        contains: fileSystemEntry[],
        id: number,
        customData: any){
            this.type = type;
            this.name = name;
            this.contains = contains;
            this.id = id;
            this.customData = customData;
    }


}