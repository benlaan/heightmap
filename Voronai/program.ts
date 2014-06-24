class Program {

    private static _voronai: VoronaiGenerator;
    private static _points: HTMLInputElement;

    private static reload() {

        this._voronai.init(parseInt(this._points.value));
    }

    public static main() {

        this._points = <HTMLInputElement>document.getElementById('pointCount');
        this._points.onchange = e => this.reload();

        this._voronai = new VoronaiGenerator("content", 160, 80);

        var refresh = <HTMLInputElement>document.getElementById('refresh');
        refresh.onclick = e => this.reload();

        this._points.value = (50).toString();
        this.reload();
    }
}

window.onload = () => Program.main();