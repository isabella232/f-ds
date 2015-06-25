var pie = new d3pie("pie", {
  "footer": {
    "color": "#999999",
    "fontSize": 10,
    "font": "open sans",
    "location": "bottom-left"
  },
  "size": {
    "canvasWidth": 270,
    "canvasHeight":250,
    "pieOuterRadius": "90%"
  },
  "data": {
    "sortOrder": "value-desc",
    "content": [
      {
        "label": "A",
        "value": window.answer1,
        "color": "#4099FF"
      },
      {
        "label": "B",
        "value": window.answer2,
        "color": "#93FF48"
      },
      {
        "label": "C",
        "value": window.answer3,
        "color": "#FFB756"
      },
      {
        "label": "D",
        "value": window.answer4,
        "color": "#FD6547"
      },
      {
        "label": "E",
        "value": window.answer5,
        "color": "#C24BFF"
      }
    ]
  },
  "labels": {
    "outer": {
      "pieDistance": 32
    },
    "inner": {
      "hideWhenLessThanPercentage": 3
    },
    "mainLabel": {
      "fontSize": 15
    },
    "percentage": {
      "color": "#ffffff",
      "decimalPlaces": 0
    },
    "value": {
      "color": "#adadad",
      "fontSize": 11
    },
    "lines": {
      "enabled": true
    },
    "truncation": {
      "enabled": true
    }
  },
  "effects": {
    "pullOutSegmentOnClick": {
      "effect": "linear",
      "speed": 400,
      "size": 8
    }
  }
});
