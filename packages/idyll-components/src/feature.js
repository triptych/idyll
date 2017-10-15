import React from 'react';
import ReactDOM from 'react-dom';

const stateClasses = [
  'is-top',
  'is-fixed',
  'is-bottom'
];

class Content extends React.PureComponent {
  render () {
    return <div style={this.props.style}>
      {this.props.children}
    </div>
  }
}

class Feature extends React.PureComponent {
  constructor (props) {
    super(props)
    this.setFeature = this.setFeature.bind(this);
    this.setRoot = this.setRoot.bind(this);

    this.state = {
      scrollState: 0,
      featureMarginLeft: 0,
    };
  }

  setRoot (c) {
    this.rootEl = c;
    this.initialize();
  }

  setFeature (c) {
    this.featureEl = c;
    this.initialize();
  }

  handleResize () {
    let rootRect = this.rootEl.getBoundingClientRect()
    this.setState({
      featureMarginLeft: -rootRect.left
    });
  }

  handleScroll () {
    if (!this.rootEl) return;
    let rootRect = this.rootEl.getBoundingClientRect();
    let position = rootRect.top / (window.innerHeight - rootRect.height)
    // Update this whenever it changes so that the state is correctly adjusted:
    this.setState({scrollState: position < 0 ? 0 : (position <= 1 ? 1 : 2)})
    // Only update the value when onscreen:
    if (rootRect.top < window.innerHeight && rootRect.bottom > 0) {
      this.props.updateProps({value: position})
    }
  }



  initialize () {
    if (!this.rootEl || !this.featureEl) return;

    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  unwrapChild(c) {
    if (c => c.type.name && c.type.name.toLowerCase() === 'wrapper') {
      return c.props.children[0];
    }
    return c;
  }

  unwrapChildren() {
    return this.props.children.map((c) => this.unwrapChild(c));
  }

  getFeatureChild() {
    const unwrapped = this.unwrapChildren();
    const filtered = React.Children.toArray(this.props.children).filter((_, i) => {
      const c = unwrapped[i];
      if (!c.type) {
        return false;
      }
      return (c.type.name && c.type.name.toLowerCase() === 'content') || c.type.prototype instanceof Content;
    })
    if (filtered.length) {
      return filtered[0];
    }
  }

  getNonFeatureChildren() {
    const unwrapped = this.unwrapChildren();
    return React.Children.toArray(this.props.children).filter((_, i) => {
      const c = unwrapped[i];
      if (!c.type) {
        return true;
      }
      return (!c.type.name || c.type.name.toLowerCase() !== 'content') && !(c.type.prototype instanceof Content);
    });
  }

  render () {
    let feature;
    let ps = this.state.scrollState;
    let featureStyles = {
      width: 'calc(100vw - 15px)',
      overflowX: 'hidden',
      height: '100vh',
      marginLeft: ps === 1 ? 0 : (this.state.featureMarginLeft + 'px'),
      position: ps >= 1 ? 'fixed' : 'absolute',
      bottom: ps === 2 ? 0 : 'auto',
      zIndex: -1
    };

    if (ps === 1) {
      featureStyles.top = 0;
      featureStyles.right = 0;
      featureStyles.bottom = 0;
      featureStyles.left = 0;
    }

    let rootStyles = {
      position: 'relative',
      marginLeft: 0,
      marginRight: 0,
      maxWidth: 'none'
    };

    var featureChild = this.getFeatureChild();
    var nonFeatureChildren = this.getNonFeatureChildren();

    if (featureChild) {
      const unwrapped = this.unwrapChild(featureChild);
      if (featureChild !== unwrapped) {
        // React.Children.only(featureChild.props.children);
        feature = React.cloneElement(featureChild, {
          children: React.cloneElement(React.Children.toArray(featureChild.props.children)[0], {
            style: featureStyles,
            ref: (ref) => this.setFeature(ref)
          })
        });
      } else {
        feature = React.cloneElement(featureChild, {
          style: featureStyles,
          ref: (ref) => this.setFeature(ref)
        });
      }
    }

    return <figure
      style={rootStyles}
      className={`idyll-feature ${stateClasses[this.state.scrollState]}`}
      ref={(ref) => { return this.setRoot(ref) }}
    >
      {feature}
      {nonFeatureChildren}
    </figure>
  }
}

Feature.defaultProps = {
  children: []
};

export { Content, Feature as default };
