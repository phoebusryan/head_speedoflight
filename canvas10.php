<?php
	error_reporting(E_ALL);
	ini_set('display_errors',1);
	
	$Root = dirname(__FILE__).'/json_data/';
	if(empty(($File = $_GET['file']))) die();
	
	$fh = fopen('json_data/'.$File,"r");
	$Content = fread($fh,filesize('json_data/'.$File));
	fclose($fh);
	$Content = json_decode($Content,1);
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Canvas Test</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<script src="http://threejs.org/build/three.min.js"></script>
		<script src="http://threejs.org/examples/js/controls/OrbitControls.js"></script>
		
		<script src="http://threejs.org/examples/js/shaders/ConvolutionShader.js"></script>
		<script src="http://threejs.org/examples/js/shaders/CopyShader.js"></script>
		<script src="http://threejs.org/examples/js/shaders/FXAAShader.js"></script>
		
		<script src="http://threejs.org/examples/js/postprocessing/EffectComposer.js"></script>
		<script src="http://threejs.org/examples/js/postprocessing/MaskPass.js"></script>
		<script src="http://threejs.org/examples/js/postprocessing/RenderPass.js"></script>
		<script src="http://threejs.org/examples/js/postprocessing/ShaderPass.js"></script>
		<script src="http://threejs.org/examples/js/postprocessing/BloomPass.js"></script>
		
		<script src="jquery-2.2.1.min.js"></script>
		<script src="speedoflight.js"></script>
		<script>
			var sol;
			var points = [];
			
			$(document).ready(function() {
				$('.options input[name=hue], .options input[name=saturation]').change(function() {
					var hue = $('input[name=hue]').val();
					var saturation = $('input[name=saturation]').val();
					
					sol.setMeshColor(hue, saturation, 0.5);
				});
				
				$('.options input[name=form]').change(function() {
					sol.drawForm(points, $(this).val(), 5, 0.6);
				});
				
				sol = new speedoflight();
				sol.init();
				sol.drawForm(points, 'line', 5, 0.6);
			});
		</script>
		<script>
			<?php
				//Start - definition der punkte
					foreach ($Content['json_data'] as $index => $point) {
						?>
						points[<?=$index;?>] = new Object();
						points[<?=$index;?>]['x'] = <?=$point['x'];?>;
						points[<?=$index;?>]['y'] = <?=$point['y'];?>;
						points[<?=$index;?>]['z'] = <?=$point['z'];?>;
						<?php
					}
				//End - definition der punkte
			?>
		</script>
		<style>
			body {
				margin: 0px;
				overflow: hidden;
			}
			
			a.back {
				top: 10px;
				left: 10px;
				color: #222;
				z-index: 10000;
				position: fixed;
				background: #fff;
				padding: 10px 20px;
			}
			
			div.options {
				color:#fff;
				position:fixed;
				right:10px;
				top:10px;
				z-index:10000;
			}
			
			div.options span {
				color:#fff;
			}
		</style>
	</head>
	<body>
		<a class="back" href="statistics.php">Back to overview</a>
		<div class="options">
			<span>
				H:
				<input type="range" min="0" max="1" value="0.5" step="0.1" name="hue">
			</span>
			<br>
			<span>
				S:
				<input type="range" min="0" max="1" value="0.5" step="0.1" name="saturation">
			</span>
			<br>
			<div>
				<input type="radio" name="form" value="line" checked> Line<br>
				<input type="radio" name="form" value="triangle"> Triangle<br>
			</div>
		</div>
	</body>
</html>
