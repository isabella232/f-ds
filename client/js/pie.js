var d3pie = require('../lib/d3pie.min')

if (!$('#pie').get(0)) { return }

var pie = new d3pie("pie", {
  "footer": {
    "color": "#999999",
    "fontSize": 10,
    "font": "open sans",
    "location": "bottom-left"
  },
  "size": {
    "canvasWidth": 270,
    "canvasHeight": 250,
    "pieOuterRadius": "90%"
  },
  "data": {
    "sortOrder": "value-desc",
    "content": [
      {
        "label": "A",
        "value": window.answer1,
        "color": "#283a90"
      },
      {
        "label": "B",
        "value": window.answer2,
        "color": "#d7821e"
      },
      {
        "label": "C",
        "value": window.answer3,
        "color": "#6d54b6"
      },
      {
        "label": "D",
        "value": window.answer4,
        "color": "#32a779"
      },
      {
        "label": "E",
        "value": window.answer5,
        "color": "#c4606a"
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
