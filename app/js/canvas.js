(function (global) {
  const NS = EPK.SVG_NS;
  const el = EPK.svgEl;

  class Canvas {
    constructor(svg, model, opts) {
      this.svg = svg;
      this.model = model;
      this.onChange = (opts && opts.onChange) || function () {};
      this.selected = null; // { kind: 'node'|'edge', id }
      this.dragNode = null; // { id, offsetX, offsetY }
      this.connectDrag = null; // { fromId, kind: 'flow'|'side', tempLine }

      this._buildStaticLayers();
      this._bindGlobalEvents();
    }

    _buildStaticLayers() {
      this.svg.innerHTML = '';
      const defs = el('defs', {});
      const marker = el('marker', {
        id: 'epk-arrow', viewBox: '0 0 10 10', refX: '9', refY: '5',
        markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse'
      });
      marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#5b6472' }));
      defs.appendChild(marker);
      this.svg.appendChild(defs);

      this.sideEdgeLayer = el('g', { class: 'layer-side-edges' });
      this.edgeLayer = el('g', { class: 'layer-edges' });
      this.nodeLayer = el('g', { class: 'layer-nodes' });
      this.overlayLayer = el('g', { class: 'layer-overlay' });
      this.svg.appendChild(this.sideEdgeLayer);
      this.svg.appendChild(this.edgeLayer);
      this.svg.appendChild(this.nodeLayer);
      this.svg.appendChild(this.overlayLayer);
    }

    _bindGlobalEvents() {
      this.svg.addEventListener('pointermove', (ev) => this._onPointerMove(ev));
      this.svg.addEventListener('pointerup', (ev) => this._onPointerUp(ev));
      this.svg.addEventListener('pointerdown', (ev) => {
        if (ev.target === this.svg) this._select(null);
      });
      window.addEventListener('keydown', (ev) => {
        if ((ev.key === 'Delete' || ev.key === 'Backspace') && this.selected) {
          const active = document.activeElement;
          if (active && (active.tagName === 'INPUT' || active.isContentEditable)) return;
          ev.preventDefault();
          this._deleteSelected();
        }
        if (ev.key === 'Escape') this._select(null);
      });

      this.svg.addEventListener('dragover', (ev) => ev.preventDefault());
      this.svg.addEventListener('drop', (ev) => {
        ev.preventDefault();
        const type = ev.dataTransfer.getData('text/plain');
        if (!EPK.Symbols[type]) return;
        const pt = this._clientToSvgPoint(ev.clientX, ev.clientY);
        this.model.addNode(type, pt.x, pt.y);
        this._notify();
      });
    }

    placeNodeAtCenter(type) {
      const rect = this.svg.getBoundingClientRect();
      const pt = this._clientToSvgPoint(rect.left + rect.width / 2 + (Math.random() * 80 - 40), rect.top + rect.height / 3 + (Math.random() * 80 - 40));
      this.model.addNode(type, pt.x, pt.y);
      this._notify();
    }

    _clientToSvgPoint(clientX, clientY) {
      const pt = this.svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = this.svg.getScreenCTM();
      if (!ctm) return { x: clientX, y: clientY };
      const p = pt.matrixTransform(ctm.inverse());
      return { x: p.x, y: p.y };
    }

    _notify() {
      this.render();
      this.onChange();
    }

    _select(sel) {
      this.selected = sel;
      this.render();
    }

    _deleteSelected() {
      if (!this.selected) return;
      if (this.selected.kind === 'node') this.model.removeNode(this.selected.id);
      if (this.selected.kind === 'edge') this.model.removeEdge(this.selected.id);
      this.selected = null;
      this._notify();
    }

    render() {
      this.sideEdgeLayer.innerHTML = '';
      this.edgeLayer.innerHTML = '';
      this.nodeLayer.innerHTML = '';
      this.overlayLayer.innerHTML = '';

      const issues = this.model.validate();
      const nodeIssues = new Map();
      const edgeIssues = new Map();
      issues.forEach((issue) => {
        const target = issue.nodeId ? nodeIssues : edgeIssues;
        const key = issue.nodeId || issue.edgeId;
        if (!target.has(key)) target.set(key, []);
        target.get(key).push(issue);
      });

      this.model.sideEdges.forEach((e) => this._renderSideEdge(e, edgeIssues.get(e.id)));
      this.model.edges.forEach((e) => this._renderEdge(e, edgeIssues.get(e.id)));
      this.model.nodes.forEach((n) => this._renderNode(n, nodeIssues.get(n.id)));

      this.lastIssues = issues;
      return issues;
    }

    _worstLevel(issueList) {
      if (!issueList || issueList.length === 0) return null;
      return issueList.some((i) => i.level === 'error') ? 'error' : 'warning';
    }

    _renderNode(node, issueList) {
      const def = EPK.Symbols[node.type];
      const g = el('g', { class: 'epk-node', 'data-id': node.id, transform: `translate(${node.x},${node.y})` });
      if (this.selected && this.selected.kind === 'node' && this.selected.id === node.id) {
        g.classList.add('is-selected');
      }
      const level = this._worstLevel(issueList);
      if (level) g.classList.add('has-' + level);

      const shape = def.shape(def.width, def.height);
      shape.classList.add('epk-shape');
      g.appendChild(shape);

      if (def.symbolChar) {
        const charText = el('text', {
          x: 0, y: 6, 'text-anchor': 'middle', class: 'epk-symbol-char',
          fill: def.textColor, 'font-size': 20, 'font-weight': 'bold'
        });
        charText.textContent = def.symbolChar;
        g.appendChild(charText);
      } else {
        const text = el('text', {
          x: 0, y: 5, 'text-anchor': 'middle', class: 'epk-label',
          fill: def.textColor, 'font-size': 13
        });
        text.textContent = node.label;
        g.appendChild(text);
      }

      if (issueList && issueList.length) {
        const title = el('title', {});
        title.textContent = issueList.map((i) => i.message).join('\n');
        g.appendChild(title);
      }

      if (def.handles.top) g.appendChild(this._handle(0, -def.height / 2, 'top', node, 'flow'));
      if (def.handles.bottom) g.appendChild(this._handle(0, def.height / 2, 'bottom', node, 'flow'));
      if (def.handles.side === 'left') g.appendChild(this._handle(-def.width / 2, 0, 'left', node, 'side'));
      if (def.handles.side === 'right') g.appendChild(this._handle(def.width / 2, 0, 'right', node, 'side'));

      g.addEventListener('pointerdown', (ev) => this._onNodePointerDown(ev, node));
      g.addEventListener('dblclick', (ev) => this._startRename(ev, node));

      this.nodeLayer.appendChild(g);
    }

    _handle(x, y, pos, node, kind) {
      const h = el('circle', {
        cx: x, cy: y, r: 6, class: 'epk-handle epk-handle-' + pos, 'data-kind': kind
      });
      h.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        this._startConnect(ev, node, kind);
      });
      return h;
    }

    _startConnect(ev, node, kind) {
      ev.preventDefault();
      this.svg.setPointerCapture(ev.pointerId);
      const start = this._clientToSvgPoint(ev.clientX, ev.clientY);
      const line = el('line', {
        x1: start.x, y1: start.y, x2: start.x, y2: start.y, class: 'epk-temp-line'
      });
      this.overlayLayer.appendChild(line);
      this.connectDrag = { fromId: node.id, kind, line };
    }

    _onNodePointerDown(ev, node) {
      if (ev.target.classList.contains('epk-handle')) return;
      ev.stopPropagation();
      this.svg.setPointerCapture(ev.pointerId);
      this._select({ kind: 'node', id: node.id });
      const pt = this._clientToSvgPoint(ev.clientX, ev.clientY);
      this.dragNode = { id: node.id, offsetX: pt.x - node.x, offsetY: pt.y - node.y };
    }

    _onPointerMove(ev) {
      if (this.dragNode) {
        const pt = this._clientToSvgPoint(ev.clientX, ev.clientY);
        this.model.updateNodePosition(this.dragNode.id, pt.x - this.dragNode.offsetX, pt.y - this.dragNode.offsetY);
        this.render();
      }
      if (this.connectDrag) {
        const pt = this._clientToSvgPoint(ev.clientX, ev.clientY);
        this.connectDrag.line.setAttribute('x2', pt.x);
        this.connectDrag.line.setAttribute('y2', pt.y);
      }
    }

    _onPointerUp(ev) {
      if (this.dragNode) {
        this.dragNode = null;
        this.onChange();
      }
      if (this.connectDrag) {
        const targetNode = this._nodeUnderPoint(ev.clientX, ev.clientY, this.connectDrag.fromId);
        if (targetNode) {
          if (this.connectDrag.kind === 'flow') this.model.addEdge(this.connectDrag.fromId, targetNode.id);
          else this.model.addSideEdge(this.connectDrag.fromId, targetNode.id);
        }
        this.connectDrag.line.remove();
        this.connectDrag = null;
        this._notify();
      }
    }

    _nodeUnderPoint(clientX, clientY, excludeId) {
      const pt = this._clientToSvgPoint(clientX, clientY);
      let found = null;
      this.model.nodes.forEach((n) => {
        if (n.id === excludeId) return;
        const def = EPK.Symbols[n.type];
        const dx = Math.abs(pt.x - n.x);
        const dy = Math.abs(pt.y - n.y);
        if (dx <= def.width / 2 && dy <= def.height / 2) found = n;
      });
      return found;
    }

    _startRename(ev, node) {
      ev.stopPropagation();
      const def = EPK.Symbols[node.type];
      if (def.symbolChar) return;
      const fo = el('foreignObject', {
        x: -def.width / 2 + 6, y: -14, width: def.width - 12, height: 28
      });
      const input = document.createElement('input');
      input.type = 'text';
      input.value = node.label;
      input.className = 'epk-rename-input';
      fo.appendChild(input);

      const g = this.nodeLayer.querySelector(`[data-id="${node.id}"]`);
      g.appendChild(fo);
      input.focus();
      input.select();

      const commit = () => {
        this.model.renameNode(node.id, input.value.trim() || def.label);
        this._notify();
      };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { input.value = node.label; input.blur(); }
      });
    }

    _edgeAnchors(from, fromDef, to, toDef) {
      return {
        x1: from.x, y1: from.y + fromDef.height / 2,
        x2: to.x, y2: to.y - toDef.height / 2
      };
    }

    _renderEdge(edge, issueList) {
      const from = this.model.nodes.get(edge.from);
      const to = this.model.nodes.get(edge.to);
      if (!from || !to) return;
      const fromDef = EPK.Symbols[from.type];
      const toDef = EPK.Symbols[to.type];
      const a = this._edgeAnchors(from, fromDef, to, toDef);

      const line = el('line', {
        x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2,
        class: 'epk-edge', 'marker-end': 'url(#epk-arrow)', 'data-id': edge.id
      });
      const level = this._worstLevel(issueList);
      if (level) line.classList.add('has-' + level);
      if (this.selected && this.selected.kind === 'edge' && this.selected.id === edge.id) line.classList.add('is-selected');

      if (issueList && issueList.length) {
        const title = el('title', {});
        title.textContent = issueList.map((i) => i.message).join('\n');
        line.appendChild(title);
      }

      line.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); this._select({ kind: 'edge', id: edge.id }); });
      this.edgeLayer.appendChild(line);
    }

    _renderSideEdge(edge, issueList) {
      const from = this.model.nodes.get(edge.from);
      const to = this.model.nodes.get(edge.to);
      if (!from || !to) return;
      const line = el('line', {
        x1: from.x, y1: from.y, x2: to.x, y2: to.y,
        class: 'epk-side-edge', 'data-id': edge.id
      });
      const level = this._worstLevel(issueList);
      if (level) line.classList.add('has-' + level);
      if (issueList && issueList.length) {
        const title = el('title', {});
        title.textContent = issueList.map((i) => i.message).join('\n');
        line.appendChild(title);
      }
      line.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); this._select({ kind: 'edge', id: edge.id }); });
      this.sideEdgeLayer.appendChild(line);
    }
  }

  global.EPK = global.EPK || {};
  global.EPK.Canvas = Canvas;
})(window);
