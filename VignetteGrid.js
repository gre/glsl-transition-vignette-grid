import React from "react";
import difference from "lodash/array/difference";
import find from "lodash/collection/find";
import Vignette from "glsl-transition-vignette";
import SharedCanvas from "glsl-transition-vignette/SharedCanvas";

const PropTypes = React.PropTypes;

var VignetteGrid = React.createClass({

  propTypes: {
    /**
     * style the root element.
     * Typical use-case: define a width that will constraints the grid. You can also use margin: "0 auto"
     */
    style: PropTypes.object,

    /**
     * size of each vignette.
     * Be sure the images you give matches the same ratio.
     */
    vignetteWidth: PropTypes.number.isRequired,
    vignetteHeight: PropTypes.number.isRequired,

    /**
      * Define margins on each vignette.
      * if a 4-length array is provided, it is applied to: [top, right, bottom, left]
      * if a [h,w] array is provided, [h,w,h,w] is used (like in CSS).
      * if a number X is provided, [X,X,X,X] is used.
      */
    vignetteMargin: PropTypes.oneOfType([ PropTypes.array, PropTypes.number ]),

    /**
      * Images URLs to use for the vignettes.
      * Provide at least 2 images.
      */
    images: PropTypes.array.isRequired,

    /**
     * the `transitions` array MUST not mutate.
     * ALL transitions are displayed,
     * up to you to splice your collection and handle pagination.
     */
    transitions: PropTypes.array.isRequired,

    /**
     * renderVignette: (props) => <Vignette {...props} /> element
     * You should give props to Vignette. You can enhance them.
     */
    renderVignette: PropTypes.func,

    /**
     * an optional configuration for the Canvas Cache to use.
     * the cache system is a pull of WebGL Canvas to use for rendering the vignettes.
     */
    cache: PropTypes.shape({
      resolution: PropTypes.number, // the number of frames to display when caching the frames.
      delay: PropTypes.number // delay a bit the cache computation to not block the page (this is multiplied by the vignette (index+1))
    })
  },

  getDefaultProps () {
    return {
      style: {},
      vignetteMargin: 0,
      renderVignette: (props) => <Vignette {...props} />,
      cache: {
        resolution: 64,
        delay: 30
      }
    };
  },

  componentWillMount() {
    const { transitions, vignetteWidth, vignetteHeight } = this.props;
    this.cache = SharedCanvas.create(vignetteWidth, vignetteHeight);
    transitions.forEach(t => this.cache.createTransitionDrawer(t.id, t.glsl, t.uniforms));
  },

  componentWillUnmount() {
    this.cache.destroy();
    this.cache = null;
  },

  componentWillUpdate (nextProps) {
    if (nextProps.transitions !== this.props.transitions) {
      var cache = this.cache;
      var data = nextProps.transitions;
      var beforeIds = cache.getAllIds();
      var afterIds = data.map(t => t.id);
      var deleted = difference(beforeIds, afterIds);
      var created = difference(afterIds, beforeIds);
      deleted.forEach(id => cache.removeTransitionDrawer(id));
      created.forEach(id => {
        var transition = find(data, function (t) { return t.id === id; });
        cache.createTransitionDrawer(id, transition.glsl, transition.uniforms);
      });
    }
  },

  render: function () {
    const {
      style,
      transitions,
      images,
      renderVignette,
      vignetteMargin,
      vignetteWidth,
      vignetteHeight,
      cache
    } = this.props;

    const vignetteMarginCSS =
      (typeof vignetteMargin === "number" ? [vignetteMargin] : vignetteMargin)
      .map(m => m+"px")
      .join(" ");

    const items = transitions.map((transition, i) => {
      var cacheConfig = {
        drawer: this.cache.getTransitionDrawer(transition.id),
        resolution: cache.resolution,
        delay: (i+1) * cache.delay
      };
      return renderVignette({
        style: {
          display: "inline-block",
          margin: vignetteMarginCSS
        },
        width: vignetteWidth,
        height: vignetteHeight,
        images: images,
        glsl: transition.glsl,
        uniforms: transition.uniforms,
        id: transition.id,
        key: transition.id,
        name: transition.name,
        owner: transition.owner,
        cache: cacheConfig
      });
    });

    return <div style={style}>{items}</div>;
  }

});

export default VignetteGrid;
