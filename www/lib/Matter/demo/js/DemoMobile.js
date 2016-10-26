(function () {

  // Matter aliases
  var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint;

  var Demo = {};

  var _engine,
    _sceneWidth,
    _sceneHeight,
    _deviceOrientationEvent;

  _sceneWidth = document.documentElement.clientWidth;
  _sceneHeight = document.documentElement.clientHeight;

  Demo.init = function () {
    var canvasContainer = document.getElementById('canvas-container');

    _engine = Engine.create(canvasContainer, {
      render: {
        options: {
          wireframes: false,
          showAngleIndicator: false,
          showDebug: false
        }
      }
    });


    setTimeout(function () {
      var runner = Engine.run(_engine);

      // pass through runner as timing for debug rendering
      _engine.metrics.timing = runner;


      Demo.updateScene();
    }, 800);

    if (navigator.acceleromter) {
      alert("Accelerometer! :)");
      var watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
        Demo.updateGravityFromAcceleration(acceleration);
      }, null, {
        frequency: 40
      });
    } else {
      alert("Device orientation :(");
      window.addEventListener('deviceorientation', function (event) {
        _deviceOrientationEvent = event;
        Demo.updateGravity(event);
      }, true);
    }


    window.addEventListener('orientationchange', function () {
      Demo.updateGravity(_deviceOrientationEvent);
      Demo.updateScene();
    }, false);
  };

  window.addEventListener('load', Demo.init);

  Demo.mixed = function () {
    var _world = _engine.world;

    Demo.reset();



    World.add(_world, Bodies.circle(50, 50, 64, {
      friction: 0.01,
      restitution: 0.95
    }));
  };

  Demo.updateScene = function () {
    if (!_engine)
      return;

    _sceneWidth = document.documentElement.clientWidth;
    _sceneHeight = document.documentElement.clientHeight;

    var boundsMax = _engine.world.bounds.max,
      renderOptions = _engine.render.options,
      canvas = _engine.render.canvas;

    boundsMax.x = _sceneWidth;
    boundsMax.y = _sceneHeight;

    canvas.width = renderOptions.width = _sceneWidth;
    canvas.height = renderOptions.height = _sceneHeight;

    Demo.mixed();
  };


  Demo.updateFromAccelerationGravity = function (acceleration) {
    if (!_engine)
      return;

    var gravity = _engine.world.gravity;

    gravity.x = acceleration.x;
    gravity.y = acceleration.y;
  };

  Demo.updateGravity = function (event) {
    if (!_engine)
      return;

    var orientation = window.orientation,
      gravity = _engine.world.gravity;

    if (orientation === 0) {
      gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      gravity.y = Common.clamp(event.beta, -90, 90) / 90;
    } else if (orientation === 180) {
      gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
    } else if (orientation === 90) {
      gravity.x = Common.clamp(event.beta, -90, 90) / 90;
      gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
    } else if (orientation === -90) {
      gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
      gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
    }
    gravity.x = gravity.x * 9.81;
    gravity.y = gravity.y * 9.81;
  };


  Demo.reset = function () {
    var _world = _engine.world;

    Common._seed = 2;

    World.clear(_world);
    Engine.clear(_engine);

    World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, -2, _sceneWidth, 5, {
      isStatic: true
    }));
    World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + 2, _sceneWidth, 5, {
      isStatic: true
    }));
    World.addBody(_world, Bodies.rectangle(_sceneWidth + 2, _sceneHeight * 0.5, 5, _sceneHeight, {
      isStatic: true
    }));
    World.addBody(_world, Bodies.rectangle(-2, _sceneHeight * 0.5, 5, _sceneHeight, {
      isStatic: true
    }));
  };

})();
