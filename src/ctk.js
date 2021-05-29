/**
 * A drawing library for the HTML 5 canvas element that follows the Graphics library in the JDK.
 * @author Tony Okorodudu
 */
const ctk = {
  /**
   * Constructs a new Rectangle whose upper-left corner is specified as (x,y) and whose width
   * and height are specified by the arguments of the same name
   * @param {Number} x  the specified X coordinate
   * @param {Number} y  the specified Y coordinate
   * @param {Number} width  the width of the Rectangle
   * @param {Number} height  the height of the Rectangle
   */
  Rectangle: function (x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;

    /**
     * Create a clone of this rectangle
     * @returns {ctk.Rectangle}  A clone of this rectangle
     */
    this.clone = function () {
      return new ctk.Rectangle(this.x, this.y, this.width, this.height);
    };

    /**
     * Set the location for the rectangle
     * @param {Number} x  the specified X coordinate
     * @param {Number} y  the specified Y coordinate
     */
    this.setLocation = function (x, y) {
      this.x = x;
      this.y = y;
    };

    /**
     * Check if this rectangle contains the given x/y coordinate
     * @param {Number} x  the specified X coordinate
     * @param {Number} y  the specified Y coordinate
     * @returns {Boolean} true if the rectangle contains the coordinate and false if otherwise
     */
    this.containsPoint = function (x, y) {
      return (
        this.x <= x &&
        this.x + this.width >= x &&
        this.y <= y &&
        this.y + this.height >= y
      );
    };

    /**
     * Checks whether this Rectangle entirely contains the Rectangle  at the specified location with the specified dimensions
     * @param {Number} x  the specified X coordinate
     * @param {Number} y  the specified Y coordinate
     * @param {Number} width  the width of the rectangle
     * @param {Number} height  the height of the rectangle
     * @returns {Boolean} true if the rectangle specified is entirely enclosed inside this rectangle; false otherwise.
     */
    this.containsBounds = function (x, y, width, height) {
      return (
        this.x <= x &&
        x + width <= this.x + this.width &&
        this.y <= y &&
        y + height <= this.y + this.height
      );
    };
  },

  /**
   * Construct a new graphics object.
   * @param {HTMLElement} canvas  A reference to the canvas DOM element
   */
  FontMetrics: function (context) {
    /**
     * Returns the total width for showing the specified String in this Font
     * @param {String} str  the String to be measured
     * @returns {Number} the width of the specified String
     */
    this.stringWidth = function (str) {
      return context.measureText ? context.measureText(str).width : 0;
    };
  },

  /**
   * Construct a new graphics object.
   * @param {HTMLElement} canvas  A reference to the canvas DOM element
   */
  Graphics: function (canvas) {
    var _canvas =
      typeof canvas === "string" ? document.getElementById(canvas) : canvas;
    var _context = _canvas.getContext("2d");
    var _origin = new ctk.Rectangle(0, 0);
    var _fontMetrics = new ctk.FontMetrics(_context);

    /**
     * Get the underlying canvas
     * @returns {HTMLElement}  this object's underlying canvas
     */
    this.getCanvas = function () {
      return _canvas;
    };

    /**
     * Get the graphic's context
     * @returns {Context}  the font metrics of this graphics context's current font
     */
    this.getContext = function () {
      return _context;
    };

    /**
     *  Gets the font metrics of the current font
     * @returns {ctk.FontMetrics}  this object's graphic's context
     */
    this.getFontMetrics = function () {
      return _fontMetrics;
    };

    /**
     * Get the width of the canvas
     * @returns {Number}  The width of the canvas
     */
    this.getWidth = function () {
      return _canvas.width;
    };

    /**
     * Get the height of the canvas
     * @returns {Number}  The height of the canvas
     */
    this.getHeight = function () {
      return _canvas.height;
    };

    /**
     * Creates a new Graphics object based on this Graphics object, but with a new translation and clip area
     * @param {Number} x  the x coordinate
     * @param {Number} y  the y coordinate
     * @param {Number} width  the width of the clipping rectangle
     * @param {Number} height  the height of the clipping rectangle
     * @returns {ctk.Graphics}  a new graphics context
     */
    this.create = function (x, y, width, height) {
      var copy = new ctk.Graphics(_canvas);

      if (x !== undefined && x !== null && y !== undefined && y !== null) {
        copy.translate(x, y);
      }

      return copy;
    };

    /**
     * Sets this graphics context's current color to the specified color.
     * @param {String} color  the new rendering color
     */
    this.setColor = function (color) {
      _context.fillStyle = color;
    };

    /**
     * Gets this graphics context's current color.
     * @returns {String}  this graphics context's current color
     */
    this.getColor = function () {
      return _context.fillStyle;
    };

    /**
     * Sets this graphics context's current stroke color to the specified color.
     * @param {String} color  the new rendering stroke color
     */
    this.setStrokeColor = function (color) {
      _context.strokeStyle = color;
    };

    /**
     * Gets this graphics context's current stroke color.
     * @returns {String}  this graphics context's current stroke color
     */
    this.getStrokeColor = function () {
      return _context.strokeStyle;
    };

    /**
     * Sets this graphics context's line width.
     * @param {Number} width  the line width
     */
    this.setLineWidth = function (width) {
      _context.lineWidth = width;
    };

    /**
     * Gets this graphics context's line width.
     * @returns {Number}  this graphics context's current line width
     */
    this.getLineWidth = function () {
      return _context.lineWidth;
    };

    function createCirclePath(x, y, radius) {
      _context.beginPath();
      _context.arc(
        _origin.x + x + radius,
        _origin.y + y + radius,
        radius,
        0,
        Math.PI * 2,
        true
      );
      _context.closePath();
    }

    function createEllipsePath(x, y, width, height) {
      if (width === height) {
        createCirclePath(x, y, width / 2);
      } else {
        var w = width / 2;
        var h = height / 2;
        var C = 0.5522847498307933;
        var c_x = C * w;
        var c_y = C * h;
        x = _origin.x + x + w;
        y = _origin.y + y + h;
        _context.beginPath();
        _context.moveTo(x + w, y);
        _context.bezierCurveTo(x + w, y - c_y, x + c_x, y - h, x, y - h);
        _context.bezierCurveTo(x - c_x, y - h, x - w, y - c_y, x - w, y);
        _context.bezierCurveTo(x - w, y + c_y, x - c_x, y + h, x, y + h);
        _context.bezierCurveTo(x + c_x, y + h, x + w, y + c_y, x + w, y);
        _context.closePath();
      }
    }

    function createPolygonPath(xPoints, yPoints, nPoints) {
      _context.beginPath();

      if (xPoints !== null && yPoints !== null) {
        var numberOfPoints = Math.min(
          nPoints,
          Math.min(xPoints.length, yPoints.length)
        );

        if (numberOfPoints > 0) {
          for (var i = 0; i < nPoints && i < numberOfPoints; i++) {
            var x = _origin.x + xPoints[i];
            var y = _origin.y + yPoints[i];

            if (i === 0) {
              _context.moveTo(x, y);
            } else {
              _context.lineTo(x, y);
            }
          }
        }
      }
    }

    /**
     * Draws the text given by the specified string, using this graphics context's current font and color
     * @param {String} str the string to be drawn
     * @param {Number} x  the x coordinate of the rectangle to intersect the clip with
     * @param {Number} y  the y coordinate of the rectangle to intersect the clip with
     * @param {Number} maxWidth  Optional; the maximum width to draw
     */
    this.drawString = function (str, x, y, maxWidth) {
      if (_context.fillText) {
        if (!maxWidth) {
          _context.fillText(str, x, y);
        } else {
          _context.fillText(str, x, y, maxWidth);
        }
      }
    };

    /**
     * Draws the text given by the specified string, using this graphics context's current font and color
     * @param {String} image  The specified image to be drawn. This method does nothing if img is null
     * @param {Number} x  the x coordinate
     * @param {Number} y  the y coordinate
     * @param {Number} width  the width of the rectangle
     * @param {Number} height  the height of the rectangle
     * @param {Number} sx  the x coordinate of the first corner of the source rectangle
     * @param {Number} sy  the y coordinate of the first corner of the source rectangle
     * @param {Number} sWidth  the width of the source rectangle
     * @param {Number} sHeight  the height of the source rectangle
     */
    this.drawImage = function (
      image,
      x,
      y,
      width,
      height,
      sx,
      sy,
      sWidth,
      sHeight
    ) {
      if (image) {
        var imgObject = null;
        if (typeof image === "string") {
          imgObject = new Image();
          imgObject.src = image;
        } else {
          imgObject = image;
        }

        if (sWidth && sHeight) {
          _context.drawImage(
            imgObject,
            sx,
            sy,
            sWidth,
            sHeight,
            x,
            y,
            width,
            height
          );
        } else if (width && height) {
          _context.drawImage(imgObject, x, y, width, height);
        } else {
          _context.drawImage(imgObject, x, y);
        }
      }
    };

    /**
     * Intersects the current clip with the specified rectangle
     * @param {Number} x  the x coordinate of the rectangle to intersect the clip with
     * @param {Number} y  the y coordinate of the rectangle to intersect the clip with
     * @param {Number} width  the width of the rectangle to intersect the clip with
     * @param {Number} height  the height of the rectangle to intersect the clip with
     */
    this.clipRect = function (x, y, width, height) {};

    /**
     * Fills the specified rectangle
     * @param {Number} x  the x coordinate of the rectangle to be filled
     * @param {Number} y   the y coordinate of the rectangle to be filled
     * @param {Number} width  the width of the rectangle to be filled
     * @param {Number} height  the height of the rectangle to be filled
     */
    this.fillRect = function (x, y, width, height) {
      _context.fillRect(_origin.x + x, _origin.y + y, width, height);
    };

    /**
     * Clears the specified rectangle by filling it with the background color of the current drawing surface
     * @param {Number} x  the x coordinate of the rectangle to clear
     * @param {Number} y   the y coordinate of the rectangle to clear
     * @param {Number} width  the width of the rectangle to clear
     * @param {Number} height  the height of the rectangle to clear
     */
    this.clearRect = function (x, y, width, height) {
      _context.clearRect(x, y, width, height);
    };

    /**
     * Clears the specified rectangle by filling it with the background color of the current drawing surface
     * @param {Number} x  the x coordinate of the rectangle to clear
     * @param {Number} y   the y coordinate of the rectangle to clear
     * @param {Number} width  the width of the rectangle to clear
     * @param {Number} height  the height of the rectangle to clear
     */
    this.clear = function () {
      _context.clearRect(0, 0, this.getWidth(), this.getHeight());
    };

    /**
     * Draws the outline of the specified rectangle.
     * @param {Number} x  the x coordinate of the rectangle to be drawn
     * @param {Number} y   the y coordinate of the rectangle to be drawn
     * @param {Number} width  the width of the rectangle to be drawn
     * @param {Number} height  the height of the rectangle to be drawn
     */
    this.drawRect = function (x, y, width, height) {
      _context.strokeRect(_origin.x + x, _origin.y + y, width, height);
    };

    /**
     * Fills a circle bounded by the specified rectangle with the current color
     * @param {Number} x  the x coordinate of the upper left corner of the circle to be filled
     * @param {Number} y  the y coordinate of the upper left corner of the circle to be filled
     * @param {Number} radius  the radius of the circle to be filled
     */
    this.fillCircle = function (x, y, radius) {
      createCirclePath(x, y, radius);
      _context.fill();
    };

    /**
     * Draws the outline of a circle
     * @param {Number} x  the x coordinate of the upper left corner of the circle to be drawn
     * @param {Number} y  the y coordinate of the upper left corner of the circle to be drawn
     * @param {Number} radius  the radius of the circle to be drawn
     */
    this.drawCircle = function (x, y, radius) {
      createCirclePath(x, y, radius);
      _context.stroke();
    };

    /**
     * Fills a ellipse bounded by the specified rectangle with the current color
     * @param {Number} x  the x coordinate of the upper left corner of the circle to be filled
     * @param {Number} y  the y coordinate of the upper left corner of the circle to be filled
     * @param {Number} width  the width of the ellipse to be drawn
     * @param {Number} height  the height of the ellipse to be drawn
     */
    this.fillEllipse = function (x, y, width, height) {
      createEllipsePath(x, y, width, height);
      _context.fill();
    };

    /**
     * Draws the outline of a ellipse
     * @param {Number} x  the x coordinate of the upper left corner of the circle to be drawn
     * @param {Number} y  the y coordinate of the upper left corner of the circle to be drawn
     * @param {Number} radius  the radius of the circle to be drawn
     */
    this.drawEllipse = function (x, y, width, height) {
      createEllipsePath(x, y, width, height);
      _context.stroke();
    };

    /**
     * Draws a line, using the current color, between the points (x1, y1) and (x2, y2) in this graphics context's coordinate system
     * @param {Number} x1  the first point's x coordinate
     * @param {Number} y1  he first point's y coordinate
     * @param {Number} x2  the second point's x coordinate
     * @param {Number} y2  the second point's y coordinate
     */
    this.drawLine = function (x1, y1, x2, y2) {
      _context.beginPath();
      _context.moveTo(_origin.x + x1, _origin.y + y1);
      _context.lineTo(_origin.x + x2, _origin.y + y2);
      _context.stroke();
    };

    /**
     * Draws a closed polygon defined by arrays of x and y coordinates
     * @param {Array} xPoints  an array of x coordinates
     * @param {Array} yPoints  an array of y coordinates
     * @param {Number} nPoints  the total number of points
     */
    this.drawPolygon = function (xPoints, yPoints, nPoints) {
      if (nPoints > 0 && xPoints !== null && yPoints !== null) {
        createPolygonPath(xPoints, yPoints, nPoints);
        _context.stroke();
      }
    };

    /**
     * Fills a closed polygon defined by arrays of x and y coordinates
     * @param {Array} xPoints  an array of x coordinates
     * @param {Array} yPoints  an array of y coordinates
     * @param {Number} nPoints  the total number of points
     */
    this.fillPolygon = function (xPoints, yPoints, nPoints) {
      if (nPoints > 0 && xPoints !== null && yPoints !== null) {
        createPolygonPath(xPoints, yPoints, nPoints);
        _context.fill();
      }
    };

    /**
     * Translates the origin of the graphics context to the point (x, y) in the current coordinate system
     * @param {Number} x  the x coordinate
     * @param {Number} y  the y coordinate
     */
    this.translate = function (x, y) {
      _origin.x = x;
      _origin.y = y;
    };
  },
};

export default ctk;
