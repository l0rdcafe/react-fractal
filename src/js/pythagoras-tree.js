import React from "react";

function clamp(x, min, max) {
  return min + (max - min) * x;
}

function interpolateColor(x, r1, r2, g1, g2, b1, b2) {
  const r = Math.round(clamp(x, r1, r2));
  const g = Math.round(clamp(x, g1, g2));
  const b = Math.round(clamp(x, b1, b2));
  return `rgb(${r}, ${g}, ${b})`;
}

export function getBoxStyle({ size, heightFactor, left, lean, level, totalLevels, right }) {
  const color = interpolateColor((level / totalLevels) ** 2, 80, 120, 54, 240, 104, 64);
  const scale = right
    ? Math.sqrt((size * heightFactor) ** 2 + (size * (0.5 + lean)) ** 2) / size
    : Math.sqrt((size * heightFactor) ** 2 + (size * (0.5 - lean)) ** 2) / size;
  const rotation = right ? Math.atan(heightFactor / (0.5 + lean)) : -Math.atan(heightFactor / (0.5 - lean));

  const style = {
    position: "absolute",
    bottom: "30%",
    width: size,
    height: size,
    transformOrigin: right ? `${size}px ${size}px` : `0 ${size}px`,
    transform:
      level === 0
        ? ""
        : `
        translate3d(0, ${-size}px, 0)
        scale3d(${scale}, ${scale}, 1)
        rotate(${rotation}rad)
      `,
    backgroundColor: color
  };

  if (level === 0) {
    style.left = `calc(50% - ${size / 2}px + ${left || 0}px)`;
  }

  return style;
}

export const TreeBox = props => {
  const style = getBoxStyle(props);
  const baseProps = Object.assign({}, props, {
    level: props.level + 1
  });
  const leftChild =
    props.level < props.totalLevels && React.createElement(TreeBox, Object.assign({}, baseProps, { right: false }));
  const rightChild =
    props.level < props.totalLevels && React.createElement(TreeBox, Object.assign({}, baseProps, { right: true }));

  return React.createElement("div", { style }, leftChild, rightChild);
};
TreeBox.defaultProps = {
  level: 0
};

export class AnimatedPythagorasTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    if (this.props.animating) {
      this.lastFrameTime = new Date().getTime();
      this.scheduleFrame();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.animating && !nextProps.animating && this.nextFrame) {
      window.cancelAnimationFrame(this.nextFrame);
      this.nextFrame = null;
    } else if (!this.props.animating && nextProps.animating) {
      this.lastFrameTime = new Date().getTime();
      this.scheduleFrame();
    }
  }

  componentDidUpdate() {
    if (this.props.animating) {
      this.scheduleFrame();
    }
  }

  componentWillUnmount() {
    if (this.nextFrame) {
      window.cancelAnimationFrame(this.nextFrame);
      this.nextFrame = null;
    }
  }

  scheduleFrame() {
    this.nextFrame = window.requestAnimationFrame(() => {
      const now = new Date().getTime();
      const delta = now - this.lastFrameTime;
      if (delta > 25) {
        this.lastFrameTime = now;
        this.setState(({ time }) => ({ time: time + delta / 25 }));
      } else {
        this.scheduleFrame();
      }
    });
  }

  render() {
    const { children, sprout, sway, baseHeightFactor, baseLean, size, totalLevels } = this.props;
    const t = this.state.time;

    return React.createElement(
      "div",
      {},
      React.createElement(TreeBox, {
        heightFactor: Math.cos(t / 43) * sprout + baseHeightFactor,
        lean: Math.sin(t / 50) * sway + baseLean,
        size,
        totalLevels,
        level: 0
      }),
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            right: 10,
            top: 10,
            left: 10
          },
          className: "controls"
        },
        children
      )
    );
  }
}
AnimatedPythagorasTree.defaultProps = {
  totalLevels: 7,
  baseLean: 0,
  baseHeightFactor: 0.37,
  size: 70,
  sprout: 0.01,
  sway: 0.04
};
