(function (global) {
  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  const Symbols = {
    event: {
      key: 'event',
      label: 'Ereignis',
      shortDesc: 'Ein eingetretener Zustand, der den Ablauf auslöst. Trifft selbst keine Entscheidung.',
      color: '#e8583a',
      stroke: '#9c3a24',
      textColor: '#ffffff',
      width: 140,
      height: 72,
      controlFlow: true,
      handles: { top: true, bottom: true, side: false },
      shape(w, h) {
        const points = [
          [-w / 2 + 18, -h / 2], [w / 2 - 18, -h / 2], [w / 2, 0],
          [w / 2 - 18, h / 2], [-w / 2 + 18, h / 2], [-w / 2, 0]
        ].map((p) => p.join(',')).join(' ');
        return el('polygon', { points, fill: this.color, stroke: this.stroke, 'stroke-width': 2 });
      }
    },
    function: {
      key: 'function',
      label: 'Funktion',
      shortDesc: 'Eine Tätigkeit, die ausgeführt wird. Kann den Ablauf verzweigen.',
      color: '#3fa34d',
      stroke: '#256b30',
      textColor: '#ffffff',
      width: 140,
      height: 64,
      controlFlow: true,
      handles: { top: true, bottom: true, side: 'left' },
      shape(w, h) {
        return el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 16, ry: 16, fill: this.color, stroke: this.stroke, 'stroke-width': 2 });
      }
    },
    and: {
      key: 'and',
      label: 'UND-Konnektor',
      symbolChar: '∧',
      shortDesc: 'Alle ausgehenden Zweige laufen parallel und zwingend. Darf direkt nach einem Ereignis stehen.',
      color: '#f2c14e',
      stroke: '#8a6d00',
      textColor: '#3a2e00',
      width: 46,
      height: 46,
      controlFlow: true,
      handles: { top: true, bottom: true, side: false },
      shape(w) { return el('circle', { cx: 0, cy: 0, r: w / 2, fill: this.color, stroke: this.stroke, 'stroke-width': 2 }); }
    },
    or: {
      key: 'or',
      label: 'ODER-Konnektor',
      symbolChar: '∨',
      shortDesc: 'Mindestens einer der ausgehenden Zweige wird ausgeführt. Nur nach einer Funktion erlaubt.',
      color: '#f2c14e',
      stroke: '#8a6d00',
      textColor: '#3a2e00',
      width: 46,
      height: 46,
      controlFlow: true,
      handles: { top: true, bottom: true, side: false },
      shape(w) { return el('circle', { cx: 0, cy: 0, r: w / 2, fill: this.color, stroke: this.stroke, 'stroke-width': 2 }); }
    },
    xor: {
      key: 'xor',
      label: 'XOR-Konnektor',
      symbolChar: '×',
      shortDesc: 'Genau einer der ausgehenden Zweige wird ausgeführt. Nur nach einer Funktion erlaubt.',
      color: '#f2c14e',
      stroke: '#8a6d00',
      textColor: '#3a2e00',
      width: 46,
      height: 46,
      controlFlow: true,
      handles: { top: true, bottom: true, side: false },
      shape(w) { return el('circle', { cx: 0, cy: 0, r: w / 2, fill: this.color, stroke: this.stroke, 'stroke-width': 2 }); }
    },
    process_interface: {
      key: 'process_interface',
      label: 'Prozesswegweiser',
      shortDesc: 'Verweist auf einen anderen (Teil-)Prozess. Darf Start oder Ende einer EPK sein.',
      color: '#2f8fd1',
      stroke: '#195e8a',
      textColor: '#ffffff',
      width: 130,
      height: 60,
      controlFlow: true,
      handles: { top: true, bottom: true, side: false },
      shape(w, h) {
        const points = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h * 0.15], [0, h / 2], [-w / 2, h * 0.15]]
          .map((p) => p.join(',')).join(' ');
        return el('polygon', { points, fill: this.color, stroke: this.stroke, 'stroke-width': 2 });
      }
    },
    org_unit: {
      key: 'org_unit',
      label: 'Organisationseinheit',
      shortDesc: 'Wer die Funktion ausführt (Person, Rolle, Abteilung). Wird seitlich an eine Funktion angebunden.',
      color: '#f2c14e',
      stroke: '#8a6d00',
      textColor: '#3a2e00',
      width: 120,
      height: 52,
      controlFlow: false,
      handles: { top: false, bottom: false, side: 'right' },
      shape(w, h) { return el('ellipse', { cx: 0, cy: 0, rx: w / 2, ry: h / 2, fill: this.color, stroke: this.stroke, 'stroke-width': 2 }); }
    },
    info_object: {
      key: 'info_object',
      label: 'Informationsobjekt',
      shortDesc: 'Daten/Dokumente, die eine Funktion braucht oder erzeugt. Wird seitlich an eine Funktion angebunden.',
      color: '#7fb3e8',
      stroke: '#2f6ea3',
      textColor: '#0b3358',
      width: 120,
      height: 52,
      controlFlow: false,
      handles: { top: false, bottom: false, side: 'right' },
      shape(w, h) { return el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, fill: this.color, stroke: this.stroke, 'stroke-width': 2 }); }
    }
  };

  global.EPK = global.EPK || {};
  global.EPK.Symbols = Symbols;
  global.EPK.SVG_NS = NS;
  global.EPK.svgEl = el;
})(window);
