function falling($ionicPopup) {
  // Matter aliases
  var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Render = Matter.Render,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint;


  var Demo = {};

  var gc = 0,
    obs = 1,
    score = 0;

  var _engine,
    wBounds,
    _sceneWidth,
    _sceneHeight,
    _deviceOrientationEvent;

  var _sceneWidth = document.documentElement.clientWidth;
  var _sceneHeight = document.documentElement.clientHeight;

  var canvas = document.getElementById('main-canvas');
  var scale = _sceneWidth / 375;


  Demo.create = function (options) {
    var defaults = {
      isManual: false,
      sceneName: 'mixed',
      sceneEvents: []
    };

    return Common.extend(defaults, options);
  };

  var demo = Demo.create();

  Demo.init = function () {

    var options = {
      positionIterations: 6,
      velocityIterations: 4,
      enableSleeping: false,
      metrics: {
        extended: true
      }
    };

    // create an example engine (see /examples/engine.js)
    demo.engine = Engine.create(options);

    // run the engine
    demo.runner = Engine.run(demo.engine);

    // create a debug renderer
    demo.render = Render.create({
      canvas: canvas,
      engine: demo.engine
    });

    var renderOptions = demo.render.options;
    renderOptions.wireframes = false;
    renderOptions.hasBounds = false;
    renderOptions.showDebug = false;
    renderOptions.showBroadphase = false;
    renderOptions.showBounds = false;
    renderOptions.showVelocity = false;
    renderOptions.showCollisions = false;
    renderOptions.showAxes = false;
    renderOptions.showPositions = false;
    renderOptions.showAngleIndicator = false;
    renderOptions.showIds = false;
    renderOptions.showShadows = false;
    renderOptions.showVertexNumbers = false;
    renderOptions.showConvexHulls = false;
    renderOptions.showInternalEdges = false;
    renderOptions.showSeparations = false;
    renderOptions.background = '#fff';


    // run the renderer
    Render.run(demo.render);

    _engine = demo.engine;

    setTimeout(function () {
      if (navigator.accelerometer) {
        var watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
          Demo.updateGravityFromAcceleration(acceleration);
        }, null, {
          frequency: 20
        });
      } else {
        console.log("Device orientation");
        window.addEventListener('deviceorientation', function (event) {
          _deviceOrientationEvent = event;
          Demo.updateGravity(event);
        }, true);
      }
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

    var ball = Bodies.circle(_sceneWidth / 2, _sceneHeight / 2, 25 * scale, {
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

    canvas.onclick = ball.invertColor;

    Matter.Events.on(_engine, 'collisionEnd', function (e) {
      var p = [e.pairs[0].bodyA, e.pairs[0].bodyB];
      var i = p.indexOf(ball);
      var o = p[(i + 1) % p.length];
      if (i != -1) {
        if (ball.render.fillStyle == o.render.fillStyle) {
          World.remove(_world, o);
          addObstacles(ball);
        } else if (o.render.fillStyle == '#000000' || o.render.fillStyle == '#ff9000') {
          World.remove(_world, ball);
          $ionicPopup.alert({
            title: 'Game Over',
            okText: 'Score: ' + (score * 2 - gc - 1)
          }).then(function () {
            window.location.reload();
          });

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
      renderOptions = demo.render.options,
      canvas = demo.render.canvas;

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

    var s = 20 * scale;
    wBounds = [
      Bodies.rectangle(_sceneWidth * 0.5, -1 * scale, _sceneWidth, s, {
        isStatic: true
      }),
      Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + 1 * scale, _sceneWidth, s, {
        isStatic: true
      }),
      Bodies.rectangle(_sceneWidth + 1 * scale, _sceneHeight * 0.5, s, _sceneHeight, {
        isStatic: true
      }),
      Bodies.rectangle(-1 * scale, _sceneHeight * 0.5, s, _sceneHeight, {
        isStatic: true
      })
    ];

    for (var i = 0; i < wBounds.length; i++) {
      wBounds[i].render.strokeStyle = "rgba(0,0,0,0)";
      wBounds[i].render.fillStyle = "rgba(0,0,0,0)";
      World.addBody(_world, wBounds[i]);
    }
  };

  Demo.init();

  function addObstacles(ball) {

    obs--;
    gc--;

    if (gc <= 0) {
      if (!score) {
        score = 1;
      } else {
        score = score * 2;
      }
      gc = score;
    }

    var half = _sceneHeight / 2;
    var x, y;

    while (obs < score) {
      while (!x || !y) {
        x = Math.random() * (_sceneWidth - 100 * scale);
        y = Math.random() * (_sceneHeight - 100 * scale);
        if (Math.sqrt(Math.pow(x - ball.position.x, 2) + Math.pow(y - ball.position.y, 2)) < 150 * scale) {
          x = undefined;
          y = undefined;
        }
      }

      var poly = Bodies.polygon(x + 50, y + 50, 3, 25 * scale, {
        isStatic: true,
      });

      var color = gc == score ? '#ff9000' : '#000000';
      poly.render.fillStyle = color;
      poly.render.strokeStyle = color;
      Matter.Body.setAngle(poly, 2 * Math.PI * Math.random());

      World.add(_engine.world, poly);
      obs++;

      x = undefined;
      y = undefined;
    }


  }

}
