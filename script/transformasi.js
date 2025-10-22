// duplicate
function translasi(titik_lama, jarak_pindah) {
    var x_baru = titik_lama.x + jarak_pindah.x;
    var y_baru = titik_lama.y + jarak_pindah.y;

    return { x: x_baru, y: y_baru };
}

function skala(titik_lama, S) {
    var x_baru = titik_lama.x * S.x;
    var y_baru = titik_lama.y * S.y;

    return { x: x_baru, y: y_baru };
}

function rotasi(titik_lama, sudut) {
    var x_baru =
        titik_lama.x * Math.cos(sudut) - titik_lama.y * Math.sin(sudut);
    var y_baru =
        titik_lama.x * Math.sin(sudut) + titik_lama.y * Math.cos(sudut);

    return { x: x_baru, y: y_baru };
}

function rotasiFP(titik_lama, titik_putar, sudut) {
    var p1 = translasi(titik_lama, { x: -titik_putar.x, y: -titik_putar.y });
    var p2 = rotasi(p1, sudut);
    var p3 = translasi(p2, titik_putar);

    return p3;
}

function skalaFP(titik_lama, titik_pusat, S) {
    var p1 = translasi(titik_lama, { x: -titik_pusat.x, y: -titik_pusat.y });
    var p2 = skala(p1, S);
    var p3 = translasi(p2, titik_pusat);
    return p3;
}

function translasi_array(titik_lama, T) {
    var array_hasil = [];
    for (var i = 0; i < titik_lama.length; i++) {
        var temp = translasi(titik_lama[i], T);
        array_hasil.push(temp);
    }
    return array_hasil;
}
