class Cell {

    Value: number;

    Style(total: number): string {

        if (this.Value > 0) {

            var n = this.Value * 240 / total;
            return 'hsl(' + n + ',100%,50%)';
        }

        return "#000000";
    }
}