;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else {
    root.ReactAutocomplete = factory(root.React);
  }
})(window, function(React) {
  return require('../lib/index.js');
});
