(function (name, factory) {
  if (typeof window === "object") {
    window[name] = factory();
  }
})("Ribbons", function () {
  var _w = window,
    _b = document.body,
    _d = document.documentElement;

  var random = function () {
    if (arguments.length === 1) {
      if (Array.isArray(arguments[0])) {
        var index = Math.round(random(0, arguments[0].length - 1));
        return arguments[0][index];
      }
      return random(0, arguments[0]);
    } else if (arguments.length === 2) {
      return Math.random() * (arguments[1] - arguments[0]) + arguments[0];
    } else if (arguments.length === 4) {
      var array = [arguments[0], arguments[1], arguments[2], arguments[3]];
      return array[Math.floor(Math.random() * array.length)];
    }
    return 0;
  };

  var screenInfo = function (e) {
    var width = Math.max(
        0,
        _w.innerWidth || _d.clientWidth || _b.clientWidth || 0
      ),
      height = Math.max(
        0,
        _w.innerHeight || _d.clientHeight || _b.clientHeight || 0
      ),
      scrollx =
        Math.max(0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0) -
        (_d.clientLeft || 0),
      scrolly =
        Math.max(0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0) -
        (_d.clientTop || 0);

    return {
      width,
      height,
      ratio: width / height,
      centerx: width / 2,
      centery: height / 2,
      scrollx,
      scrolly,
    };
  };

  var Point = function (x, y) {
    this.x = 0;
    this.y = 0;
    this.set(x, y);
  };
  Point.prototype = {
    set(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    },
    copy(p) {
      this.x = p.x || 0;
      this.y = p.y || 0;
      return this;
    },
    add(x, y) {
      this.x += x || 0;
      this.y += y || 0;
      return this;
    },
    subtract(x, y) {
      this.x -= x || 0;
      this.y -= y || 0;
      return this;
    },
  };

  var Factory = function (options) {
    this._canvas = null;
    this._context = null;
    this._width = 0;
    this._height = 0;
    this._scroll = 0;
    this._ribbons = [];
    this._options = {
      colorSaturation: "80%",
      colorBrightness: "60%",
      colorAlpha: 0.65,
      colorCycleSpeed: 6,
      verticalPosition: "center",
      horizontalSpeed: 150,
      ribbonCount: 3,
      strokeSize: 0,
      parallaxAmount: -0.5,
      animateSections: true,
    };
    this._onDraw = this._onDraw.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this.setOptions(options);
    this.init();
  };

  Factory.prototype = {
    setOptions(options) {
      if (typeof options === "object") {
        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            this._options[key] = options[key];
          }
        }
      }
    },

    init() {
      try {
        this._canvas = document.createElement("canvas");
        Object.assign(this._canvas.style, {
          display: "block",
          position: "fixed",
          margin: "0",
          padding: "0",
          border: "0",
          outline: "0",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          zIndex: "0",
          pointerEvents: "none",
        });
        this._canvas.className = "ribbon-canvas";
        this._onResize();

        this._context = this._canvas.getContext("2d");
        this._context.clearRect(0, 0, this._width, this._height);
        this._context.globalAlpha = this._options.colorAlpha;

        window.addEventListener("resize", this._onResize);
        window.addEventListener("scroll", this._onScroll);
        document.body.appendChild(this._canvas);
      } catch (e) {
        console.warn("Canvas Context Error: " + e.toString());
        return;
      }

      requestAnimationFrame(this._onDraw);
    },

    addRibbon() {
      const dir = Math.round(random(1, 9)) > 5 ? "right" : "left";
      const hide = 200;
      const min = -hide;
      const max = this._width + hide;
      const startx = dir === "right" ? min : max;

      let starty = Math.round(random(0, this._height));
      if (/^(top|min)$/i.test(this._options.verticalPosition)) {
        starty = 0 + hide;
      } else if (/^(middle|center)$/i.test(this._options.verticalPosition)) {
        starty = this._height / 2;
      } else if (/^(bottom|max)$/i.test(this._options.verticalPosition)) {
        starty = this._height - hide;
      }

      let ribbon = [];
      let point1 = new Point(startx, starty);
      let point2 = new Point(startx, starty);
      let stop = 1000;
      let delay = 0;
      let color = Math.round(random(35, 40));

      while (stop--) {
        const movex = Math.round(
          (Math.random() * 1 - 0.2) * this._options.horizontalSpeed
        );
        const movey = Math.round(
          (Math.random() * 1 - 0.5) * (this._height * 0.25)
        );
        let point3 = new Point();
        point3.copy(point2);

        if (dir === "right") {
          point3.add(movex, movey);
          if (point2.x >= max) break;
        } else {
          point3.subtract(movex, movey);
          if (point2.x <= min) break;
        }

        ribbon.push({
          point1: new Point(point1.x, point1.y),
          point2: new Point(point2.x, point2.y),
          point3,
          color,
          delay,
          dir,
          alpha: 0,
          phase: 0,
        });

        point1.copy(point2);
        point2.copy(point3);
        delay += 4;
      }

      this._ribbons.push(ribbon);
    },

    _drawRibbonSection(section) {
      if (!section) return true;

      if (section.phase >= 1 && section.alpha <= 0) return true;

      if (section.delay <= 0) {
        section.phase += 0.02;
        section.alpha = Math.sin(section.phase);
        section.alpha = Math.max(0, Math.min(1, section.alpha));

        if (this._options.animateSections) {
          let mod = Math.sin(1 + (section.phase * Math.PI) / 2) * 0.1;
          if (section.dir === "right") {
            section.point1.add(mod, 0);
            section.point2.add(mod, 0);
            section.point3.add(mod, 0);
          } else {
            section.point1.subtract(mod, 0);
            section.point2.subtract(mod, 0);
            section.point3.subtract(mod, 0);
          }
          section.point1.add(0, mod);
          section.point2.add(0, mod);
          section.point3.add(0, mod);
        }
      } else {
        section.delay -= 0.5;
      }

      const s = this._options.colorSaturation;
      const l = this._options.colorBrightness;
      const c = `hsla(${section.color}, ${s}, ${l}, ${section.alpha})`;

      this._context.save();
      if (this._options.parallaxAmount !== 0) {
        this._context.translate(0, this._scroll * this._options.parallaxAmount);
      }

      this._context.beginPath();
      this._context.moveTo(section.point1.x, section.point1.y);
      this._context.lineTo(section.point2.x, section.point2.y);
      this._context.lineTo(section.point3.x, section.point3.y);
      this._context.fillStyle = c;
      this._context.fill();

      if (this._options.strokeSize > 0) {
        this._context.lineWidth = this._options.strokeSize;
        this._context.strokeStyle = c;
        this._context.lineCap = "round";
        this._context.stroke();
      }

      this._context.restore();
      return false;
    },

    _onDraw() {
      this._ribbons = this._ribbons.filter(Boolean);
      this._context.clearRect(0, 0, this._width, this._height);

      for (let i = 0; i < this._ribbons.length; i++) {
        const ribbon = this._ribbons[i];
        let done = 0;

        for (let j = 0; j < ribbon.length; j++) {
          if (this._drawRibbonSection(ribbon[j])) {
            done++;
          }
        }

        if (done >= ribbon.length) {
          this._ribbons[i] = null;
        }
      }

      requestAnimationFrame(this._onDraw);
    },

    _onResize(e) {
      const screen = screenInfo(e);
      this._width = screen.width;
      this._height = screen.height;

      if (this._canvas) {
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        if (this._context) {
          this._context.globalAlpha = this._options.colorAlpha;
        }
      }
    },

    _onScroll(e) {
      const screen = screenInfo(e);
      this._scroll = screen.scrolly;
    },

    startManualRibbons(interval = 10000) {
      this.addRibbon(); // First ribbon
      setInterval(() => this.addRibbon(), interval);
    },
  };

  return function RibbonFactory(options) {
    return new Factory(options);
  };
});
