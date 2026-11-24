/* ==========================================================================
   Food Web Rescue Mission — reusable SVG food-web canvas
   Draws organism nodes and curved arrows behind them.
   ========================================================================== */

window.FWR_CANVAS = (() => {
  "use strict";

  const A = window.FWR_APP;
  const D = A.D;
  const NS = A.SVG_NS;

  function render(container, options = {}) {
    if (!container) return;

    if (container._ro) {
      container._ro.disconnect();
      container._ro = null;
    }

    container.innerHTML = "";
    container._opts = options;

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "web-svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const markerId = `arrowhead-${container.id || Math.random().toString(36).slice(2)}`;
    const defs = document.createElementNS(NS, "defs");
    const marker = document.createElementNS(NS, "marker");
    marker.setAttribute("id", markerId);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "8");
    marker.setAttribute("refY", "5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");
    const arrow = document.createElementNS(NS, "path");
    arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 Z");
    arrow.setAttribute("fill", "#2ee66b");
    marker.appendChild(arrow);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const layer = document.createElementNS(NS, "g");
    layer.setAttribute("class", "edge-layer");
    svg.appendChild(layer);
    container.appendChild(svg);

    D.ORGANISMS.forEach((organism) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = `organism-node${organism.id === "decomposer" ? " is-decomposer" : ""}`;
      node.dataset.org = organism.id;
      node.style.left = `${organism.position.x}%`;
      node.style.top = `${organism.position.y}%`;
      node.title = `${organism.name} — ${organism.tierLabel}`;
      node.setAttribute("aria-label", `${organism.name}, ${organism.tierLabel}. ${organism.food}.`);
      node.setAttribute("aria-pressed", String(organism.id === options.selectedId));
      if (organism.id === options.selectedId) node.classList.add("is-selected");

      const emoji = document.createElement("span");
      emoji.className = "node-emoji";
      emoji.textContent = organism.emoji;

      const name = document.createElement("span");
      name.className = "node-name";
      name.textContent = organism.name;

      const tier = document.createElement("span");
      tier.className = "node-tier";
      tier.textContent = organism.tier;

      node.append(emoji, name, tier);
      node.addEventListener("click", () => {
        A.unlockAudio();
        if (typeof options.onNodeClick === "function") options.onNodeClick(organism.id, node);
      });
      container.appendChild(node);
    });

    container._svg = svg;
    container._layer = layer;
    container._markerId = markerId;
    container._draw = () => draw(container);

    window.requestAnimationFrame(() => {
      if (container.isConnected) draw(container);
    });

    if (window.ResizeObserver) {
      container._ro = new ResizeObserver(() => draw(container));
      container._ro.observe(container);
    }
  }

  function draw(container) {
    if (!container || !container._svg || !container._layer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    container._svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    container._layer.innerHTML = "";

    const options = container._opts || {};
    const edges = typeof options.getEdges === "function"
      ? options.getEdges()
      : (Array.isArray(options.edges) ? options.edges : D.EDGES);

    edges.forEach((edge) => {
      const from = container.querySelector(`[data-org="${edge.source}"]`);
      const to = container.querySelector(`[data-org="${edge.target}"]`);
      if (!from || !to) return;

      const start = boundaryPoint(from, to, 6);
      const end = boundaryPoint(to, from, 10);
      const middleX = (start.x + end.x) / 2;
      const middleY = (start.y + end.y) / 2;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.hypot(dx, dy) || 1;
      const normalX = -dy / length;
      const normalY = dx / length;
      const curve = Number(edge.curve) || 0;
      const controlX = middleX + normalX * curve;
      const controlY = middleY + normalY * curve;
      const d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

      const title = document.createElementNS(NS, "title");
      title.textContent = `${D.ORGANISM_BY_ID[edge.source].name} → ${D.ORGANISM_BY_ID[edge.target].name}`;

      const path = document.createElementNS(NS, "path");
      path.setAttribute("class", "web-edge");
      path.setAttribute("d", d);
      path.setAttribute("marker-end", `url(#${container._markerId})`);
      path.setAttribute("vector-effect", "non-scaling-stroke");
      path.appendChild(title);

      const flow = document.createElementNS(NS, "path");
      flow.setAttribute("class", "web-edge-flow");
      flow.setAttribute("d", d);
      flow.setAttribute("vector-effect", "non-scaling-stroke");

      container._layer.append(path, flow);
    });
  }

  function boundaryPoint(from, to, padding) {
    const centerX = from.offsetLeft;
    const centerY = from.offsetTop;
    const targetX = to.offsetLeft;
    const targetY = to.offsetTop;
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    const halfWidth = from.offsetWidth / 2 + padding;
    const halfHeight = from.offsetHeight / 2 + padding;
    const scaleX = dx === 0 ? Infinity : halfWidth / Math.abs(dx);
    const scaleY = dy === 0 ? Infinity : halfHeight / Math.abs(dy);
    const scale = Math.min(scaleX, scaleY);
    return {
      x: centerX + dx * scale,
      y: centerY + dy * scale,
    };
  }

  function setSelected(container, id) {
    if (!container) return;
    A.$$(".organism-node", container).forEach((node) => {
      const selected = node.dataset.org === id;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", String(selected));
    });
  }

  window.addEventListener("resize", () => {
    A.$$(".web-canvas").forEach((container) => {
      if (typeof container._draw === "function") container._draw();
    });
  });

  return { render, draw, setSelected };
})();
