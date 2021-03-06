/**
 * @jsx React.DOM
 */
'use strict';

var React     = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var Autocomplete = React.createClass({displayName: 'Autocomplete',

  propTypes: {
    options: PropTypes.any,
    search: PropTypes.func,
    resultRenderer: PropTypes.oneOfType([
      PropTypes.component,
      PropTypes.func
    ]),
    value: PropTypes.object,
    onChange: PropTypes.func,
    onError: PropTypes.func
  },

  render:function() {
    var className = cx(
      this.props.className,
      'react-autocomplete-Autocomplete',
      this.state.showResults ?
        'react-autocomplete-Autocomplete--resultsShown' :
        undefined
    );
    var style = {
      position: 'relative',
      outline: 'none'
    };
    return (
      React.DOM.div({
        tabIndex: "1", 
        className: className, 
        onFocus: this.onFocus, 
        onBlur: this.onBlur, 
        style: style}, 
        React.DOM.input({
          ref: "search", 
          className: "react-autocomplete-Autocomplete__search", 
          placeholder: this.props.placeholder, 
          style: {width: '100%'}, 
          onClick: this.showAllResults, 
          onChange: this.onQueryChange, 
          onFocus: this.showAllResults, 
          onBlur: this.onQueryBlur, 
          onKeyDown: this.onQueryKeyDown, 
          value: this.state.searchTerm}
          ), 
        Results({
          className: "react-autocomplete-Autocomplete__results", 
          onSelect: this.onValueChange, 
          onFocus: this.onValueFocus, 
          results: this.state.results, 
          focusedValue: this.state.focusedValue, 
          show: this.state.showResults, 
          renderer: this.props.resultRenderer}
          )
      )
    );
  },

  getDefaultProps:function() {
    return {
      search: searchArray
    };
  },

  getInitialState:function() {
    return {
      results: [],
      showResults: false,
      showResultsInProgress: false,
      searchTerm: this.getSearchTerm(this.props),
      focusedValue: null
    };
  },

  componentWillReceiveProps:function(nextProps) {
    if (nextProps.value.id != this.props.value.id) {
      var searchTerm = this.getSearchTerm(nextProps);
      this.setState({searchTerm:searchTerm});
    }
  },

  componentWillMount:function() {
    this.blurTimer = null;
  },

  getSearchTerm:function(props) {
    var searchTerm;
    if (props.searchTerm) {
      searchTerm = props.searchTerm;
    } else if (props.value) {
      var $__0=   props.value,id=$__0.id,title=$__0.title;
      if (title) {
        searchTerm = title;
      } else if (id) {
        props.options.forEach(function(opt)  {
          if (opt.id == id) {
            searchTerm = opt.title;
          }
        });
      }
    }
    return searchTerm || '';
  },

  /**
    * Show results for a search term value.
    *
    * This method doesn't update search term value itself.
    *
    * @param {Search} searchTerm
    */
  showResults:function(searchTerm) {
    this.setState({showResultsInProgress: true});
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this.onSearchComplete
    );
  },

  showAllResults:function() {
    if (!this.state.showResultsInProgress && !this.state.showResults) {
      this.showResults('');
    }
  },

  onValueChange:function(value) {
    var state = {
      value: value,
      showResults: false
    };

    if (value) {
      state.searchTerm = value.title;
    }

    this.setState(state);

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },

  onSearchComplete:function(err, results) {
    if (err) {
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    }

    this.setState({
      showResultsInProgress: false,
      showResults: true,
      results: results
    });
  },

  onValueFocus:function(value) {
    this.setState({focusedValue: value});
  },

  onQueryChange:function(e) {
    var searchTerm = e.target.value;
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });
    this.showResults(searchTerm);
  },

  onFocus:function() {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.refs.search.getDOMNode().focus();
  },

  onBlur:function() {
    // wrap in setTimeout so we can catch a click on results
    this.blurTimer = setTimeout(function()  {
      if (this.isMounted()) {
        this.setState({showResults: false});
      }
    }.bind(this), 100);
  },

  onQueryKeyDown:function(e) {

    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.focusedValue) {
        this.onValueChange(this.state.focusedValue);
      }

    } else if (e.key === 'ArrowUp' && this.state.showResults) {
      e.preventDefault();
      var prevIdx = Math.max(
        this.focusedValueIndex() - 1,
        0
      );
      this.setState({
        focusedValue: this.state.results[prevIdx]
      });

    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.state.showResults) {
        var nextIdx = Math.min(
          this.focusedValueIndex() + (this.state.showResults ? 1 : 0),
          this.state.results.length - 1
        );
        this.setState({
          showResults: true,
          focusedValue: this.state.results[nextIdx]
        });
      } else {
        this.showAllResults();
      }
    }
  },

  focusedValueIndex:function() {
    if (!this.state.focusedValue) {
      return -1;
    }
    for (var i = 0, len = this.state.results.length; i < len; i++) {
      if (this.state.results[i].id === this.state.focusedValue.id) {
        return i;
      }
    }
    return -1;
  }
});

var Result = React.createClass({displayName: 'Result',

  render:function() {
    var className = cx({
      'react-autocomplete-Result': true,
      'react-autocomplete-Result--active': this.props.focused
    });

    return (
      React.DOM.li({
        style: {listStyleType: 'none'}, 
        className: className, 
        onClick: this.onClick, 
        onMouseEnter: this.onMouseEnter}, 
        React.DOM.a(null, this.props.result.title)
      )
    );
  },

  onClick:function() {
    this.props.onClick(this.props.result);
  },

  onMouseEnter:function(e) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e, this.props.result);
    }
  },

  shouldComponentUpdate:function(nextProps) {
    return (nextProps.result.id !== this.props.result.id ||
            nextProps.focused !== this.props.focused);
  }
});

var Results = React.createClass({displayName: 'Results',

  render:function() {
    var style = {
      display: this.props.show ? 'block' : 'none',
      position: 'absolute',
      listStyleType: 'none'
    };

    return this.transferPropsTo(
      React.DOM.ul({style: style, className: "react-autocomplete-Results"}, 
        this.props.results.map(this.renderResult)
      )
    );
  },

  renderResult:function(result) {
    var focused = this.props.focusedValue &&
                  this.props.focusedValue.id === result.id;
                  var renderer = this.props.renderer || Result;
    return renderer({
      ref: focused ? "focused" : undefined,
      key: result.id,
      result: result,
      focused: focused,
      onMouseEnter: this.onMouseEnterResult,
      onClick: this.props.onSelect
    });
  },

  getDefaultProps:function() {
    return {renderer: Result};
  },

  componentDidUpdate:function() {
    this.scrollToFocused();
  },

  componentDidMount:function() {
    this.scrollToFocused();
  },

  componentWillMount:function() {
    this.ignoreFocus = false;
  },

  scrollToFocused:function() {
    var focused = this.refs && this.refs.focused;
    if (focused) {
      var containerNode = this.getDOMNode();
      var scroll = containerNode.scrollTop;
      var height = containerNode.offsetHeight;

      var node = focused.getDOMNode();
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      // we update ignoreFocus to true if we change the scroll position so
      // the mouseover event triggered because of that won't have an
      // effect
      if (top < scroll) {
        this.ignoreFocus = true;
        containerNode.scrollTop = top;
      } else if (bottom - scroll > height) {
        this.ignoreFocus = true;
        containerNode.scrollTop = bottom - height;
      }
    }
  },

  onMouseEnterResult:function(e, result) {
    // check if we need to prevent the next onFocus event because it was
    // probably caused by a mouseover due to scroll position change
    if (this.ignoreFocus) {
      this.ignoreFocus = false;
    } else {
      // we need to make sure focused node is visible
      // for some reason mouse events fire on visible nodes due to
      // box-shadow
      var containerNode = this.getDOMNode();
      var scroll = containerNode.scrollTop;
      var height = containerNode.offsetHeight;

      var node = e.target;
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      if (bottom > scroll && top < scroll + height) {
        this.props.onFocus(result);
      }
    }
  }
});

/**
* Search options using specified search term treating options as an array
* of candidates.
*
* @param {Array.<Object>} options
* @param {String} searchTerm
* @param {Callback} cb
*/
function searchArray(options, searchTerm, cb) {
  if (!options) {
    return cb(null, []);
  }

  searchTerm = new RegExp(searchTerm, 'i');

  var results = [];

  for (var i = 0, len = options.length; i < len; i++) {
    if (searchTerm.exec(options[i].title)) {
      results.push(options[i]);
    }
  }

  cb(null, results);
}

module.exports = Autocomplete;
