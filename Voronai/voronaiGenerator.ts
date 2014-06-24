class VoronaiGenerator {

    private _element: HTMLCanvasElement;
    private _width: number;
    private _height: number;
    private _points: number;
    private _pointCells: Object;
    private _data: Cell[];

    constructor(element: string, height: number, width: number) {

        this._element = <HTMLCanvasElement>document.getElementById('content');

        this._width = width;
        this._height = height;
        this._points = 0;
    }

    private findClosest(x: number, y: number): number {

        var closest = { index: 0, distance: this._height * this._width };

        var index = 1;
        for (var p in this._pointCells) {

            var point = this._pointCells[p];
            var px: number = point.X;
            var py: number = point.Y;

            //var distance = Math.abs(px - x) + Math.abs(py - y);
            var distance = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));

            if (distance < closest.distance) {
                closest.distance = distance;
                closest.index = index;
            }

            index++;
        }  

        return closest.index;  
    }

    private isPointCell(x: number, y: number): boolean {

        for (var p in this._pointCells) {

            var point = this._pointCells[p];

            if (point.X == x && point.Y == y)
                return true;
        }

        return false;
    }

    public init(points: number) {

        this._points = points;
        this._pointCells = {};
        this._data = new Array(this._height * this._width);

        // Generate Voronai Points first
        for (var p = 0; p < this._points; p++) {

            do {
                var px = Math.floor(Math.random() * this._width);
                var py = Math.floor(Math.random() * this._height);

                var key = px + "_" + py;
            }
            while (this._pointCells.hasOwnProperty(key));

            this._pointCells[key] = { X: px, Y: py };
        }

        for (var y = 0; y < this._height; y++) {

            for (var x = 0; x < this._width; x++) {

                var cell = new Cell();
                this._data[this.getIndex(x, y)] = cell;

                var closest = this.findClosest(x, y);
                cell.Value = closest;
            }
        }

        this.draw();
      
    }

    public getIndex(x: number, y: number): number {

        return x * this._height + y;
    }

    public draw() {

        var context = this._element.getContext("2d");
        var cellSize = this._element.width / this._width;

        context.clearRect(0, 0, this._element.width, this._element.height);

        for (var y = 0; y < this._height; y++) {

            for (var x = 0; x < this._width; x++) {

                if (this.isPointCell(x, y)) {

                    context.fillStyle = "#000000";
                }
                else {

                    var cell = this._data[this.getIndex(x, y)];
                    context.fillStyle = cell.Style(this._points);
                }

                context.fillRect(x * cellSize, y * cellSize, cellSize + 1, cellSize + 1);
            }
        }
    }
}