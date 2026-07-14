(function (global) {
  let uidCounter = 1;
  function nextId(prefix) {
    return prefix + '-' + (uidCounter++) + '-' + Math.random().toString(36).slice(2, 7);
  }

  const ARTICLES = {
    m: { nom: 'ein', dat: 'einem', akk: 'einen' },
    f: { nom: 'eine', dat: 'einer', akk: 'eine' },
    n: { nom: 'ein', dat: 'einem', akk: 'ein' }
  };
  function withArticle(typeKey, kasus) {
    const def = EPK.Symbols[typeKey];
    return `${ARTICLES[def.genus][kasus]} ${def.label}`;
  }

  const CONNECTOR_TYPES = ['and', 'or', 'xor'];

  class Model {
    constructor() {
      this.nodes = new Map();
      this.edges = [];
      this.sideEdges = [];
    }

    addNode(type, x, y, label) {
      const def = EPK.Symbols[type];
      if (!def) throw new Error('Unbekannter Symboltyp: ' + type);
      const id = nextId('n');
      const node = { id, type, x, y, label: label || def.label };
      this.nodes.set(id, node);
      return node;
    }

    removeNode(id) {
      this.nodes.delete(id);
      this.edges = this.edges.filter((e) => e.from !== id && e.to !== id);
      this.sideEdges = this.sideEdges.filter((e) => e.from !== id && e.to !== id);
    }

    updateNodePosition(id, x, y) {
      const n = this.nodes.get(id);
      if (n) { n.x = x; n.y = y; }
    }

    renameNode(id, label) {
      const n = this.nodes.get(id);
      if (n) n.label = label;
    }

    addEdge(fromId, toId) {
      if (fromId === toId) return null;
      if (this.edges.some((e) => e.from === fromId && e.to === toId)) return null;
      const edge = { id: nextId('e'), from: fromId, to: toId };
      this.edges.push(edge);
      return edge;
    }

    addSideEdge(fromId, toId) {
      if (fromId === toId) return null;
      const already = this.sideEdges.some(
        (e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
      );
      if (already) return null;
      const edge = { id: nextId('s'), from: fromId, to: toId };
      this.sideEdges.push(edge);
      return edge;
    }

    removeEdge(id) {
      this.edges = this.edges.filter((e) => e.id !== id);
      this.sideEdges = this.sideEdges.filter((e) => e.id !== id);
    }

    clear() {
      this.nodes.clear();
      this.edges = [];
      this.sideEdges = [];
    }

    toJSON() {
      return {
        nodes: Array.from(this.nodes.values()),
        edges: this.edges,
        sideEdges: this.sideEdges
      };
    }

    fromJSON(data) {
      this.clear();
      (data.nodes || [])
        .filter((n) => EPK.Symbols[n.type])
        .forEach((n) => this.nodes.set(n.id, {
          id: n.id,
          type: n.type,
          x: Number.isFinite(n.x) ? n.x : 100,
          y: Number.isFinite(n.y) ? n.y : 100,
          label: String(n.label || '')
        }));
      const validIds = new Set(this.nodes.keys());
      this.edges = (data.edges || []).filter((e) => validIds.has(e.from) && validIds.has(e.to));
      this.sideEdges = (data.sideEdges || []).filter((e) => validIds.has(e.from) && validIds.has(e.to));

      let maxNum = 0;
      this.nodes.forEach((n) => {
        const m = /-(\d+)-/.exec(n.id);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      });
      uidCounter = Math.max(uidCounter, maxNum + 1);
    }

    // Regeln siehe .claude/skills/epk-notation/SKILL.md — Quelle der Wahrheit für Formulierungen.
    validate() {
      const issues = [];
      const incoming = new Map();
      const outgoing = new Map();
      this.nodes.forEach((n) => { incoming.set(n.id, []); outgoing.set(n.id, []); });

      this.edges.forEach((e) => {
        if (outgoing.has(e.from)) outgoing.get(e.from).push(e);
        if (incoming.has(e.to)) incoming.get(e.to).push(e);
      });

      this.nodes.forEach((n) => {
        const isFlowStartEnd = n.type === 'event' || n.type === 'process_interface';
        const isConnector = CONNECTOR_TYPES.includes(n.type);
        const inCount = incoming.get(n.id).length;
        const outCount = outgoing.get(n.id).length;
        if (inCount === 0 && outCount === 0) return;

        if (inCount === 0 && !isFlowStartEnd) {
          issues.push({
            level: 'error',
            nodeId: n.id,
            message: `"${n.label}": Eine EPK muss mit einem Ereignis oder Prozesswegweiser beginnen, nicht mit ${withArticle(n.type, 'dat')}.`
          });
        }
        if (outCount === 0 && !isFlowStartEnd) {
          issues.push({
            level: 'error',
            nodeId: n.id,
            message: `"${n.label}": Eine EPK muss mit einem Ereignis oder Prozesswegweiser enden, nicht mit ${withArticle(n.type, 'dat')}.`
          });
        }
        if (outCount > 1 && !isConnector) {
          issues.push({
            level: 'error',
            nodeId: n.id,
            message: `"${n.label}": ${withArticle(n.type, 'nom')} verzweigt hier ohne Konnektor in mehrere Richtungen — nutze einen UND-, ODER- oder XOR-Konnektor für Verzweigungen.`
          });
        }
        if (inCount > 1 && !isConnector) {
          issues.push({
            level: 'error',
            nodeId: n.id,
            message: `"${n.label}": Hier laufen mehrere Verbindungen ohne Konnektor zusammen — nutze einen Konnektor zum Zusammenführen.`
          });
        }
      });

      this.edges.forEach((e) => {
        const from = this.nodes.get(e.from);
        const to = this.nodes.get(e.to);
        if (!from || !to) return;

        if (from.type === to.type && (from.type === 'event' || from.type === 'function')) {
          const middleType = from.type === 'event' ? 'function' : 'event';
          issues.push({
            level: 'error',
            edgeId: e.id,
            message: `Zwei ${EPK.Symbols[from.type].label}-Elemente dürfen nicht direkt aufeinanderfolgen — dazwischen fehlt ${withArticle(middleType, 'nom')}.`
          });
        }

        if (from.type === 'event' && (to.type === 'or' || to.type === 'xor')) {
          issues.push({
            level: 'error',
            edgeId: e.id,
            message: `Ereignis "${from.label}" darf nicht über ${withArticle(to.type, 'akk')} verzweigen — Ereignisse treffen keine Entscheidung. Nutze einen UND-Konnektor oder verzweige erst nach einer Funktion.`
          });
        }
      });

      this.sideEdges.forEach((e) => {
        const from = this.nodes.get(e.from);
        const to = this.nodes.get(e.to);
        if (!from || !to) return;
        const sideTypes = ['org_unit', 'info_object'];
        const oneIsFunction = from.type === 'function' || to.type === 'function';
        const oneIsSide = sideTypes.includes(from.type) || sideTypes.includes(to.type);
        if (!(oneIsFunction && oneIsSide)) {
          issues.push({
            level: 'warning',
            edgeId: e.id,
            message: `"${from.label}" und "${to.label}": Organisationseinheiten/Informationsobjekte sollten an eine Funktion angebunden sein.`
          });
        }
      });

      return issues;
    }
  }

  global.EPK = global.EPK || {};
  global.EPK.Model = Model;
})(window);
