import React from "react";
import ReactDOM from "react-dom";
import { AnimatedPythagorasTree } from "./pythagoras-tree";

let animating = false;
let sway = 0.1;

function setAndRerender(nextAnim, nextSway) {
  animating = nextAnim;
  sway = nextSway;
  renderApp();
}

const toggle = () => setAndRerender(!animating, sway);
const decreaseSway = () => setAndRerender(animating, sway - 0.02);
const increaseSway = () => setAndRerender(animating, sway + 0.02);

function renderApp() {
  const btnTxt = animating ? "Stop" : " Start";

  ReactDOM.render(
    React.createElement(
      AnimatedPythagorasTree,
      { animating, sway },
      React.createElement("button", { type: "button", onClick: toggle, className: "toggle info" }, btnTxt),
      React.createElement("h5", {}, "Sway Amount"),
      React.createElement("button", { type: "button", onClick: decreaseSway, className: "dec" }, "-"),
      React.createElement("input", { value: sway, className: "input" }),
      React.createElement("button", { type: "button", onClick: increaseSway, className: "inc" }, "+")
    ),
    document.querySelector(".section")
  );
}

renderApp();
