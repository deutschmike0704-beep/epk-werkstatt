(function () {
  const model = new EPK.Model();
  const svg = document.getElementById('epk-canvas');
  const canvas = new EPK.Canvas(svg, model, { onChange: onModelChanged });

  EPK.Storage.load(model);
  renderValidation(canvas.render());

  function onModelChanged() {
    EPK.Storage.save(model);
    renderValidation(canvas.lastIssues || model.validate());
  }

  function renderValidation(issues) {
    const list = document.getElementById('validation-list');
    const empty = document.getElementById('validation-empty');
    list.innerHTML = '';
    if (!issues || issues.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    issues.forEach((issue) => {
      const li = document.createElement('li');
      li.className = 'level-' + issue.level;
      li.textContent = issue.message;
      list.appendChild(li);
    });
  }

  function showToast(text) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2500);
  }

  document.querySelectorAll('.palette-item').forEach((item) => {
    item.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', item.dataset.symbol);
      ev.dataTransfer.effectAllowed = 'copy';
    });
    item.addEventListener('click', () => {
      canvas.placeNodeAtCenter(item.dataset.symbol);
    });
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (model.nodes.size === 0 || confirm('Zeichenfläche wirklich leeren? Das kann nicht rückgängig gemacht werden.')) {
      model.clear();
      onModelChanged();
      canvas.render();
    }
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    EPK.Export.downloadJSON(model);
    showToast('JSON exportiert.');
  });

  document.getElementById('btn-export-svg').addEventListener('click', () => {
    EPK.Export.downloadSVG(svg);
    showToast('SVG exportiert.');
  });

  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('input-import-json').click();
  });

  document.getElementById('input-import-json').addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    EPK.Export.importJSONFile(file, (data) => {
      model.fromJSON(data);
      onModelChanged();
      canvas.render();
      showToast('JSON importiert.');
    }, () => showToast('Import fehlgeschlagen: ungültige Datei.'));
    ev.target.value = '';
  });

  document.getElementById('cheatsheet-toggle').addEventListener('click', () => {
    const content = document.getElementById('cheatsheet-content');
    const btn = document.getElementById('cheatsheet-toggle');
    const expanded = !content.hidden;
    content.hidden = expanded;
    btn.setAttribute('aria-expanded', String(!expanded));
  });

  document.getElementById('btn-tutorial').addEventListener('click', () => {
    new EPK.Tutorial().start();
  });

  if (!EPK.Storage.hasTutorialRun() && model.nodes.size === 0) {
    setTimeout(() => new EPK.Tutorial().start(), 400);
  }
})();
