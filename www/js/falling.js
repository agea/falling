function falling() {

  // Matter aliases
  var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint;

  var Demo = {};
  var gc=0,obs = 0;
  var _engine,
    wBounds,
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
      if (navigator.accelerometer) {
        console.log("Accelerometer! :)");
        var watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
          Demo.updateGravityFromAcceleration(acceleration);
        }, null, {
          frequency: 20
        });
      } else {
        console.log("Device orientation :(");
        window.addEventListener('deviceorientation', function (event) {
          _deviceOrientationEvent = event;
          Demo.updateGravity(event);
        }, true);
      }
      var runner = Engine.run(_engine);
      // pass through runner as timing for debug rendering
      _engine.metrics.timing = runner;
      Demo.updateScene();
    }, 800);

    window.addEventListener('orientationchange', function () {
      Demo.updateGravity(_deviceOrientationEvent);
      Demo.updateScene();
    }, false);
  };



  Demo.mixed = function () {
    var _world = _engine.world;

    Demo.reset();

    var ball = Bodies.circle(_sceneWidth / 2, _sceneHeight / 2, 25, {
      friction: 0,
      restitution: 0.75,
      mass: 0.01
    });
    ball.render.fillStyle = '#ff9000';
    ball.render.strokeStyle = '#ff9000';

    ball.invertColor = function () {
      if (ball.render.fillStyle == '#ff9000') {
        ball.render.fillStyle = '#000000';
        ball.render.strokeStyle = '#000000';
      } else {
        ball.render.fillStyle = '#ff9000';
        ball.render.strokeStyle = '#ff9000';
      }
    };

    document.getElementById('canvas-container').onclick = ball.invertColor;

    Matter.Events.on(_engine, 'collisionEnd', function (e) {
      var p = [e.pairs[0].bodyA, e.pairs[0].bodyB];
      var i = p.indexOf(ball);
      var o = p[(i + 1) % p.length];
      if (i != -1) {
        if (ball.render.fillStyle == o.render.fillStyle) {
          World.remove(_world, o);
          addObstacles(ball);
        } else if (o.render.fillStyle == '#000000' || o.render.fillStyle == '#ff9000') {
          alert("Game over");
          window.location.reload();
        }
      }
    });

    addObstacles(ball);

    World.add(_world, ball);
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


  Demo.updateGravityFromAcceleration = function (acceleration) {
    if (!_engine)
      return;

    var gravity = _engine.world.gravity;

    gravity.x = -acceleration.x;
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

    wBounds = [
      Bodies.rectangle(_sceneWidth * 0.5, -1, _sceneWidth, 50, {
        isStatic: true
      }),
      Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + 1, _sceneWidth, 50, {
        isStatic: true
      }),
      Bodies.rectangle(_sceneWidth + 1, _sceneHeight * 0.5, 50, _sceneHeight, {
        isStatic: true
      }),
      Bodies.rectangle(-1, _sceneHeight * 0.5, 50, _sceneHeight, {
        isStatic: true
      })
    ];
    World.addBody(_world, wBounds[0]);
    World.addBody(_world, wBounds[1]);
    World.addBody(_world, wBounds[2]);
    World.addBody(_world, wBounds[3]);
  };

  Demo.init();

  function addObstacles(ball) {
      obs--;
    if (obs-->0)
      return;
    }
    gc++;

    var half = _sceneHeight / 2;
    var x, y;

    var c = 0;

    while (c < gc) {
      while (!x || !y) {
        x = Math.random() * (_sceneWidth - 100);
        y = Math.random() * (_sceneHeight - 100);
        if (Math.sqrt(Math.pow(x - ball.position.x, 2) + Math.pow(y - ball.position.y, 2)) < 100) {
          x = undefined;
          y = undefined;
        }
      }
      var rect = Bodies.rectangle(x + 50, y + 50, 50, 50, {
        isStatic: true
      });

      var color = Math.random() > 0.5 ? '#ff9000' : '#000000';
      rect.render.fillStyle = color;
      rect.render.strokeStyle = color;

      World.add(_engine.world, rect);
      obs++;
      c++;
      x = undefined;
      y = undefined;
    }


  }

}
