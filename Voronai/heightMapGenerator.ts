module Laan.Generators {

    interface ColorMap { 

        step: number;
        start: Color;
        end: Color;
    }

    class Color {

        constructor(r: number, g: number, b: number) {

            this.r = r;
            this.g = g;
            this.b = b;
        }

        r: number;
        g: number;
        b: number;

        public toFillStyle(): string {

            return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
        }
    }

    class Point {

        constructor(x: number, y: number) {

            this.x = x;
            this.y = y;
        }

        x: number;
        y: number;

        public toString(): string {

            return [this.x, this.y].join(":");
        }
    }

    class Rect {

        constructor(bottomRight: Point, size: number) {

            var leftX = bottomRight.x - size;
            var topY = bottomRight.y - size;

            this.topLeft = new Point(leftX, topY);
            this.topRight = new Point(bottomRight.x, topY);
            this.bottomLeft = new Point(leftX, bottomRight.y);
            this.bottomRight = new Point(bottomRight.x, bottomRight.y);
            this.center = new Point(bottomRight.x - (size / 2), bottomRight.y - (size / 2));
        }

        topLeft: Point;
        topRight: Point;
        bottomLeft: Point;
        bottomRight: Point;
        center: Point;

        get topCentre(): Point {

            return new Point((this.topRight.x + this.topLeft.x) / 2, this.topLeft.y);
        }

        get rightCentre(): Point {

            return new Point(this.topRight.x, (this.bottomRight.y + this.topRight.y) / 2);
        }

        get bottomCentre(): Point {

            return new Point((this.topRight.x + this.topLeft.x) / 2, this.bottomLeft.y);
        }

        get leftCentre(): Point {

            return new Point(this.topLeft.x, (this.bottomLeft.y + this.topLeft.y) / 2);
        }
    }

    export class MidpointDisplacement {

        private _unitSize: number;
        private _roughness: number;
        private _water: number;
        private _wrap : boolean;

        private _mapSize: number;
        private _data: Float64Array;
        private _element: HTMLCanvasElement;

        private _colorMap: ColorMap[];

        constructor(element: string, size: number, unitSize: number, roughness: number, smoothing: boolean, wrap: boolean, water: number) {

            this._element = <HTMLCanvasElement>document.getElementById('content');

            this._unitSize = unitSize;
            this._roughness = roughness;
            this._water = water;

            this._data = new Float64Array(size * size);

            this._wrap = wrap;
            this._mapSize = size;


            this.defineColorMap();
            this.initialiseCorners();
            this.midpointDisplacment(size);

            if(smoothing)
                this.smooth();

            this.draw();
        }

        private defineColorMap():void {

            var water = 0.32 + (this._water / 100);

            this._colorMap = [
                {
                    step: water,
                    start: new Color(39, 50, 63),
                    end:   new Color(10, 20, 40)
                },
                {
                    step: water + 0.05,
                    start: new Color(98, 105, 83),
                    end:   new Color(189, 189, 144)
                },
                { 
                    step: 0.89,
                    start: new Color(67, 140, 18),
                    end:   new Color(22, 68, 3)
                },
                { 
                    step: 0.97,
                    start: new Color(67, 80, 18),
                    end:   new Color(60, 56, 31)
                },
                { 
                    step: 0.992,
                    start: new Color(130, 130, 130),
                    end:   new Color(90, 90, 90)
                },
                {
                    step: 1,
                    start: new Color(200, 200, 200),
                    end:   new Color(255, 255, 255)
                }
            ];
        }

        private getIndex(point: Point): number {

            return point.x * this._mapSize + point.y;
        }

        private getValue(point: Point): number {

            var x = this._wrap && point.x == this._mapSize ? 0 : point.x;
            var y = this._wrap && point.y == this._mapSize ? 0 : point.y;

            return this._data[this.getIndex(new Point(x, y))];
        }

        private clamp(value: number): number {

            return value > 1 ? 1 : (value < 0 ? 0 : value);
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

        private fade(map: ColorMap, previousStep: number, altitude: number) : Color {

            var level = map.step - previousStep;
            var range = altitude - previousStep;

            var r = Math.floor(map.end.r + (~~ ((map.start.r - map.end.r) / level) * range));
            var g = Math.floor(map.end.g + (~~ ((map.start.g - map.end.g) / level) * range));
            var b = Math.floor(map.end.b + (~~ ((map.start.b - map.end.b) / level) * range));

            return new Color(r, g, b);
        }

        private getColor(altitude: number): Color {

            var last = 0;
            for (var i in this._colorMap) {

                var c = this._colorMap[i];

                if (altitude > last && altitude <= c.step)
                    return this.fade(c, last, altitude);

                last = c.step;
            };

            console.log(altitude);
            console.log(this._colorMap);
            debugger;

            throw "!"
            return null;
            //var lastColor = this._colorMap[this._colorMap.length - 1];
            //return this.fade(lastColor, last, altitude);
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

                        context.fillStyle = this.getColor(cell).toFillStyle();
                        context.fillRect(x * cellSize, y * cellSize, cellSize + 1, cellSize + 1);
                    }
                }
            }
        }
    }
}