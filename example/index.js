import React from "react";
import VignetteGrid from "..";
import Vignette from "glsl-transition-vignette";
import GlslTransitions from "glsl-transitions";

function noUniformsTexture (uniforms) {
  for (var u in uniforms) {
    if (typeof uniforms[u] === "string")
      return false;
  }
  return true;
}

function getRandomTransitions () {
  return GlslTransitions
    .filter(t => noUniformsTexture(t.uniforms))
    .sort(() => Math.random()-0.5)
    .slice(0, 12);
}

const gridStyle = {
  width: "1090px",
  margin: "0 auto"
};

var linkStyle = {
  color: "#fc6",
  textDecoration: "none"
};

const renderVignette = (props) => <Vignette {...props} />;

class Root extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      transitions: getRandomTransitions()
    };
  }

  randomize () {
    this.setState({
      transitions: getRandomTransitions()
    });
  }

  render() {
    return <div>
      <h1>
        <a href="http://github.com/glslio/glsl-transition-vignette-grid" style={linkStyle}>
          glsl-transition-vignette-grid
        </a>
      </h1>

      <h2>
        renders a grid of <a style={{ color: "inherit", textDecoration: "none" }} href="http://github.com/glslio/glsl-transition-vignette"><code>glsl-transition-vignette</code></a>
      </h2>

      <p>
        <button onClick={this.randomize.bind(this)}>Randomize</button>
      </p>

      <VignetteGrid
        style={gridStyle}
        vignetteWidth={256}
        vignetteHeight={170}
        vignetteMargin={8}
        transitions={this.state.transitions}
        images={["1.jpg","2.jpg"]}
        renderVignette={renderVignette}
      />

      <p>
        <a style={linkStyle} target="_blank" href="https://github.com/glslio/glsl-transition-vignette-grid/blob/master/example/index.js">source code of this example</a>
      </p>

    </div>;
  }
}


document.body.style.textAlign = "center";
document.body.style.padding = "0px 20px";
document.body.style.color = "#ddd";
document.body.style.background = "#333";
document.body.style.fontFamily = "sans-serif";
React.render(<Root />, document.body);
