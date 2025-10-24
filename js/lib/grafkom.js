// js/lib/grafkom.js

var cnv; // Variabel global ini penting, jangan dihapus

function gambar_titik(imageDataA,x,y,r,g,b){
    var index;
    index = 4 *(Math.ceil(x) + ( Math.ceil(y) * cnv.width ));
    imageDataA.data[index] = r;     //R
    imageDataA.data[index+1] = g;   //G
    imageDataA.data[index+2] = b;   //B
    imageDataA.data[index+3] = 255;   //A
}

function dda_line(imageDataA,x1,y1,x2,y2,r,g,b){
    var dx, dy;
    dx = x2 - x1;
    dy = y2 - y1;
    if(Math.abs(dx)>Math.abs(dy)){
        if (x1>x2){
            var y = y1;
            for (var x=x1;x>x2;x--){
                y = y + (dy)/Math.abs(dx);
                gambar_titik(imageDataA,x,y,r,g,b)
            }
        }
        else{
            var y = y1;
            for (var x=x1;x<=x2;x++){
                y = y + (dy)/Math.abs(dx);
                gambar_titik(imageDataA,x,y,r,g,b)
            }
        }
    } 
    else {
        if ( y1>y2 ){
            var x = x1;
            for (var y=y1;y>y2;y--){
                x = x + (dx)/Math.abs(dy);
                gambar_titik(imageDataA,x,y,r,g,b)
            }
        }
        else {
            var x = x1;
            for (var y=y1;y<=y2;y++){
                x = x + (dx)/Math.abs(dy);
                gambar_titik(imageDataA,x,y,r,g,b)
            }
        }    
    }
}

function lingkaran(imageDataA,xc,yc,radius,r,g,b){
    for(var x= xc-radius;x<xc+radius;x++){
        var y = yc + Math.sqrt(Math.pow(radius,2)-Math.pow((x-xc),2))
        gambar_titik(imageDataA,x,y,r,g,b)
        var y = yc - Math.sqrt(Math.pow(radius,2)-Math.pow((x-xc),2))
        gambar_titik(imageDataA,x,y,r,g,b)
    }
    for(var x= xc-radius;x<xc+radius;x++){
        var y = yc + Math.sqrt(Math.pow(radius,2)-Math.pow((x-xc),2))
        gambar_titik(imageDataA,y,x,r,g,b)
        var y = yc - Math.sqrt(Math.pow(radius,2)-Math.pow((x-xc),2))
        gambar_titik(imageDataA,y,x,r,g,b)
    }
}

function lingkaran_polar(imageDataA,xc,yc,radius,r,g,b){
    for(var theta=0; theta<Math.PI*2;theta+=0.0001){

        x = xc + radius * Math.cos(theta);
        y = yc + radius * Math.sin(theta);

        gambar_titik(imageDataA,x,y,r,g,b);
    }
}

function ellips(imageDataA,xc,yc,rx,ry,r,g,b){
    for(var theta=0; theta<Math.PI*2;theta+=0.01){

        x = xc + rx * Math.cos(theta);
        y = yc + ry * Math.sin(theta);

        gambar_titik(imageDataA,x,y,r,g,b);
    }
}

function flower(imageDataA,xc,yc,radius,r,g,b,n){
    for(var theta=0; theta<Math.PI*2;theta+=0.01){
        
        x = xc + radius * Math.cos(n*theta)* Math.cos(theta);
        y = yc + radius * Math.cos(n*theta)* Math.sin(theta);
        

        gambar_titik(imageDataA,x,y,r,g,b);
    }
}

function floodFillNaive(imageDataA,cnv,x,y,toFlood,color){
    var index = 4 *(x + ( y * cnv.width ));
    var r1 = imageDataA.data[index];
    var g1 = imageDataA.data[index+1];
    var b1 = imageDataA.data[index+2];

    if(r1==toFlood.r && g1==toFlood.g && b1==toFlood.b){
        imageDataA.data[index] = color.r;     //R
        imageDataA.data[index+1] = color.g;   //G
        imageDataA.data[index+2] = color.b;   //B
        imageDataA.data[index+3] = 255;   //A

        floodFillNaive(imageDataA,cnv,x+1,y,toFlood,color)
        floodFillNaive(imageDataA,cnv,x,y+1,toFlood,color)
        floodFillNaive(imageDataA,cnv,x-1,y,toFlood,color)
        floodFillNaive(imageDataA,cnv,x,y-1,toFlood,color)

    }
}

function floodFillStack(imageDataA,cnv,x0,y0,toFlood,color){
    var stackTumpukan = [];
    stackTumpukan.push({x:x0,y:y0});

    while(stackTumpukan.length>0){
        var titik_sekarang = stackTumpukan.pop()
        var index_sekarang = 4 *(titik_sekarang.x + ( titik_sekarang.y * cnv.width ));

        var r1 = imageDataA.data[index_sekarang];
        var g1 = imageDataA.data[index_sekarang+1];
        var b1 = imageDataA.data[index_sekarang+2];
        
        if(r1==toFlood.r && g1==toFlood.g && b1==toFlood.b){
            imageDataA.data[index_sekarang] = color.r;     //R
            imageDataA.data[index_sekarang+1] = color.g;   //G
            imageDataA.data[index_sekarang+2] = color.b;   //B
            imageDataA.data[index_sekarang+3] = 255;   //A
    
            stackTumpukan.push({x: titik_sekarang.x+1,y: titik_sekarang.y})
            stackTumpukan.push({x: titik_sekarang.x,y: titik_sekarang.y+1})
            stackTumpukan.push({x: titik_sekarang.x-1,y: titik_sekarang.y})
            stackTumpukan.push({x: titik_sekarang.x,y: titik_sekarang.y-1})
    
        }
    }
}

function polygon(imageDataA, point_array, r, g, b){
    for( var i=0;i<point_array.length-1;i++){
        var x1 = point_array[i].x;
        var y1 = point_array[i].y;
        var x2 = point_array[i+1].x;
        var y2 = point_array[i+1].y;

        dda_line(imageDataA,x1,y1,x2,y2,r,g,b);
    }

    console.log(point_array.length-1)
    var xAkhir = point_array[point_array.length-1].x;
    var yAkhir = point_array[point_array.length-1].y;
    var xAwal = point_array[0].x;
    var yAwal = point_array[0].y;
    // console.log(xAkhir,yAkhir,xAwal,yAwal)
    dda_line(imageDataA,xAkhir,yAkhir,xAwal,yAwal,r,g,b);

}