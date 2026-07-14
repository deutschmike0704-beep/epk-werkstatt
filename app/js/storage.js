(function (global) {
  const KEY = 'epk-werkstatt:autosave';

  const Storage = {
    save(model) {
      try {
        localStorage.setItem(KEY, JSON.stringify(model.toJSON()));
        return true;
      } catch (e) {
        return false;
      }
    },
    load(model) {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      try {
        const data = JSON.parse(raw);
        model.fromJSON(data);
        return true;
      } catch (e) {
        return false;
      }
    },
    hasTutorialRun() {
      return localStorage.getItem('epk-werkstatt:tutorial-done') === '1';
    },
    markTutorialRun() {
      localStorage.setItem('epk-werkstatt:tutorial-done', '1');
    }
  };

  global.EPK = global.EPK || {};
  global.EPK.Storage = Storage;
})(window);
