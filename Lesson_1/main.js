"use strict";
var block_size = 0.5;

var keyW = false;
		var keyA = false;
		var keyS = false;
		var keyD = false;

		var keySPACE = false;
		var keySHIFT = false;
		var keyQ = false;
		var keyE = false;

		var mLeft = 0
    var mRight = 0;

		var x = 10;
		var y = 4;
		var z = 10;
    
function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
		canvas.width = document.body.clientWidth; //document.width is obsolete
		canvas.height = document.body.clientHeight; //document.height is obsolete
		var canvasW = canvas.width;
		var canvasH = canvas.height;
		var gl = canvas.getContext("webgl");
		if (!gl) {
			return;
		}
  /*==========Console======================================*/

		// получаем ссылки на элементы DOM
		var timeElement = document.querySelector("#time");

		var xElement = document.querySelector("#x");
		var yElement = document.querySelector("#y");
		var zElement = document.querySelector("#z");

		var anglexElement = document.querySelector("#angleX");
		var angleyElement = document.querySelector("#angleY");


		// создаём текстовые узлы, чтобы сэкономить немного браузерного времени
		var timeNode = document.createTextNode("");

		var xNode = document.createTextNode("");
		var yNode = document.createTextNode("");
		var zNode = document.createTextNode("");


		var anglexNode = document.createTextNode("");
		var angleyNode = document.createTextNode("");

		// добавляем текстовые узлы в нужные места
		timeElement.appendChild(timeNode);

		xElement.appendChild(xNode);
		yElement.appendChild(yNode);
		zElement.appendChild(zNode);

		anglexElement.appendChild(anglexNode);
		angleyElement.appendChild(angleyNode);

		/*================= Mouse events ======================*/




		const CIRCLE_RAD = 3;

		var dX = canvas.width / 2;
		var dY = canvas.height / 2;


		canvas.onclick = function () {
			canvas.requestPointerLock();
		}



		document.addEventListener('pointerlockchange', lockStatusChange, false);

		function lockStatusChange() {
			if (document.pointerLockElement === canvas) {
				document.addEventListener("mousemove", updateCirclePosition, false);
			}
			else {
				document.removeEventListener("mousemove", updateCirclePosition, false);
			}
		}

		function updateCirclePosition(e) {
			dX += e.movementX;
			dY += e.movementY;

			if (dX > canvas.width) {
				dX = 0;
			}
			else if (dX < 0) {
				dX = canvas.width;
			}

			if (dY > canvas.height) {
				dY = 0;
			}
			else if (dY < 0) {
				dY = canvas.height;
			}
			e.preventDefault();


		}

		/* 
		var mouseMove = function(e) {
			dX = e.pageX, dY = e.pageY;
			e.preventDefault();
		 };
		canvas.addEventListener("mousemove", mouseMove, false);
		*/

		/*=======================keys======================*/
		keyboard();


		/////////////////////////////////////////////////
  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  var textureLocation = gl.getUniformLocation(program, "u_texture");

  // Create a buffer for positions
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put the positions in the buffer
  setGeometry(gl);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // Set Texcoords.
  setTexcoords(gl);

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  var image = new Image();
  image.src = "resources/grass.png";
  image.addEventListener('load', function () {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Check if the image is a power of 2 in both dimensions.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);
  var modelXRotationRadians = degToRad(0);
  var modelYRotationRadians = degToRad(0);

  // Get the starting time.
  var then = 0;

  var AngleX = 0;
	var AngleY = 0;

	var speed = 0.1;

	var cubeTranslation = [0, 0, 0];

  var X = 0, Y = 0, Z = 0, oldX = 0, oldY = 0, oldZ = 0;

  var dy = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    // convert to seconds
			time *= 0.001;
			
			timeNode.nodeValue = time.toFixed(2);   // 2 десятичных знака
			xNode.nodeValue = Math.round(x);
			yNode.nodeValue = Math.round(y);
			zNode.nodeValue = Math.round(z);

			var xt = canvas.width / 2;
			var yt = canvas.height / 2;

			AngleX += (xt - dX) / 4;
			AngleY += (yt - dY) / 4;
			if (AngleY < -89.0) { AngleY = -89.0; }
			if (AngleY > 89.0) { AngleY = 89.0; }

			anglexNode.nodeValue = y + (Math.sin(AngleY / 180 * Math.PI));
			angleyNode.nodeValue = y + (Math.sin(AngleY / 180 * Math.PI));

			dX = xt;
			dY = yt;

			if (keyD == true) {
				if (keyW == true || keyS == true) {
					x += (Math.sin((AngleX + 90) / 180 * Math.PI) * speed) / 2;
					z += (Math.cos((AngleX + 90) / 180 * Math.PI) * speed) / 2;
				}
				else {
					x += Math.sin((AngleX + 90) / 180 * Math.PI) * speed;
					z += Math.cos((AngleX + 90) / 180 * Math.PI) * speed;
				}

			}
			if (keyS == true) {
				if (keyD == true || keyA == true) {
					z += (Math.cos(AngleX / 180 * Math.PI) * speed) / 2;
					x += (Math.sin(AngleX / 180 * Math.PI) * speed) / 2;
				}
				else {
					z += Math.cos(AngleX / 180 * Math.PI) * speed;
					x += Math.sin(AngleX / 180 * Math.PI) * speed;
				}

			}
			if (keyA == true) {
				//x-=1
				if (keyW == true || keyS == true) {
					x += (Math.sin((AngleX - 90) / 180 * Math.PI) * speed) / 2;
					z += (Math.cos((AngleX - 90) / 180 * Math.PI) * speed) / 2;
				}
				else {
					x += Math.sin((AngleX - 90) / 180 * Math.PI) * speed;
					z += Math.cos((AngleX - 90) / 180 * Math.PI) * speed;
				}
			}
			if (keyW == true) {
				//z-=1
				if (keyD == true || keyA == true) {
					z -= (Math.cos(AngleX / 180 * Math.PI) * speed) / 2;
					x -= (Math.sin(AngleX / 180 * Math.PI) * speed) / 2;
				}
				else {
					z -= Math.cos(AngleX / 180 * Math.PI) * speed;
					x -= Math.sin(AngleX / 180 * Math.PI) * speed;
				}
				//x=-Math.sin(AngleX/180*
			}

			if (keySHIFT == true) {
				y -= speed
			}
      if (keySPACE == true) {
				y += speed
			}

			if (keyQ == true) {
				mRight = 1;
			}
			if (keyE == true) {
				mLeft = 1;
			}


			if (mRight == 1 || mLeft == 1) {
				var dist = 0;
				X = x;
				Y = y;
				Z = z;
				oldX = X; oldY = Y; oldZ = Z;
				while (dist < 5) {
					dist++;
					X += -(Math.sin(AngleX / 180 * Math.PI)) * (Math.cos(AngleY / 180 * Math.PI));
					Y += (Math.sin(AngleY / 180 * Math.PI));
					Z += -(Math.cos(AngleX / 180 * Math.PI)) * (Math.cos(AngleY / 180 * Math.PI));

					oldX = X; oldY = Y; oldZ = Z;
				}
				mLeft = mRight = 0;
			}

			mLeft = mRight = 0;

			webglUtils.resizeCanvasToDisplaySize(gl.canvas);

		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // bind the texcoord buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        var cameraPosition = [x, y, z];
        var target = [x - (Math.sin(AngleX / 180 * Math.PI)), y + (Math.tan(AngleY / 180 * Math.PI)), z - (Math.cos(AngleX / 180 * Math.PI))];
        var up = [0, 1, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(textureLocation, 0);

    // Draw the geometry.
    //gl.drawArrays(gl.LINES, 0, 6 * 6);
    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with the values that define a cube.
function setGeometry(gl) {
  var positions = new Float32Array(
    [
      -block_size, -block_size, -block_size,
      -block_size, block_size, -block_size,
      block_size, -block_size, -block_size,

      -block_size, block_size, -block_size,
      block_size, block_size, -block_size,
      block_size, -block_size, -block_size,

      -block_size, -block_size, block_size,
      block_size, -block_size, block_size,
      -block_size, block_size, block_size,

      -block_size, block_size, block_size,
      block_size, -block_size, block_size,
      block_size, block_size, block_size,

      -block_size, block_size, -block_size,
      -block_size, block_size, block_size,
      block_size, block_size, -block_size,

      -block_size, block_size, block_size,
      block_size, block_size, block_size,
      block_size, block_size, -block_size,

      -block_size, -block_size, -block_size,
      block_size, -block_size, -block_size,
      -block_size, -block_size, block_size,

      -block_size, -block_size, block_size,
      block_size, -block_size, -block_size,
      block_size, -block_size, block_size,

      -block_size, -block_size, -block_size,
      -block_size, -block_size, block_size,
      -block_size, block_size, -block_size,

      -block_size, -block_size, block_size,
      -block_size, block_size, block_size,
      -block_size, block_size, -block_size,

      block_size, -block_size, -block_size,
      block_size, block_size, -block_size,
      block_size, -block_size, block_size,
      
      block_size, -block_size, block_size,
      block_size, block_size, -block_size,
      block_size, block_size, block_size,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the buffer with texture coordinates the cube.
function setTexcoords(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
      [
        // select the top left image
        0.25, 0.5,
        0.25, 0,
        0, 0.5,

        0.25, 0,
        0, 0,
        0, 0.5,

        // select the top middle image
        0.25, 0.5, //    0, 0.5,                       
        0.5, 0.5, //    0, 0,
        0.25, 0, //    0.25, 0.5,

        0.25, 0,
        0.5, 0.5,
        0.5, 0,

        // select to top right image
        0.5, 0,
        0.5, 0.5,
        0.75, 0,

        0.5, 0.5,
        0.75, 0.5,
        0.75, 0,

        // select the bottom left image
        0, 0.5,
        0.25, 0.5,
        0, 1,

        0, 1,
        0.25, 0.5,
        0.25, 1,

        // select the bottom middle image
        0.25, 1, //    0, 0.5,                       
        0.5, 1, //    0, 0,
        0.25, 0.5, //    0.25, 0.5,

        0.5, 1,
        0.5, 0.5,
        0.25, 0.5,

        // select the bottom right image
        0.75, 1,
        0.75, 0.5,
        0.5, 1,

        0.5, 1,
        0.75, 0.5,
        0.5, 0.5,

      ]),
    gl.STATIC_DRAW);
}

function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
  var matrix = m4.translate(viewProjectionMatrix,
    translation[0],
    translation[1],
    translation[2]);
  matrix = m4.xRotate(matrix, xRotation);
  return m4.yRotate(matrix, yRotation);
}

function keyboard(){
  window.addEventListener("keydown", onKeyDown, false);
		window.addEventListener("keyup", onKeyUp, false);
		window.onmousedown = function (e) {
			///console.log(e.which);
			if (e.which == 1) mLeft = 1;
			if (e.which == 3) mRight = 1;
		}

		function onKeyDown(event) {
			var keyCode = event.keyCode;
			switch (keyCode) {
				case 68: //d
					keyD = true;
					break;
				case 83: //s
					keyS = true;
					break;
				case 65: //a
					keyA = true;
					break;
				case 87: //w
					keyW = true;
					break;


				case 32: //SPACE
					keySPACE = true;
					break;
				case 16: //SHIFT
					keySHIFT = true;
					break;

				case 81: //Q
					keyQ = true;
					break;
				case 69: //E
					keyE = true;
					break;
			}
		}

		function onKeyUp(event) {
			var keyCode = event.keyCode;

			switch (keyCode) {
				case 68: //d
					keyD = false;
					break;
				case 83: //s
					keyS = false;
					break;
				case 65: //a
					keyA = false;
					break;
				case 87: //w
					keyW = false;
					break;


				case 32: //SPACE
					keySPACE = false;
					break;
				case 16: //SHIFT
					keySHIFT = false;
					break;

				case 81: //Q
					keyQ = false;
					break;
				case 69: //E
					keyE = false;
					break;
			}
		}
}

main();