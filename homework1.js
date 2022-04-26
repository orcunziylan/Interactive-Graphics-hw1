"use strict";

var canvas;
var gl;

var numVertices  = 36;

var numChecks = 8;

var program;

var c;

var flag = true;

var pointsArray = [];
// var colorsArray = [];
var normalsArray = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

function quad(a, b, c, d) {

    var normal = cross(
        subtract(vertices[b], vertices[a]), 
        subtract(vertices[c], vertices[b]));
    normal = vec3(normal);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    program = initShaders( gl, "Gouraud-vertex-shader", "Gouraud-fragment-shader" );
    gl.useProgram( program );

    gl.viewport( 0, 0, canvas.width /2 , canvas.height /2);
    gl.viewport( canvas.width /2, 0, canvas.width /2 , canvas.height /2);
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    
    render();
}

//
// Homework 
//

var scaleXYZ = 1;
var tx = 0, ty = 0, tz = 0;
var ex = 1, ey = 1, ez = 1;
var Near = 0.01, Far = 9;
var projectionMatrix = mat4();
var shad_toggle = true;

// LIGHTING 
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// MATERIAL DEFINING
var materialAmbient = vec4( 0.1, 0.1, 0.6, 1.0 );
var materialDiffuse = vec4( 0.3, 0.3, 0.6, 1.0);
var materialSpecular = vec4( 0.6, 0.6, 0.6, 1.0 );
var materialShininess = 0.4;

var ambientColor, diffuseColor, specularColor;

var homework = function() {

    if (shad_toggle==true) {
        program = initShaders( gl, "Gouraud-vertex-shader", "Gouraud-fragment-shader" );
    }else{
        program = initShaders( gl, "Phong-vertex-shader", "Phong-fragment-shader" );
    } 
    gl.useProgram( program );
    
    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // var vColor = gl.getAttribLocation( program, "vColor" );
    // gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var ambient = mult(lightAmbient, materialAmbient);
    var diffuse = mult(lightDiffuse, materialDiffuse);
    var specular = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambient"),flatten(ambient));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuse"),flatten(diffuse) );
    gl.uniform4fv(gl.getUniformLocation(program, "specular"),flatten(specular) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);

    document.getElementById("scaleSlide").oninput =
    function() { scaleXYZ = event.srcElement.value; 
    };
    document.getElementById("transxSlide").oninput =
    function() { tx = event.srcElement.value; 
    };
    document.getElementById("transySlide").oninput =
    function() { ty = event.srcElement.value; 
    };
    document.getElementById("transzSlide").oninput =
    function() { tz = event.srcElement.value; 
    };
    document.getElementById("eyexSlide").oninput =
    function() { ex = event.srcElement.value; 
    };
    document.getElementById("eyeySlide").oninput =
    function() { ey = event.srcElement.value; 
    };
    document.getElementById("eyezSlide").oninput =
    function() { ez = event.srcElement.value; 
    };
    document.getElementById("orthoNearSlide").oninput =
    function() { event.srcElement.value < Far ? Near = event.srcElement.value: Near = Far - 1;
        console.log(event.srcElement.value, "near");
    };
    document.getElementById("orthoFarSlide").oninput =
    function() { Near < event.srcElement.value ? Far = event.srcElement.value : Far = Math.round(Near)+1;
        console.log(event.srcElement.value, "far");
    };
    document.getElementById("shaderToggle").onclick = 
    function() {shad_toggle=!shad_toggle;
    };


    // View Matrix

    var eye = vec3(ex, ey, ez);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    
    var modelViewMatrix = lookAt(eye, at, up);

    // ModelViewMatrix = View Matrix * Translation and Scaling 
    
    modelViewMatrix = mult(modelViewMatrix, scalem(scaleXYZ, scaleXYZ, scaleXYZ));
    modelViewMatrix = mult(modelViewMatrix, translate(tx, ty, tz));
    
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));
    
}
var render = function() {
    homework();

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Divide canvas into 2 Parts
    
    projectionMatrix = ortho(-1, 1, -1, 1, Near, Far);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));
 
    gl.viewport( 0, 0, canvas.width /2 , canvas.height /2);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    projectionMatrix = perspective( 90, canvas.width / canvas.height, Near, Far);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));

    gl.viewport( canvas.width /2, 0, canvas.width /2 , canvas.height /2);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
   
    requestAnimFrame(render);
}