var Cell = (function () {
    function Cell() {
    }
    Cell.prototype.Style = function (total) {
        if (this.Value > 0) {
            var n = this.Value * 240 / total;
            return 'hsl(' + n + ',100%,50%)';
        }

        return "#000000";
    };
    return Cell;
})();
//# sourceMappingURL=cell.js.map
