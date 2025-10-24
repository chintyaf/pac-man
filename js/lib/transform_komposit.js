function createIdentity(){
    var identity = [
        [1,0,0],
        [0,1,0],
        [0,0,1]
    ];
    return identity;
}

function multiplyMatriks(m1, m2){
    var hasil = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ];

    for (var i=0;i<3;i++){
        for (var j=0;j<3;j++){
            for (var k=0;k<3;k++){
                hasil[i][k] += m1[i][j] * m2[j][k];
            }
        }
    }
    return hasil;
}

function createTranslasi(tx, ty){
    var translasi = [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1],
    ];
    return translasi;
}

function createScale(sx, sy){
    var skala = [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1],
    ];
    return skala;
}

function createRotation(theta){
    var rotasi = [
        [Math.cos(theta), -Math.sin(theta), 0],
        [Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 1],
    ];
    return rotasi;
}

function rotation_fp(xc, yc, theta){
    var m1 = createTranslasi(-xc, -yc);
    var m2 = createRotation(theta);
    var m3 = createTranslasi(xc, yc);

    var hasil = multiplyMatriks(m3,m2)
    hasil = multiplyMatriks(hasil,m1)
    return hasil;
}

function scale_fp(xc, yc, sx, sy){
    var m1 = createTranslasi(-xc, -yc);
    var m2 = createScale(sx, sy);
    var m3 = createTranslasi(xc, yc);

    var hasil = multiplyMatriks(m3,m2)
    hasil = multiplyMatriks(hasil,m1)
}

function transform_titik(titik_lama, m){
    var x_baru = m[0][0] * titik_lama.x + m[0][1] * titik_lama.y + m[0][2] * 1;
    var y_baru = m[1][0] * titik_lama.x + m[1][1] * titik_lama.y + m[1][2] * 1;

    return {x:x_baru, y:y_baru};
}

function transform_array(array_titik, m){
    var hasil = [];

    for (var i=0;i<array_titik.length;i++){
        var titik_baru = transform_titik(array_titik[i],m)
        hasil.push(titik_baru)
    }
    return hasil;
}