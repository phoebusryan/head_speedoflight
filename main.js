(function() {
  var degtorad = Math.PI / 180;
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback){window.setTimeout(callback, 1000 / 60);},
      cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame,
      timer = false,
      timerCounter = 0.0,
      lastTime = new Date().getTime(),
      acceleration = [],
      request_json = false;

  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;

  function startCounter() {
    var nowTime = new Date().getTime();
    timerCounter += ((nowTime-lastTime)/1000);
    $('.timer').html(parseFloat(Math.round( timerCounter * 1000 ) / 1000));
    lastTime = new Date().getTime();
    timer = requestAnimationFrame(startCounter);
  }

  $(function(){
    $('.button').on('vmousedown',function(){

      timerCounter = 0.0;
      $('.timer').html('');
      acceleration = {};
      cancelAnimationFrame(timer);
      request_json = true;
      lastTime = new Date().getTime();
      timer = requestAnimationFrame(startCounter);

    });
    $(document).on('vmouseup',function(){
      request_json = false;
      pX = 0;
      pY = 0;
      pZ = 0;
      
      datapos = [];
      
      for ( var i = 0; i < Object.keys(acceleration).length; i ++ ) {				  
			  _x = acceleration[i].rotation.alpha ? acceleration[i].rotation.alpha  * degtorad : 0;
				_y = acceleration[i].rotation.beta ? acceleration[i].rotation.beta * degtorad : 0;
				_z = acceleration[i].rotation.gamma ? acceleration[i].rotation.gamma * degtorad: 0;
			  
			  gX = acceleration[i].gravity.x;
			  gY = acceleration[i].gravity.y;
			  gZ = acceleration[i].gravity.z;				 
			  
			  cX = Math.cos( _x )*gX;
			  cY = Math.cos( _y )*gY;
			  cZ = Math.cos( _z )*gZ;
			  sX = Math.sin( _x )*gX;
				sY = Math.sin( _y )*gY;
			  sZ = Math.sin( _z )*gZ;
			  
			  pX += cX;
			  pY += cY;
			  pZ += cZ;
			  
			  datapos[i] = { x: pX, y:pY, z:pZ };
			}     
      
      $.ajax({
        url: 'save.php',
        type: 'post',
        data: {json_data: datapos,timer: timerCounter},
        success: function(msg) {}
      });
      cancelAnimationFrame(timer);
    });
    $(window).on('devicemotion',function(e){
      if(request_json)
        acceleration[Object.keys(acceleration).length] = {gravity:event.accelerationIncludingGravity,rotation:event.rotationRate};
      // $('.timer').html('X: '+parseFloat(Math.round(e.accelerationIncludingGravity.x*10)/10)+', Y: '+parseFloat(Math.round(e.accelerationIncludingGravity.y*10)/10)+', Z: '+parseFloat(Math.round(e.accelerationIncludingGravity.z*10)/10));
    });
  });

})();