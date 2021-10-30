export interface iVector{
    Dx: number;
    Dy: number;

    delta: number;
    magnitude: number;

    increaseMagnitude(addValue: number): void;

    limitHorizontalMagnitude(limit: number): void;

    limitVerticalMagnitude(limit: number): void;

}