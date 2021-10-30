import { layerContainer } from "../developerTools/src/canvasHandler/layer/layerContainer";
import { objectTypes } from "./objectTypes";
import { tileAnimation } from "./tile/tileAnimation";

export interface IObjectMeta{
    x: number;
    y: number;
    name: string;
    type: objectTypes;
    inputString: string;
    
    geomPoints: number[];

    tile: tileAnimation | null;
    isCombinationOfTiles: boolean;
    idOfStaticTileCombination: string;
    isPartOfCombination: boolean;

    isMouseInside(mouseX: number, mouseY: number, layerHandler: layerContainer): boolean;

    drawMouseOverSelection(mouseX: number, mouseY: number, layerHandler: layerContainer, context: CanvasRenderingContext2D): boolean;

    render(xOffset: number, yOffset: number, tileCounter:number, context: CanvasRenderingContext2D): void;

    interact(mouseX: number, mouseY: number, inputArray: any[]): void;

    interactClick(mouseX: number, mouseY: number): void;
}