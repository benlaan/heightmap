class Program {

    //private static _voronai: VoronaiGenerator;
    private static _terrainMap: Laan.Generators.MidpointDisplacement;
    private static _size: HTMLInputElement;
    private static _roughness: HTMLInputElement;
    private static _smooth: HTMLInputElement;
    private static _level: HTMLInputElement;

    private static reload() {

        //this._voronai.init(parseInt(this._points.value));

        this._terrainMap = new Laan.Generators.MidpointDisplacement(
            "content", 
            parseInt(this._size.value),
            1,
            parseInt(this._roughness.value),
            this._smooth.value == "checked",
            parseInt(this._level.value)
        );
    }

    private static getInput(id: string): HTMLInputElement {

        return <HTMLInputElement>document.getElementById(id);
    }

    public static main() {

        this._size      = this.getInput('size');
        this._roughness = this.getInput('roughness');
        this._smooth    = this.getInput('smooth');
        this._level     = this.getInput('level');

        //this._voronai = new VoronaiGenerator("content", 80, 160);

        var refresh = this.getInput('refresh');
        refresh.onclick = e => this.reload();

        this.reload();
    }
}

window.onload = () => Program.main();