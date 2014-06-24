var Program = (function () {
    function Program() {
    }
    Program.reload = function () {
        this._voronai.init(parseInt(this._points.value));
    };

    Program.main = function () {
        var _this = this;
        this._points = document.getElementById('pointCount');
        this._points.onchange = function (e) {
            return _this.reload();
        };

        this._voronai = new VoronaiGenerator("content", 160, 80);

        var refresh = document.getElementById('refresh');
        refresh.onclick = function (e) {
            return _this.reload();
        };

        this._points.value = (50).toString();
        this.reload();
    };
    return Program;
})();

window.onload = function () {
    return Program.main();
};
//# sourceMappingURL=program.js.map
