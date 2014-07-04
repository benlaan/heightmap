class Program {

    // private static _voronai: VoronaiGenerator;
    private static _terrainMap: Laan.Generators.MidpointDisplacement;
    private static _size: HTMLInputElement;
    private static _roughness: HTMLInputElement;
    private static _smooth: HTMLInputElement;
    private static _wrap: HTMLInputElement;
    private static _level: HTMLInputElement;

    private static reload() {

        // this._voronai.init(parseInt(this._points.value));

        var start = new Date().getTime();

        this._terrainMap = new Laan.Generators.MidpointDisplacement(
            "content",
            parseInt(this._size.value, 10),
            1,
            parseInt(this._roughness.value, 10),
            this._smooth.checked,
            this._wrap.checked,
            parseInt(this._level.value, 10)
        );

        var end = (new Date().getTime() - start) / 1000;

        this.getElement<HTMLLabelElement>("duration").textContent = end.toString();
    }

    private static getElement<T extends HTMLElement>(id: string): T {

        return <T>document.getElementById(id);
    }

    public static main() {

        this._size      = this.getElement<HTMLInputElement>("size");
        this._roughness = this.getElement<HTMLInputElement>("roughness");
        this._smooth    = this.getElement<HTMLInputElement>("smooth");
        this._wrap      = this.getElement<HTMLInputElement>("wrap");
        this._level     = this.getElement<HTMLInputElement>("level");

        // this._voronai = new VoronaiGenerator("content", 80, 160);

        this.getElement<HTMLInputElement>("refresh").onclick = e => this.reload();

        this.reload();
    }
}

window.onload = () => Program.main();