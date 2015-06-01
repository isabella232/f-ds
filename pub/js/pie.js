var pie = new d3pie("pie", {
  "footer": {
    "color": "#999999",
    "fontSize": 10,
    "font": "open sans",
    "location": "bottom-left"
  },
  "size": {
    "canvasWidth": 250,
    "canvasHeight":250,
    "pieOuterRadius": "90%"
  },
  "data": {
    "sortOrder": "value-desc",
    "content": [
      {
        "label": "A",
        "value": window.answer1,
        "color": "#2484c1"
      },
      {
        "label": "B",
        "value": window.answer2,
        "color": "#0c6197"
      },
      {
        "label": "C",
        "value": window.answer3,
        "color": "#4daa4b"
      },
      {
        "label": "D",
        "value": window.answer4,
        "color": "#90c469"
      },
      {
        "label": "E",
        "value": window.answer5,
        "color": "#daca61"
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