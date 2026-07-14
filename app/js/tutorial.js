(function (global) {
  const STEPS = [
    {
      selector: '#app-header',
      title: 'Willkommen in der EPK-Werkstatt!',
      text: 'Hier lernst du, ereignisgesteuerte Prozessketten (EPK) zu bauen — Schritt für Schritt. Eine EPK zeigt, in welcher Reihenfolge Ereignisse und Tätigkeiten (Funktionen) in einem Prozess ablaufen.'
    },
    {
      selector: '#palette',
      title: 'Die Symbolpalette',
      text: 'Links findest du alle EPK-Normsymbole: Ereignis, Funktion, Konnektoren (UND/ODER/XOR), Prozesswegweiser, Organisationseinheit und Informationsobjekt. Fahr mit der Maus über ein Symbol für eine kurze Erklärung.'
    },
    {
      selector: '[data-symbol="event"]',
      title: 'Schritt 1: Ein Ereignis platzieren',
      text: 'Ziehe das rote Sechseck "Ereignis" per Drag & Drop auf die Zeichenfläche rechts. Jede EPK beginnt mit einem Ereignis, z. B. "Anfrage eingegangen".'
    },
    {
      selector: '[data-symbol="function"]',
      title: 'Schritt 2: Eine Funktion platzieren',
      text: 'Ziehe jetzt das grüne Rechteck "Funktion" darunter auf die Fläche. Funktionen sind Tätigkeiten, z. B. "Anfrage prüfen". Ereignis und Funktion wechseln sich in einer EPK immer ab.'
    },
    {
      selector: '#epk-canvas',
      title: 'Schritt 3: Symbole verbinden',
      text: 'Jedes Symbol hat kleine Punkte (Anschlusspunkte) am Rand. Ziehe vom unteren Punkt eines Symbols zum nächsten, um eine Verbindung (Pfeil) zu erstellen.'
    },
    {
      selector: '#validation-panel',
      title: 'Live-Hinweise',
      text: 'Hier siehst du sofort, wenn etwas gegen die EPK-Regeln verstößt — z. B. wenn zwei Funktionen direkt aufeinanderfolgen. Betroffene Symbole werden rot markiert.'
    },
    {
      selector: '#cheatsheet-toggle',
      title: 'Spickzettel',
      text: 'Falls du eine Regel vergisst: Hier klappst du eine Kurzübersicht aller Symbole und Regeln auf.'
    },
    {
      selector: '#toolbar',
      title: 'Speichern & Exportieren',
      text: 'Deine Arbeit wird automatisch im Browser gespeichert. Über die Toolbar kannst du dein Modell zusätzlich als JSON- oder SVG-Datei exportieren oder eine gespeicherte JSON-Datei wieder laden.'
    },
    {
      selector: '#app-header',
      title: 'Los geht’s!',
      text: 'Das war die Kurztour. Im Leitfaden (docs/leitfaden-azubis.md) findest du Übungsbeispiele zum Nachbauen. Viel Erfolg beim Modellieren!'
    }
  ];

  class Tutorial {
    constructor() {
      this.index = 0;
      this.overlay = null;
    }

    start() {
      this.index = 0;
      this._buildOverlay();
      this._showStep();
    }

    _buildOverlay() {
      this._teardown();
      this.overlay = document.createElement('div');
      this.overlay.className = 'tutorial-overlay';

      this.frameTop = document.createElement('div');
      this.frameBottom = document.createElement('div');
      this.frameLeft = document.createElement('div');
      this.frameRight = document.createElement('div');
      [this.frameTop, this.frameBottom, this.frameLeft, this.frameRight].forEach((f) => {
        f.className = 'tutorial-frame';
        this.overlay.appendChild(f);
      });

      this.ring = document.createElement('div');
      this.ring.className = 'tutorial-ring';
      this.overlay.appendChild(this.ring);

      this.tooltip = document.createElement('div');
      this.tooltip.className = 'tutorial-tooltip';
      this.tooltip.innerHTML = `
        <div class="tutorial-progress"></div>
        <h3 class="tutorial-title"></h3>
        <p class="tutorial-text"></p>
        <div class="tutorial-actions">
          <button type="button" class="tutorial-skip">Tour beenden</button>
          <div class="tutorial-nav">
            <button type="button" class="tutorial-back">Zurück</button>
            <button type="button" class="tutorial-next">Weiter</button>
          </div>
        </div>`;
      this.overlay.appendChild(this.tooltip);

      this.tooltip.querySelector('.tutorial-skip').addEventListener('click', () => this._teardown());
      this.tooltip.querySelector('.tutorial-back').addEventListener('click', () => this._go(-1));
      this.tooltip.querySelector('.tutorial-next').addEventListener('click', () => this._go(1));

      document.body.appendChild(this.overlay);
      this._onResize = () => this._positionForCurrentStep();
      window.addEventListener('resize', this._onResize);
    }

    _go(delta) {
      const next = this.index + delta;
      if (next < 0) return;
      if (next >= STEPS.length) { this._teardown(); return; }
      this.index = next;
      this._showStep();
    }

    _showStep() {
      const step = STEPS[this.index];
      this.tooltip.querySelector('.tutorial-progress').textContent = `Schritt ${this.index + 1} / ${STEPS.length}`;
      this.tooltip.querySelector('.tutorial-title').textContent = step.title;
      this.tooltip.querySelector('.tutorial-text').textContent = step.text;
      this.tooltip.querySelector('.tutorial-back').disabled = this.index === 0;
      this.tooltip.querySelector('.tutorial-next').textContent = this.index === STEPS.length - 1 ? 'Fertig' : 'Weiter';
      this._positionForCurrentStep();
    }

    _positionForCurrentStep() {
      const step = STEPS[this.index];
      const target = document.querySelector(step.selector);
      const rect = target ? target.getBoundingClientRect() : { top: 20, left: 20, width: 200, height: 60, right: 220, bottom: 80 };
      const pad = 8;

      this.ring.style.top = (rect.top - pad) + 'px';
      this.ring.style.left = (rect.left - pad) + 'px';
      this.ring.style.width = (rect.width + pad * 2) + 'px';
      this.ring.style.height = (rect.height + pad * 2) + 'px';

      this.frameTop.style.cssText = `top:0; left:0; right:0; height:${Math.max(rect.top - pad, 0)}px;`;
      this.frameBottom.style.cssText = `top:${rect.bottom + pad}px; left:0; right:0; bottom:0;`;
      this.frameLeft.style.cssText = `top:${Math.max(rect.top - pad, 0)}px; left:0; width:${Math.max(rect.left - pad, 0)}px; height:${rect.height + pad * 2}px;`;
      this.frameRight.style.cssText = `top:${Math.max(rect.top - pad, 0)}px; left:${rect.right + pad}px; right:0; height:${rect.height + pad * 2}px;`;

      const spaceBelow = window.innerHeight - rect.bottom;
      const tooltipTop = spaceBelow > 220 ? rect.bottom + 20 : Math.max(rect.top - 200, 12);
      let tooltipLeft = rect.left;
      const maxLeft = window.innerWidth - 340;
      tooltipLeft = Math.min(Math.max(tooltipLeft, 12), Math.max(maxLeft, 12));

      this.tooltip.style.top = tooltipTop + 'px';
      this.tooltip.style.left = tooltipLeft + 'px';
    }

    _teardown() {
      if (this.overlay) {
        window.removeEventListener('resize', this._onResize);
        this.overlay.remove();
        this.overlay = null;
      }
      EPK.Storage.markTutorialRun();
    }
  }

  global.EPK = global.EPK || {};
  global.EPK.Tutorial = Tutorial;
})(window);
