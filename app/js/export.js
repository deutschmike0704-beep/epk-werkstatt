(function (global) {
  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const Export = {
    downloadJSON(model, filename) {
      download(filename || 'epk-modell.json', JSON.stringify(model.toJSON(), null, 2), 'application/json');
    },
    downloadSVG(svgElement, filename) {
      const clone = svgElement.cloneNode(true);
      clone.querySelectorAll('.epk-handle, .epk-temp-line').forEach((n) => n.remove());
      clone.setAttribute('xmlns', EPK.SVG_NS);
      const serialized = new XMLSerializer().serializeToString(clone);
      download(filename || 'epk-modell.svg', serialized, 'image/svg+xml');
    },
    importJSONFile(file, onLoaded, onError) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          onLoaded(data);
        } catch (e) {
          if (onError) onError(e);
        }
      };
      reader.onerror = () => { if (onError) onError(reader.error); };
      reader.readAsText(file);
    }
  };

  global.EPK = global.EPK || {};
  global.EPK.Export = Export;
})(window);
