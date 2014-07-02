class Program {

    //private static _voronai: VoronaiGenerator;
    private static _terrainMap: Laan.Generators.MidpointDisplacement;
    private static _size: HTMLInputElement;
    private static _roughness: HTMLInputElement;
    private static _smooth: HTMLInputElement;
    private static _wrap: HTMLInputElement;
    private static _level: HTMLInputElement;

    private static reload() {

        //this._voronai.init(parseInt(this._points.value));

        this._terrainMap = new Laan.Generators.MidpointDisplacement(
            "content", 
            parseInt(this._size.value),
            1,
            parseInt(this._roughness.value),
            this._smooth.checked,
            this._wrap.checked,
            parseInt(this._level.value)
        );
    }

    private static getElement<T extends HTMLElement>(id: string): T {

        return <T>document.getElementById(id);
    }

    public static main() {

        var parameters = this.getElement<HTMLDivElement>('parameters');

        var map = this.getElement<HTMLCanvasElement>('content');
        map.width = window.innerWidth - 20;                             // *magic* number!!
        map.height = window.innerHeight - parameters.offsetHeight - 50; // *magic* number!!

        this._size      = this.getElement<HTMLInputElement>('size');
        this._roughness = this.getElement<HTMLInputElement>('roughness');
        this._smooth    = this.getElement<HTMLInputElement>('smooth');
        this._wrap      = this.getElement<HTMLInputElement>('wrap');
        this._level     = this.getElement<HTMLInputElement>('level');

        //this._voronai = new VoronaiGenerator("content", 80, 160);

        var refresh = this.getElement<HTMLInputElement>('refresh');
        refresh.onclick = e => this.reload();

        this.reload();
    }
}

window.onload = () => Program.main();