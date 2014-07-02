module Laan.Generators {

    interface Color {

        r: number;
        g: number;
        b: number;
    }

    class Point {

        constructor(x: number, y: number) {

            this.X = x;
            this.Y = y;
        }

        X: number;
        Y: number;

        public toString(): string {

            return [this.X, this.Y].join(":");
        }
    }

    class Rect {

        constructor(bottomRight: Point, size: number) {

            var leftX = bottomRight.X - size;
            var topY = bottomRight.Y - size;

            this.topLeft = new Point(leftX, topY);
            this.topRight = new Point(bottomRight.X, topY);
            this.bottomLeft = new Point(leftX, bottomRight.Y);
            this.bottomRight = new Point(bottomRight.X, bottomRight.Y);
            this.center = new Point(bottomRight.X - (size / 2), bottomRight.Y - (size / 2));
        }

        topLeft: Point;
        topRight: Point;
        bottomLeft: Point;
        bottomRight: Point;
        center: Point;

        get topCentre(): Point {

            return new Point((this.topRight.X + this.topLeft.X) / 2, this.topLeft.Y);
        }

        get rightCentre(): Point {

            return new Point(this.topRight.X, (this.bottomRight.Y + this.topRight.Y) / 2);
        }

        get bottomCentre(): Point {

            return new Point((this.topRight.X + this.topLeft.X) / 2, this.bottomLeft.Y);
        }

        get leftCentre(): Point {

            return new Point(this.topLeft.X, (this.bottomLeft.Y + this.topLeft.Y) / 2);
        }
    }

    export class MidpointDisplacement {

        private _unitSize: number;
        private _roughness: number;
        private _water: number;

        private _mapSize: number;
        private _data: Float64Array;
        private _element: HTMLCanvasElement;

        private _wrap : boolean;
        private _colorMap;

        constructor(element: string, size: number, unitSize: number, roughness: number, smoothing: boolean, wrap: boolean, water: number) {

            this._colorMap = {

                waterStart: { r:  39, g:  50, b:  63 },
                waterEnd:   { r:  10, g:  20, b:  40 },
                sandStart:  { r:  98, g: 105, b:  83 },
                sandEnd:    { r: 189, g: 189, b: 144 },
                grassStart: { r:  67, g: 140, b:  18 },
                grassEnd:   { r:  22, g:  68, b:   3 },
                mtnEnd:     { r:  67, g:  80, b:  18 },
                mtnStart:   { r:  60, g:  56, b:  31 },
                rockStart:  { r: 130, g: 130, b: 130 },
                rockEnd:    { r:  90, g:  90, b:  90 },
                snowStart:  { r: 200, g: 200, b: 200 },
                snowEnd:    { r: 255, g: 255, b: 255 }
            }
            
            this._element = <HTMLCanvasElement>document.getElementById('content');

            this._unitSize = unitSize;
            this._roughness = roughness;
            this._water = water;

            this._data = new Float64Array(size * size);

            this._wrap = wrap;
            this._mapSize = size;

            this.initialiseCorners();
            this.midpointDisplacment(size);

            if(smoothing)
                this.smooth();

            this.draw();
        }

        private getIndex(point: Point): number {

            return point.X * this._mapSize + point.Y;
        }

        private getValue(point: Point): number {

            var x = this._wrap && point.X == this._mapSize ? 0 : point.X;
            var y = this._wrap && point.Y == this._mapSize ? 0 : point.Y;

            return this._data[this.getIndex(new Point(x, y))];
        }

        private clamp(value: number): number {

            if (value > 1)
                return 1;

            if (value < 0)
                return 0;

            return value;
        }

        private setValue(point: Point, value: number): void {

            var index = this.getIndex(point);
            this._data[index] = this.clamp(value);
        }

        private displace(value: number): number {

            var max = value / (this._mapSize + this._mapSize) * this._roughness;
            return (Math.random() - 0.5) * max;
        }

        private setDisplacementValue(point: Point, value: number, size: number): void {

            var displacement = this.displace(size);
            this.setValue(point, value + displacement);
        }

        private fade(colorStart: Color, colorEnd: Color, totalSteps: number, step: number) : Color {

            var r = Math.floor(colorEnd.r + (~~ ((colorStart.r - colorEnd.r) / totalSteps) * step));
            var g = Math.floor(colorEnd.g + (~~ ((colorStart.g - colorEnd.g) / totalSteps) * step));
            var b = Math.floor(colorEnd.b + (~~ ((colorStart.b - colorEnd.b) / totalSteps) * step));

            return { r: r, g: g, b: b };
        }

        private getTerrainStyle(altitude: number): string {

            var water = 0.32 + (this._water / 100);
            var sand  = water + 0.02;
            var grass = 0.89;
            var mtn   = 0.97;

            var colorFill: Color;
            
            if (altitude >= 0 && altitude <= water) {

                colorFill = this.fade(this._colorMap.waterStart, this._colorMap.waterEnd, water, altitude);
            } 
            else if (altitude > water && altitude <= sand) {

                colorFill = this.fade(this._colorMap.sandStart, this._colorMap.sandEnd, sand - water, altitude - water);
            } 
            else if (altitude > sand && altitude <= grass) {
            
                colorFill = this.fade(this._colorMap.grassStart, this._colorMap.grassEnd, grass - sand, altitude - sand);
            }
            else if (altitude > grass && altitude <= mtn) {
            
                colorFill = this.fade(this._colorMap.mtnStart, this._colorMap.mtnEnd, mtn - grass, altitude - grass);
            }
            else if (altitude > mtn && altitude <= 1) {
            
                colorFill = this.fade(this._colorMap.rockStart, this._colorMap.rockEnd, 1 - mtn, altitude - mtn);
            }

            return "rgb(" + colorFill.r + ", " + colorFill.g + ", " + colorFill.b + ")"
        }

        private getAverage(points: Point[]): number {

            if (points.length == 0)
                return 0;

            var total = points
                .map(p => this.getValue(p))
                .filter(p => p !== undefined)
                .reduce((pv, pc) => pv + pc, 0)

            return total / points.length;
        }

        private initialiseCorners() {

            var grid = new Rect(new Point(this._mapSize, this._mapSize), this._mapSize);

            var tl = Math.random();
            var tr = Math.random();
 
            this.setValue(grid.topLeft, tl);
            this.setValue(grid.bottomLeft, tr);
            this.setValue(grid.topRight, this._wrap ? tl : Math.random());
            this.setValue(grid.bottomRight, this._wrap ? tl : Math.random());

            this.applySquare(grid, this._mapSize);
            this.applyDiamond(grid, this._mapSize);
        }

        private applySquare(cell: Rect, size: number): void {

            this.setDisplacementValue(
                cell.center,
                this.getAverage([cell.topLeft, cell.topRight, cell.bottomLeft, cell.bottomRight]),
                size
            );
        }

        private applyDiamond(cell: Rect, size: number): void {

            var points = [

                { target: cell.topCentre,    sources: [cell.topLeft,    cell.topRight,    cell.center] },
                { target: cell.bottomCentre, sources: [cell.bottomLeft, cell.bottomRight, cell.center] },
                { target: cell.rightCentre,  sources: [cell.topRight,   cell.bottomRight, cell.center] },
                { target: cell.leftCentre,   sources: [cell.topLeft,    cell.bottomLeft,  cell.center] }
            ];

            points.forEach(p => this.setDisplacementValue(p.target, this.getAverage(p.sources), size));
        }

        private midpointDisplacment(dimension: number) {

            var cellSize = dimension / 2;

            if (cellSize <= this._unitSize)
                return;

            for (var x = cellSize; x <= this._mapSize; x += cellSize)
                for (var y = cellSize; y <= this._mapSize; y += cellSize) {

                    var rect = new Rect(new Point(x, y), cellSize);

                    this.applySquare(rect, dimension);
                    this.applyDiamond(rect, dimension);
                }

            this.midpointDisplacment(cellSize);
        }

        private smooth() {

            for (var y = 0; y < this._mapSize; y++)
                for (var x = 0; x < this._mapSize; x++)
                    this.smoothCell(x, y);
        }

        private smoothCell(px: number, py: number): void {

            var range = 1;
            var total = 0;
            var count = 0;

            for (var y = -range; y <= range; y++) {

                for (var x = -range; x <= range; x++) {

                    var cell = this.getValue(new Point(px + x, py + y));
                    if (cell) {

                        total += cell;
                        count++;
                    }
                }
            }

            if (count > 0)
                this.setValue(new Point(px, py), total / count);
        }

        private draw(): void {

            var context = this._element.getContext("2d");
            var cellSize = this._element.width / this._mapSize;

            context.clearRect(0, 0, this._element.width, this._element.height);

            for (var y = 0; y < this._mapSize; y++) {

                for (var x = 0; x < this._mapSize; x++) {

                    var cell = this.getValue(new Point(x, y));
                    if (cell) {

                        context.fillStyle = this.getTerrainStyle(cell);
                        context.fillRect(x * cellSize, y * cellSize, cellSize + 1, cellSize + 1);
                    }
                }
            }
        }
    }
}