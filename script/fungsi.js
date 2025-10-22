function gbr_titik(imageDataTemp, x, y, r, g, b) {
    var index;
    index = 4 * (Math.ceil(x) + Math.ceil(y) * cnv.width);
    imageDataTemp.data[index] = r;
    imageDataTemp.data[index + 1] = g;
    imageDataTemp.data[index + 2] = b;
    imageDataTemp.data[index + 3] = 255;
}

function dda_line(ImageDataA, x1, y1, x2, y2, r, g, b) {
    var dx, dy;
    dx = x2 - x1;
    dy = y2 - y1;
    if (Math.abs(dx) >= Math.abs(dy)) {
        if (x1 > x2) {
            var y = y1;
            for (var x = x1; x > x2; x--) {
                y = y + dy / Math.abs(dx);
                gbr_titik(ImageDataA, x, y, r, g, b);
            }
        } else {
            var y = y1;
            for (var x = x1; x < x2; x++) {
                y = y + dy / Math.abs(dx);
                gbr_titik(ImageDataA, x, y, r, g, b);
            }
        }
    } else {
        if (y1 > y2) {
            var x = x1;
            for (var y = y1; y > y2; y--) {
                x = x + dx / Math.abs(dy);
                gbr_titik(ImageDataA, x, y, r, g, b);
            }
        } else {
            var x = x1;
            for (var y = y1; y < y2; y++) {
                x = x + dx / Math.abs(dy);
                gbr_titik(ImageDataA, x, y, r, g, b);
            }
        }
    }
}

function lingkaran(imageDataA, xc, yc, radius, r, g, b) {
    for (var x = xc - radius; x < xc + radius; x++) {
        var y = yc + Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
        gbr_titik(imageDataA, x, y, r, g, b);
        var y = yc - Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
        gbr_titik(imageDataA, x, y, r, g, b);
    }

    for (var x = xc - radius; x < xc + radius; x++) {
        var y = yc + Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
        gbr_titik(imageDataA, y, x, r, g, b);
        var y = yc - Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
        gbr_titik(imageDataA, y, x, r, g, b);
    }
}

function lingkaran_polar(imageDataA, xc, yc, radius, r, g, b) {
    for (var theta = 0; theta < Math.PI * 2; theta += 0.0001) {
        x = xc + radius * Math.cos(theta);
        y = yc + radius * Math.sin(theta);
        gbr_titik(imageDataA, x, y, r, g, b);
    }
}

function elipse_polar(imageDataA, xc, yc, rx, ry, r, g, b) {
    for (var theta = 0; theta < Math.PI * 2; theta += 0.01) {
        x = xc + rx * Math.cos(theta);
        y = yc + ry * Math.sin(theta);
        gbr_titik(imageDataA, x, y, r, g, b);
    }
}

function drawing(imageDataA, n, xc, yc, radius, r, g, b) {
    for (var theta = 0; theta < Math.PI * 2; theta += 0.01) {
        x = xc + radius * Math.cos(n * theta) * Math.cos(theta);
        y = yc + radius * Math.cos(n * theta) * Math.sin(theta);
        gbr_titik(imageDataA, x, y, r, g, b);
    }
}

function floodFillNaive(imageDataA, canvas, x, y, toFlood, color) {
    var index = 4 * (Math.ceil(x) + Math.ceil(y) * cnv.width);

    var r1 = imageDataA.data[index];
    var g1 = imageDataA.data[index + 1];
    var b1 = imageDataA.data[index + 2];

    if (r1 == toFlood.r && g1 == toFlood.g && b1 == toFlood.b) {
        imageDataA.data[index] = color.r;
        imageDataA.data[index + 1] = color.g;
        imageDataA.data[index + 2] = color.b;
        imageDataA.data[index + 3] = 255; // A

        floodFillNaive(imageDataA, canvas, x + 1, y, toFlood, color);
        floodFillNaive(imageDataA, canvas, x, y + 1, toFlood, color);
        floodFillNaive(imageDataA, canvas, x - 1, y, toFlood, color);
        floodFillNaive(imageDataA, canvas, x, y - 1, toFlood, color);
    }
}

function floodFillStack(imageDataA, canvas, x0, y0, toFlood, color) {
    var stackTumpukan = [];

    stackTumpukan.push({ x: x0, y: y0 });

    while (stackTumpukan.length > 0) {
        var titik_sekarang = stackTumpukan.pop();
        var index_sekarang =
            4 * (titik_sekarang.x + titik_sekarang.y * canvas.width);
        var r1 = imageDataA.data[index_sekarang];
        var g1 = imageDataA.data[index_sekarang + 1];
        var b1 = imageDataA.data[index_sekarang + 2];

        if (r1 == toFlood.r && g1 == toFlood.g && b1 == toFlood.b) {
            imageDataA.data[index_sekarang] = color.r;
            imageDataA.data[index_sekarang + 1] = color.g;
            imageDataA.data[index_sekarang + 2] = color.b;
            imageDataA.data[index_sekarang + 3] = 255; // A

            stackTumpukan.push({
                x: titik_sekarang.x + 1,
                y: titik_sekarang.y,
            });
            stackTumpukan.push({
                x: titik_sekarang.x,
                y: titik_sekarang.y + 1,
            });
            stackTumpukan.push({
                x: titik_sekarang.x - 1,
                y: titik_sekarang.y,
            });
            stackTumpukan.push({
                x: titik_sekarang.x,
                y: titik_sekarang.y - 1,
            });
        }
    }
}

function polygon(imageDataA, point_array, r, g, b) {
    for (var i = 0; i < point_array.length - 1; i++) {
        var x1 = point_array[i].x;
        var y1 = point_array[i].y;
        var x2 = point_array[i + 1].x;
        var y2 = point_array[i + 1].y;

        dda_line(imageDataA, x1, y1, x2, y2, r, g, b);
    }

    var xAkhir = point_array[point_array.length - 1].x;
    var yAkhir = point_array[point_array.length - 1].y;
    var xAwal = point_array[0].x;
    var yAwal = point_array[0].y;

    dda_line(imageDataA, xAkhir, yAkhir, xAwal, yAwal, r, g, b);
}
