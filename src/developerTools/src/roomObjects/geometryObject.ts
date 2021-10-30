import { layerContainer } from "../canvasHandler/layer/layerContainer";
import { geomObjData } from "./geomObjData";
import { objectTypes } from "../../../shared/objectTypes";
import { IObjectMeta } from "../../../shared/IObjectMeta";
import { tileAnimation } from "../../../shared/tile/tileAnimation";

export class geometryObject implements IObjectMeta{
    x: number;
    y: number;
    name: string = "Geometry";
    inputString: string = "";
    geomWidth: number = 128;
    //geomHeight: number = 128;
    geomPoints: number[] = [32, 32, 32];
    type: objectTypes = objectTypes.geometry;
    
    tile: tileAnimation | null = null;
    isCombinationOfTiles: boolean = false;
    idOfStaticTileCombination: string = "";
    isPartOfCombination: boolean = false;

    private mouseInteractX = -100000;
    private mouseInteractY = -100000;

    private selectedEdgeIndex = -1;
    private mouseHoverOver = false;
    private _lineWidth = 1;
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    public getDataObject(){
        let dataObj = new geomObjData();
        dataObj.x = this.x;
        dataObj.y = this.y;
        dataObj.geomWidth = this.geomWidth;
        dataObj.geomPoints = this.geomPoints;

        return dataObj;
    }

    isMouseInside(mouseX: number, mouseY: number, layerHandler: layerContainer): boolean {
        var highestPoint = Math.max(...this.geomPoints);
        var lowestPoint = Math.min(...this.geomPoints);
        if(mouseX - layerHandler.gridXOffset >= this.x-10 && 
            mouseX - layerHandler.gridXOffset < this.x+this.geomWidth+10 &&
            mouseY - layerHandler.gridYOffset <= this.y+10+Math.abs(lowestPoint) && 
            mouseY - layerHandler.gridYOffset > this.y-highestPoint-10){
                return true;
        }
        return false;
    }
    drawMouseOverSelection(mouseX: number, mouseY: number, layerHandler: layerContainer, context: CanvasRenderingContext2D): boolean {
        if(this.isMouseInside(mouseX, mouseY, layerHandler)){
            this.mouseHoverOver = true;
            this._lineWidth = 5;
            this.render(layerHandler.gridXOffset, layerHandler.gridYOffset, 0, context);
            this._lineWidth = 1;
        }
        this.mouseHoverOver = false;
        return false;
    }

    interact(mouseX: number, mouseY: number, allGeometries: any[]){
        this.mouseInteractX = mouseX;
        this.mouseInteractY = mouseY;
        let pointSpacing = this.geomWidth / (this.geomPoints.length-1);

        if(this.selectedEdgeIndex >= 0){
            this.geomPoints[this.selectedEdgeIndex] = Math.round(this.y - this.mouseInteractY);
            for(var geom of allGeometries){
                let geomCast = geom as geometryObject;
                let index = 0;
                geomCast.geomPoints.forEach(point => {
                    let thisGeomSpacing = geom.geomWidth/(geom.geomPoints.length-1);
                    if(geom.x + (thisGeomSpacing * index) == this.x + (pointSpacing*this.selectedEdgeIndex)){
                        geom.geomPoints[index] = this.geomPoints[this.selectedEdgeIndex];
                    }
                    index++;
                });
            }
        }else if(this.selectedEdgeIndex == -2){
            this.geomWidth = Math.abs(this.x - mouseX);
        } 
    }

    private closestPowerOf2(numToRound: number): number{
        let testNumber = 0;
        while(Math.pow(2, testNumber) < numToRound){
            testNumber++;
        }
        return Math.pow(2, testNumber);
    }

    interactClick(mouseX: number, mouseY: number){
        this.geomWidth = this.closestPowerOf2(this.geomWidth);
        if(this.selectedEdgeIndex == -1){
            let pointSpacing = this.geomWidth / (this.geomPoints.length-1);
            let edgesPoints: (number[])[] = [];
            for(let i=0; i<this.geomPoints.length; i++){
                let pointY = this.geomPoints[i];
    
                edgesPoints.push([this.x +  (i*pointSpacing), this.y - pointY]);
            }

            let circlePoints = this.getPointsAndMouseStatus(edgesPoints, mouseX, mouseY);
            let selectedPoints = circlePoints.filter(x => x[1][0]);
            
            selectedPoints.forEach(sPoint => {
                this.selectedEdgeIndex = sPoint[1][1];
            });

            
            if(this.selectedEdgeIndex == -1){
                let lineMiddlePoints: (number[])[] = [];
                for(let i=0; i<edgesPoints.length; i++){
                    if(i + 1 < edgesPoints.length-1){
                        let point1 = edgesPoints[i];
                        let point2 = edgesPoints[i+1];
                        let yDiff = point2[1] - point1[1];
                        let boxX = point1[0] + (pointSpacing/2);
                        let boxY = point1[1] + (yDiff/2);
                        lineMiddlePoints.push([boxX, boxY]);
                    }
                }
                let rectPoint = this.getPointsAndMouseStatus(lineMiddlePoints, mouseX, mouseY);
                rectPoint.forEach(rect => {
                    if(rect[1][0]){
                        let highestPoint = Math.max(...this.geomPoints);
                        this.geomPoints.splice(rect[1][1]+1, 0, highestPoint);
                    }
                });

                //Check drag width point
                let widthDragPoint: (number[])[] = [];
                widthDragPoint.push([this.x +  ((this.geomPoints.length-1)*pointSpacing), this.y]);
                let widthDragPointStatus = this.getPointsAndMouseStatus(widthDragPoint, this.mouseInteractX, this.mouseInteractY);
                widthDragPointStatus.forEach(point => {
                    if(point[1][0] == true){
                        this.selectedEdgeIndex = -2;
                    }
                });
            }
        }else{
            this.selectedEdgeIndex = -1;
        }
        
    }

    render(xOffset: number, yOffset: number, tileCounter: number, ctx: CanvasRenderingContext2D): void {
        var pointSpacing = this.geomWidth / (this.geomPoints.length-1);
        
        let edgesPoints: (number[])[] = [];
        //Draw lines
        ctx.beginPath();
        ctx.lineWidth = this._lineWidth;
        ctx.moveTo(this.x + xOffset, this.y + yOffset);
        //ctx.lineTo(this.x + xOffset, this.y + yOffset + this.geomHeight);
        for(let i=0; i<this.geomPoints.length; i++){
            let pointY = this.geomPoints[i];

            edgesPoints.push([this.x + xOffset +  (i*pointSpacing), this.y + yOffset - pointY]);
            ctx.lineTo(this.x + xOffset +  (i*pointSpacing), this.y + yOffset - pointY);
        }
        ctx.lineTo(this.x + xOffset +  ((this.geomPoints.length-1)*pointSpacing), this.y + yOffset);
        ctx.closePath();
        ctx.lineWidth = this._lineWidth;
        ctx.strokeStyle = '#f00';
        ctx.fillStyle = 'rgba(0, 0, 200, 0.1)';
        ctx.fill();
        ctx.stroke();

        //calculate rects between points coords
        let lineMiddlePoints: (number[])[] = [];
        for(let i=0; i<edgesPoints.length; i++){
            if(i + 1 < edgesPoints.length-1){
                let point1 = edgesPoints[i];
                let point2 = edgesPoints[i+1];
                let yDiff = point2[1] - point1[1];
                let boxX = point1[0] + (pointSpacing/2);
                let boxY = point1[1] + (yDiff/2);
                lineMiddlePoints.push([boxX, boxY]);
            }
        }

        //draw rects
        let lineMiddlePointsStatus = this.getPointsAndMouseStatus(lineMiddlePoints, this.mouseInteractX + xOffset, this.mouseInteractY + yOffset);
        lineMiddlePointsStatus.forEach(lineMiddle => {
            if(lineMiddle[1][0]){
                    ctx.fillStyle = 'rgba(0, 90, 200, 1)';
            }else{
                ctx.fillStyle = 'rgba(0, 200, 0, 0.8)';
            }
            ctx.fillRect(lineMiddle[0][0]-3, lineMiddle[0][1]-3, 6, 6);
        });

        //draw circles
        edgesPoints.push([this.x + xOffset +  ((this.geomPoints.length-1)*pointSpacing), this.y + yOffset]);
        let edgePointsStatus = this.getPointsAndMouseStatus(edgesPoints, this.mouseInteractX + xOffset, this.mouseInteractY + yOffset);
        edgePointsStatus.forEach(point => {
            ctx.beginPath();
            if(point[1][0] == true){
                ctx.strokeStyle = '#f0f';
            }else{
                ctx.strokeStyle = '#00f';
            }
            ctx.arc(point[0][0], point[0][1], 3, 0, 2 * Math.PI);
            ctx.stroke();
        });

        
        
    }


    private getPointsAndMouseStatus(points: (number[])[], mouseX: number, mouseY: number){
        let pointsAndStatus: [number[], [boolean, number]][] = [];
        let index = 0;
        points.forEach(point => {
            if(mouseX > point[0]-8 && mouseX < point[0]+8
                && mouseY > point[1]-16 && mouseY < point[1]+16){
                    pointsAndStatus.push([point, [true, index]]);
            }else{
                pointsAndStatus.push([point, [false, index]]);
            }
            index++;
        });
        return pointsAndStatus;
    }
    
}