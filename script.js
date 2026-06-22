const { players, finalVenue } = window.FINAL_GENERATION_DATA;

const els = {
  app: document.querySelector("#app"),
  start: document.querySelector("#start-button"),
  replay: document.querySelector("#replay-button"),
  sceneCount: document.querySelector("#scene-count"),
  panelTitle: document.querySelector("#panel-title"),
  playerCard: document.querySelector("#player-card"),
  playerPhoto: document.querySelector("#player-photo"),
  playerCountry: document.querySelector("#player-country"),
  playerRole: document.querySelector("#player-role"),
  playerHighlight: document.querySelector("#player-highlight"),
  playerRoute: document.querySelector("#player-route"),
  playerCredit: document.querySelector("#player-credit"),
  panelMeta: document.querySelector("#panel-meta"),
  panelCopy: document.querySelector("#panel-copy"),
  sceneTrack: document.querySelector("#scene-track"),
  status: document.querySelector("#status-pill"),
  opening: document.querySelector("#opening-card"),
  blackout: document.querySelector("#blackout"),
  finalCard: document.querySelector("#final-card")
};

const GOLD = "#d7aa48";
const GOLD_BRIGHT = "#ffd36f";
const ROUTE_DURATION = 4700;
const CONVERGENCE_DURATION = 6200;
const DEFAULT_HOLD = 1300;
const BIRTHPLACE_HOLD = 4200;
const STADIUM_STOP_HOLD = 2800;
const ROUTE_COMPLETE_HOLD = 2800;
const CONVERGENCE_HOLD = 3400;
const NETWORK_HOLD = 4500;
const FINAL_STADIUM_HOLD = 5200;
const MAP_IDLE_TIMEOUT = 1800;
const BUILDING_LAYER_ID = "world-cup-3d-buildings";
const BUILDING_VISIBILITY_ZOOM = 13;

const CLEAR_BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const initialCamera = {
  center: [-36, 22],
  zoom: 1.08,
  pitch: 48,
  bearing: -22,
  duration: 0
};

let activePopup = null;
let animationFrame = null;
let isPlaying = false;
let playbackToken = 0;
let jumpToken = 0;
let currentSceneIndex = 0;

els.start.disabled = true;
els.replay.disabled = true;

const map = new maplibregl.Map({
  container: "map",
  style: CLEAR_BASEMAP_STYLE,
  center: initialCamera.center,
  zoom: initialCamera.zoom,
  pitch: initialCamera.pitch,
  bearing: initialCamera.bearing,
  maxPitch: 85,
  projection: "globe",
  attributionControl: false
});

map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

map.on("load", () => {
  prepareMapLayers();
  buildSceneNav();
  resetStory();
  updatePanel(scenes[0], 0);
  setStatus("Ready");
  els.start.disabled = false;
  els.replay.disabled = false;
});

els.start.addEventListener("click", () => playStory());
els.replay.addEventListener("click", () => playStory());

function buildSceneNav() {
  els.sceneTrack.innerHTML = "";

  scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scene-jump";
    button.textContent = String(index + 1);
    button.title = `${index + 1}. ${scene.title}`;
    button.setAttribute("aria-label", `Go to scene ${index + 1}: ${scene.title}`);
    button.addEventListener("click", () => jumpToScene(index));
    els.sceneTrack.append(button);
  });

  updateSceneNav(0);
}

function updateSceneNav(index) {
  currentSceneIndex = index;

  Array.from(els.sceneTrack.children).forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
}

function stopPlayback() {
  playbackToken += 1;
  isPlaying = false;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  map.stop();
  els.start.disabled = false;
  els.replay.disabled = false;
}

async function jumpToScene(index) {
  stopPlayback();
  const token = ++jumpToken;
  const scene = scenes[index];

  resetStory();
  prepareRoutesForScene(index);
  updatePanel(scene, index);
  applySceneChrome(scene);
  closePopup();
  setStatus(`Scene ${index + 1}`);

  if (scene.fadeToBlack || scene.finalText) {
    els.blackout.classList.add("is-visible");
  }

  await flyToCameraAndSettle({
    ...scene.camera,
    duration: Math.min(scene.camera.duration || 0, 1800),
    curve: 1.08
  });

  if (token !== jumpToken || isPlaying || currentSceneIndex !== index) return;
  showStaticScenePopup(scene);
}

function prepareRoutesForScene(targetIndex) {
  resetLines();

  for (let index = 0; index <= targetIndex; index += 1) {
    const scene = scenes[index];

    if (scene.routeAnimation) {
      setSourceLine(scene.routeAnimation.sourceId, scene.routeAnimation.coordinates, 100);
    }

    if (scene.convergenceAnimation) {
      players.forEach((player) => {
        setSourceLine(convergenceSourceId(player.id), finalApproachCoordinates(player), 100);
      });
    }

    if (["full-network", "final-stadium", "fade-to-black", "last-dance"].includes(scene.id)) {
      revealFullNetwork();
    }
  }
}

function showStaticScenePopup(scene) {
  const popup = scene.popupAfterAnimation || scene.popup;
  if (!popup || scene.finalText) return;
  showPopup(popup.coordinates, popup.title, popup.description);
}

function prepareMapLayers() {
  // The basemap stays readable, while the globe fog keeps the space opening cinematic.
  if (typeof map.setFog === "function") {
    map.setFog({
      color: "rgb(196, 215, 225)",
      "high-color": "rgb(242, 238, 222)",
      "horizon-blend": 0.12,
      "space-color": "rgb(8, 10, 17)",
      "star-intensity": 0.55
    });
  }

  tuneBasemapColors();
  tryAdd3DBuildings();
  addPointLayers();
  addRouteLayers();
  enablePointPopups();
}

function tuneBasemapColors() {
  const style = map.getStyle();
  if (!style || !Array.isArray(style.layers)) return;

  // Recolor the clear basemap into a livelier World Cup palette while keeping
  // roads, labels, and coastlines readable.
  style.layers.forEach((layer) => {
    const id = layer.id.toLowerCase();
    const sourceLayer = String(layer["source-layer"] || "").toLowerCase();
    const name = `${id} ${sourceLayer}`;

    if (layer.type === "background") {
      setPaint(layer.id, "background-color", "#f7edcf");
    }

    if (layer.type === "fill") {
      if (/water|ocean|river|lake/.test(name)) {
        setPaint(layer.id, "fill-color", "#0b8ed0");
        setPaint(layer.id, "fill-opacity", 0.9);
      } else if (/park|grass|wood|forest|landcover|green|pitch/.test(name)) {
        setPaint(layer.id, "fill-color", "#18a957");
        setPaint(layer.id, "fill-opacity", 0.58);
      } else if (/landuse|residential|urban|building/.test(name)) {
        setPaint(layer.id, "fill-color", "#f4d37a");
        setPaint(layer.id, "fill-opacity", 0.62);
      }
    }

    if (layer.type === "line") {
      if (/motorway|trunk|primary|secondary|road|street/.test(name)) {
        setPaint(layer.id, "line-color", "#f5c542");
        setPaint(layer.id, "line-opacity", 0.78);
      } else if (/border|boundary/.test(name)) {
        setPaint(layer.id, "line-color", "#1f7a4a");
        setPaint(layer.id, "line-opacity", 0.55);
      }
    }
  });
}

function setPaint(layerId, property, value) {
  if (!map.getLayer(layerId)) return;
  try {
    map.setPaintProperty(layerId, property, value);
  } catch (error) {
    // Some style layers use expressions that do not accept every paint update.
  }
}

function tryAdd3DBuildings() {
  const style = map.getStyle();
  const hasOpenMapTiles = Boolean(style.sources.openmaptiles);

  if (!hasOpenMapTiles || map.getLayer(BUILDING_LAYER_ID)) return;

  // At close zoom levels, building extrusions make the pitched camera feel
  // meaningfully 3D around city and stadium scenes.
  map.addLayer({
    id: BUILDING_LAYER_ID,
    source: "openmaptiles",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 13,
    layout: { visibility: "none" },
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13,
        "#c9962d",
        16,
        "#f5d27a"
      ],
      "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 22],
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
      "fill-extrusion-opacity": 0.58
    }
  });
}

function addPointLayers() {
  map.addSource("story-points", {
    type: "geojson",
    data: buildPointCollection()
  });

  map.addLayer({
    id: "story-points-halo",
    type: "circle",
    source: "story-points",
    paint: {
      "circle-radius": [
        "match",
        ["get", "kind"],
        "venue",
        18,
        "stadium",
        15,
        "landmark",
        13,
        "birthplace",
        11,
        9
      ],
      "circle-color": ["get", "color"],
      "circle-opacity": ["match", ["get", "kind"], "venue", 0.36, 0.22],
      "circle-blur": 0.72
    }
  });

  map.addLayer({
    id: "story-points-core",
    type: "circle",
    source: "story-points",
    paint: {
      "circle-radius": [
        "match",
        ["get", "kind"],
        "venue",
        6,
        "stadium",
        5.6,
        "landmark",
        4.8,
        "birthplace",
        4.4,
        3.8
      ],
      "circle-color": "#fff8df",
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": ["match", ["get", "kind"], "venue", 3, 2],
      "circle-opacity": 0.96
    }
  });

  map.addLayer({
    id: "story-point-labels",
    type: "symbol",
    source: "story-points",
    minzoom: 11.5,
    filter: ["match", ["get", "kind"], ["stadium", "venue"], true, false],
    layout: {
      "text-field": ["get", "name"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 11.5, 11, 16, 15],
      "text-offset": [0, 1.25],
      "text-anchor": "top",
      "text-max-width": 12
    },
    paint: {
      "text-color": "#fff7d6",
      "text-halo-color": "#101820",
      "text-halo-width": 2.2
    }
  });
}

function buildPointCollection() {
  const features = [];

  players.forEach((player) => {
    features.push(pointFeature(player.landmark, player, "landmark", GOLD_BRIGHT));
    features.push(pointFeature(player.birthplace, player, "birthplace", player.color));

    player.route.forEach((stop) => {
      features.push(pointFeature(stop, player, stop.stadium ? "stadium" : "route", player.color));
    });
  });

  features.push({
    type: "Feature",
    properties: {
      kind: "venue",
      player: "2026 Final",
      name: finalVenue.name,
      role: finalVenue.city,
      description: bilingual(finalVenue.description, finalVenue.descriptionJa),
      color: GOLD_BRIGHT
    },
    geometry: { type: "Point", coordinates: finalVenue.coordinates }
  });

  return { type: "FeatureCollection", features };
}

function pointFeature(place, player, kind, color) {
  const pointName = place.stadium || place.name;
  const pointRole = place.stadium ? `${place.role} | ${place.name}` : place.role;
  const pointDescription = place.stadium
    ? `${place.stadium}\n${place.role} | ${place.name}`
    : place.description || `${place.name} | ${place.role}`;

  return {
    type: "Feature",
    properties: {
      kind,
      player: player.name,
      name: pointName,
      role: pointRole,
      description: bilingual(pointDescription, place.descriptionJa),
      color
    },
    geometry: { type: "Point", coordinates: place.coordinates }
  };
}

function addRouteLayers() {
  players.forEach((player, index) => {
    addLineSourceAndLayers({
      sourceId: careerSourceId(player.id),
      layerId: `${player.id}-career`,
      color: player.color,
      width: 3.5,
      glowWidth: 12,
      lineOffset: 0
    });

    addLineSourceAndLayers({
      sourceId: convergenceSourceId(player.id),
      layerId: `${player.id}-convergence`,
      color: player.color,
      width: 3.2,
      glowWidth: 14,
      lineOffset: [-7, -2.5, 2.5, 7][index] || 0
    });
  });
}

function addLineSourceAndLayers({ sourceId, layerId, color, width, glowWidth, lineOffset }) {
  map.addSource(sourceId, {
    type: "geojson",
    data: emptyFeatureCollection()
  });

  map.addLayer({
    id: `${layerId}-shadow`,
    type: "line",
    source: sourceId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#101820",
      "line-width": glowWidth + 4,
      "line-opacity": 0.34,
      "line-blur": 1.2,
      "line-offset": lineOffset
    }
  });

  map.addLayer({
    id: `${layerId}-glow`,
    type: "line",
    source: sourceId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": color,
      "line-width": glowWidth,
      "line-opacity": 0.28,
      "line-blur": 4,
      "line-offset": lineOffset
    }
  });

  map.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": color,
      "line-width": width,
      "line-opacity": 0.96,
      "line-offset": lineOffset
    }
  });
}

function enablePointPopups() {
  map.on("click", "story-points-core", (event) => {
    const feature = event.features[0];
    showPopup(feature.geometry.coordinates, feature.properties.name, feature.properties.description);
  });

  map.on("mouseenter", "story-points-core", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "story-points-core", () => {
    map.getCanvas().style.cursor = "";
  });
}

function resetStory() {
  resetLines();
  closePopup();
  els.opening.classList.remove("is-hidden");
  els.blackout.classList.remove("is-visible");
  els.finalCard.classList.remove("is-visible");
  els.app.classList.remove("is-finale");
  setStatus("Ready");
}

function resetLines() {
  players.forEach((player) => {
    setSourceLine(careerSourceId(player.id), []);
    setSourceLine(convergenceSourceId(player.id), []);
  });
}

function careerSourceId(playerId) {
  return `${playerId}-career-source`;
}

function convergenceSourceId(playerId) {
  return `${playerId}-convergence-source`;
}

function emptyFeatureCollection() {
  return { type: "FeatureCollection", features: [] };
}

function setSourceLine(sourceId, coordinates, progress = 100) {
  const source = map.getSource(sourceId);
  if (!source) return;

  if (coordinates.length < 2) {
    source.setData(emptyFeatureCollection());
    return;
  }

  source.setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { progress: Math.round(progress) },
        geometry: { type: "LineString", coordinates }
      }
    ]
  });
}

function updatePanel(scene, index) {
  els.sceneCount.textContent = `Scene ${index + 1} / ${scenes.length}`;
  els.panelTitle.textContent = scene.title;
  els.panelMeta.textContent = scene.meta;
  els.panelCopy.textContent = scene.description;
  updateSceneNav(index);

  if (scene.player) {
    renderPlayerCard(scene.player);
  } else {
    hidePlayerCard();
  }
}

function renderPlayerCard(player) {
  const card = player.card || {};

  els.playerCard.hidden = false;
  els.playerCard.style.setProperty("--player-color", player.color);
  els.playerPhoto.src = player.photo;
  els.playerPhoto.alt = `${player.name} portrait`;
  els.playerCountry.textContent = bilingual(player.country, card.countryJa);
  els.playerRole.textContent = bilingual(card.role || player.shortName, card.roleJa);
  els.playerHighlight.textContent = bilingual(card.highlight || "Final generation", card.highlightJa);
  els.playerRoute.textContent = bilingual(card.routeFocus || player.routeLabel, card.routeFocusJa);
  els.playerCredit.innerHTML = buildPhotoCredit(player.photoCredit);
}

function hidePlayerCard() {
  els.playerCard.hidden = true;
  els.playerCard.style.removeProperty("--player-color");
  els.playerPhoto.removeAttribute("src");
  els.playerPhoto.alt = "";
  els.playerCountry.textContent = "";
  els.playerRole.textContent = "";
  els.playerHighlight.textContent = "";
  els.playerRoute.textContent = "";
  els.playerCredit.textContent = "";
}

function buildPhotoCredit(credit) {
  if (!credit) return "";

  const source = escapeAttribute(credit.source);
  const licenseUrl = escapeAttribute(credit.licenseUrl);
  const author = escapeHTML(credit.author);
  const license = escapeHTML(credit.license);
  const title = escapeHTML(credit.title);
  const note = credit.note ? ` <span>${escapeHTML(credit.note)}</span>` : "";

  return `Photo: <a href="${source}" target="_blank" rel="noopener">${author}</a> / <a href="${licenseUrl}" target="_blank" rel="noopener">${license}</a><span class="credit-title">${title}</span>${note}`;
}

function setStatus(text) {
  els.status.textContent = text;
}

function bilingual(en, ja) {
  return ja ? `${en}\n${ja}` : en;
}

function applySceneChrome(scene) {
  els.opening.classList.toggle("is-hidden", !scene.showOpening);
  els.finalCard.classList.toggle("is-visible", Boolean(scene.finalText));
  els.app.classList.toggle("is-finale", Boolean(scene.fadeToBlack || scene.finalText));

  if (!scene.fadeToBlack && !scene.finalText) {
    els.blackout.classList.remove("is-visible");
  }
}

function showPopup(coordinates, title, copy) {
  closePopup();
  activePopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 20,
    maxWidth: "280px"
  })
    .setLngLat(coordinates)
    .setHTML(
      `<p class="popup-name">${escapeHTML(title)}</p><p class="popup-copy">${formatPopupText(copy)}</p>`
    )
    .addTo(map);
}

function closePopup() {
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

function formatPopupText(value) {
  return escapeHTML(value).replace(/\n/g, "<br>");
}

function flyToCamera(camera) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    map.once("moveend", finish);
    window.setTimeout(finish, (camera.duration || 0) + 800);
    map.flyTo({
      center: camera.center,
      zoom: camera.zoom,
      pitch: camera.pitch,
      bearing: camera.bearing,
      duration: camera.duration,
      curve: camera.curve || 1.25,
      essential: true
    });
  });
}

function waitForMapIdle(timeout = MAP_IDLE_TIMEOUT) {
  return new Promise((resolve) => {
    if (map.loaded() && (!map.areTilesLoaded || map.areTilesLoaded())) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    map.once("idle", finish);
    window.setTimeout(finish, timeout);
  });
}

async function flyToCameraAndSettle(camera) {
  set3DBuildingsForCamera(camera);
  await flyToCamera(camera);
  await waitForMapIdle(camera.idleTimeout || MAP_IDLE_TIMEOUT);
}

function set3DBuildingsForCamera(camera) {
  if (!map.getLayer(BUILDING_LAYER_ID)) return;

  const shouldShow =
    (camera.zoom ?? map.getZoom()) >= BUILDING_VISIBILITY_ZOOM &&
    (camera.pitch ?? map.getPitch()) >= 55;

  map.setLayoutProperty(BUILDING_LAYER_ID, "visibility", shouldShow ? "visible" : "none");
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function routeCoordinates(player) {
  return player.route.map((stop) => stop.coordinates);
}

function finalApproachCoordinates(player) {
  const finalStop = player.route[player.route.length - 1];
  return [finalStop.coordinates, finalVenue.coordinates];
}

function revealFullNetwork() {
  players.forEach((player) => {
    setSourceLine(careerSourceId(player.id), routeCoordinates(player), 100);
    setSourceLine(convergenceSourceId(player.id), finalApproachCoordinates(player), 100);
  });
}

function animateRoute(sourceId, coordinates, duration, label) {
  const metrics = buildLineMetrics(coordinates);
  return animateProgress(duration, (progress) => {
    setSourceLine(sourceId, partialLine(metrics, progress), progress);
    setStatus(`${label} ${Math.round(progress)}%`);
  });
}

function animateConvergence(duration) {
  const lines = players.map((player) => ({
    player,
    sourceId: convergenceSourceId(player.id),
    metrics: buildLineMetrics(finalApproachCoordinates(player))
  }));

  // One shared progress value drives every final approach. That keeps all four
  // lines arriving at MetLife Stadium at the exact same moment despite distance.
  return animateProgress(duration, (progress) => {
    lines.forEach(({ sourceId, metrics }) => {
      setSourceLine(sourceId, partialLine(metrics, progress), progress);
    });
    setStatus(`Convergence ${Math.round(progress)}%`);
  });
}

function animateProgress(duration, onProgress) {
  const startedAt = performance.now();

  return new Promise((resolve) => {
    function frame(now) {
      const rawProgress = Math.min((now - startedAt) / duration, 1);
      const progress = easeInOutCubic(rawProgress) * 100;

      onProgress(progress);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(frame);
      } else {
        animationFrame = null;
        onProgress(100);
        resolve();
      }
    }

    animationFrame = requestAnimationFrame(frame);
  });
}

function buildLineMetrics(coordinates) {
  const segments = [];
  let total = 0;

  for (let index = 1; index < coordinates.length; index += 1) {
    const from = coordinates[index - 1];
    const to = coordinates[index];
    const distance = haversineKm(from, to);

    segments.push({
      from,
      to,
      distance,
      start: total,
      end: total + distance
    });

    total += distance;
  }

  return { coordinates, segments, total };
}

function partialLine(metrics, progressPercent) {
  if (metrics.coordinates.length < 2) return metrics.coordinates;
  if (progressPercent <= 0 || metrics.total === 0) {
    return [metrics.coordinates[0], metrics.coordinates[0]];
  }
  if (progressPercent >= 100) return metrics.coordinates.slice();

  const targetDistance = metrics.total * (progressPercent / 100);
  const partialCoordinates = [metrics.coordinates[0]];

  for (const segment of metrics.segments) {
    if (targetDistance >= segment.end) {
      partialCoordinates.push(segment.to);
      continue;
    }

    const localDistance = targetDistance - segment.start;
    const ratio = clamp(localDistance / segment.distance, 0, 1);
    partialCoordinates.push(interpolateCoordinate(segment.from, segment.to, ratio));
    break;
  }

  return partialCoordinates.length > 1
    ? partialCoordinates
    : [metrics.coordinates[0], metrics.coordinates[0]];
}

function interpolateCoordinate(from, to, ratio) {
  return [
    from[0] + (to[0] - from[0]) * ratio,
    from[1] + (to[1] - from[1]) * ratio
  ];
}

function haversineKm(from, to) {
  const earthRadiusKm = 6371;
  const lat1 = degreesToRadians(from[1]);
  const lat2 = degreesToRadians(to[1]);
  const deltaLat = degreesToRadians(to[1] - from[1]);
  const deltaLng = degreesToRadians(to[0] - from[0]);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

async function playStory() {
  if (isPlaying) return;

  const token = ++playbackToken;
  isPlaying = true;
  els.start.disabled = true;
  els.replay.disabled = true;

  if (animationFrame) cancelAnimationFrame(animationFrame);
  resetStory();

  for (let index = 0; index < scenes.length; index += 1) {
    if (!isPlaybackActive(token)) return;

    const scene = scenes[index];
    updatePanel(scene, index);
    applySceneChrome(scene);
    closePopup();
    setStatus(`Scene ${index + 1}`);

    if (scene.before) scene.before();
    await flyToCameraAndSettle(scene.camera);
    if (!isPlaybackActive(token)) return;

    if (scene.popup && !scene.popupAfterAnimation) {
      showPopup(scene.popup.coordinates, scene.popup.title, scene.popup.description);
    }

    if (scene.routeAnimation) {
      await wait(scene.preAnimationHold || 400);
      if (!isPlaybackActive(token)) return;
      await animateRoute(
        scene.routeAnimation.sourceId,
        scene.routeAnimation.coordinates,
        scene.routeAnimation.duration,
        scene.routeAnimation.label
      );
      if (!isPlaybackActive(token)) return;
    }

    if (scene.convergenceAnimation) {
      await wait(scene.preAnimationHold || 500);
      if (!isPlaybackActive(token)) return;
      await animateConvergence(scene.convergenceAnimation.duration);
      if (!isPlaybackActive(token)) return;
    }

    if (scene.stadiumTour) {
      await playStadiumTour(scene.stadiumTour);
      if (!isPlaybackActive(token)) return;
    }

    if (scene.afterAnimationCamera && !scene.stadiumTour) {
      await wait(350);
      if (!isPlaybackActive(token)) return;
      await flyToCameraAndSettle(scene.afterAnimationCamera);
      if (!isPlaybackActive(token)) return;
    }

    if (scene.popupAfterAnimation) {
      showPopup(
        scene.popupAfterAnimation.coordinates,
        scene.popupAfterAnimation.title,
        scene.popupAfterAnimation.description
      );
    }

    if (scene.fadeToBlack) {
      els.blackout.classList.add("is-visible");
    }

    if (scene.finalText) {
      els.finalCard.classList.add("is-visible");
    }

    await wait(scene.hold ?? DEFAULT_HOLD);
    if (!isPlaybackActive(token)) return;
  }

  isPlaying = false;
  els.start.disabled = false;
  els.replay.disabled = false;
  setStatus("Complete");
}

function isPlaybackActive(token) {
  return isPlaying && token === playbackToken;
}

async function playStadiumTour(stops) {
  for (let index = 0; index < stops.length; index += 1) {
    const stop = stops[index];
    setStatus(`Stadium ${index + 1} / ${stops.length}`);
    await flyToCameraAndSettle({
      center: stop.coordinates,
      zoom: stop.zoom || 15.35,
      pitch: stop.pitch || 76,
      bearing: stop.bearing,
      duration: stop.duration || 2500,
      curve: 1.05
    });
    showPopup(
      stop.coordinates,
      stop.stadium,
      `${stop.club}\n${stop.city}`
    );
    await wait(stop.hold || STADIUM_STOP_HOLD);
  }
}

function birthplaceScene(player, orderTitle, camera) {
  return {
    id: `${player.id}-birthplace`,
    title: orderTitle,
    meta: `${player.name} | ${player.birthplace.name}`,
    description: bilingual(player.birthplace.description, player.birthplace.descriptionJa),
    player,
    camera,
    popup: {
      coordinates: player.birthplace.coordinates,
      title: `${player.name} - ${player.birthplace.name}`,
      description: bilingual(player.birthplace.description, player.birthplace.descriptionJa)
    },
    hold: BIRTHPLACE_HOLD
  };
}

function routeScene(player, orderTitle, camera, description, descriptionJa, finalCamera = {}) {
  const finalStop = player.route[player.route.length - 1];

  return {
    id: `${player.id}-route`,
    title: orderTitle,
    meta: bilingual(player.routeLabel, player.routeLabelJa),
    description: bilingual(description, descriptionJa),
    player,
    camera,
    routeAnimation: {
      sourceId: careerSourceId(player.id),
      coordinates: routeCoordinates(player),
      duration: ROUTE_DURATION,
      label: `${player.shortName} route`
    },
    stadiumTour: stadiumTourStops(player, camera.bearing),
    popupAfterAnimation: {
      coordinates: finalStop.coordinates,
      title: `${player.name} route complete`,
      description: bilingual(
        `Career route: ${player.routeLabel}.`,
        `キャリアルート：${player.routeLabelJa}`
      )
    },
    afterAnimationCamera: {
      center: finalStop.coordinates,
      zoom: finalCamera.zoom || 13.2,
      pitch: finalCamera.pitch || 74,
      bearing: finalCamera.bearing || camera.bearing,
      duration: finalCamera.duration || 3200
    },
    hold: ROUTE_COMPLETE_HOLD
  };
}

function destinationName(stop) {
  return stop.stadium || stop.name;
}

function stadiumTourStops(player, baseBearing) {
  return player.route
    .filter((stop) => stop.stadium)
    .map((stop, index) => ({
      city: stop.name,
      club: stop.role,
      stadium: stop.stadium,
      coordinates: stop.coordinates,
      zoom: stadiumZoom(stop),
      pitch: 76,
      bearing: baseBearing + (index % 2 === 0 ? 24 : -24),
      duration: 2400,
      hold: STADIUM_STOP_HOLD
    }));
}

function stadiumZoom(stop) {
  if (stop.stadium === "Nu Stadium" || stop.stadium === "Kingdom Arena") return 15.8;
  if (stop.stadium === "Spotify Camp Nou" || stop.stadium === "San Siro") return 15.65;
  return 15.45;
}

function getPlayer(id) {
  return players.find((player) => player.id === id);
}

const messi = getPlayer("messi");
const ronaldo = getPlayer("ronaldo");
const neymar = getPlayer("neymar");
const modric = getPlayer("modric");

const networkCamera = {
  center: [-31, 31],
  zoom: 1.3,
  pitch: 46,
  bearing: -26,
  duration: 5200
};

const scenes = [
  {
    id: "opening",
    title: "The Final Generation",
    meta: "Opening | Earth from space",
    description: bilingual(
      "Four legends. Four nations. One last World Cup horizon.",
      "4人のレジェンド、4つの国、そして最後になるかもしれないワールドカップへ。"
    ),
    camera: { center: [-36, 22], zoom: 1.08, pitch: 48, bearing: -22, duration: 4200 },
    showOpening: true,
    before: resetLines,
    hold: 2500
  },

  birthplaceScene(messi, "Messi Birthplace", {
    center: [-60.6393, -32.9442],
    zoom: 13.4,
    pitch: 74,
    bearing: -38,
    duration: 5200
  }),

  routeScene(
    messi,
    "Messi Route",
    { center: [-35, 19], zoom: 2.18, pitch: 52, bearing: -32, duration: 4800 },
    "Newell's Old Boys, FC Barcelona, Paris Saint-Germain, and Inter Miami CF form the arc of a career that changed football.",
    "ニューウェルズ・オールドボーイズ、FCバルセロナ、パリ・サンジェルマン、インテル・マイアミCF。サッカー史を変えたキャリアの軌跡です。",
    { zoom: 13.9, pitch: 75, bearing: -54 }
  ),

  birthplaceScene(ronaldo, "Ronaldo Birthplace", {
    center: [-16.9241, 32.6669],
    zoom: 13.5,
    pitch: 74,
    bearing: 42,
    duration: 5200
  }),

  routeScene(
    ronaldo,
    "Ronaldo Route",
    { center: [13, 39], zoom: 2.25, pitch: 52, bearing: 20, duration: 5000 },
    "CD Nacional, Sporting CP, Manchester United, Real Madrid, Juventus, and Al Nassr trace a career built on constant reinvention.",
    "CDナシオナル、スポルティングCP、マンチェスター・ユナイテッド、レアル・マドリード、ユヴェントス、アル・ナスル。挑戦を続けた道のりです。",
    { zoom: 13.6, pitch: 75, bearing: 38 }
  ),

  birthplaceScene(neymar, "Neymar Birthplace", {
    center: [-46.1857, -23.5208],
    zoom: 13.45,
    pitch: 74,
    bearing: -34,
    duration: 5200
  }),

  routeScene(
    neymar,
    "Neymar Route",
    { center: [-11, 12], zoom: 2.08, pitch: 52, bearing: -18, duration: 5000 },
    "Santos FC, FC Barcelona, Paris Saint-Germain, Al Hilal, and Santos FC again trace the path of Brazil's modern star.",
    "サントスFC、FCバルセロナ、パリ・サンジェルマン、アル・ヒラル、そして再びサントスFCへ。ブラジルの現代的スターの軌跡です。",
    { zoom: 13.6, pitch: 75, bearing: -42 }
  ),

  birthplaceScene(modric, "Modri\u0107 Birthplace", {
    center: [15.2322, 44.1194],
    zoom: 13.65,
    pitch: 74,
    bearing: 34,
    duration: 5200
  }),

  routeScene(
    modric,
    "Modri\u0107 Route",
    { center: [5.5, 45], zoom: 3.5, pitch: 55, bearing: -16, duration: 4700 },
    "NK Zadar, Dinamo Zagreb, Tottenham Hotspur, Real Madrid, and AC Milan chart the path of Croatia's midfield standard.",
    "NKザダル、ディナモ・ザグレブ、トッテナム・ホットスパー、レアル・マドリード、ACミラン。クロアチアの司令塔が世界へ進んだ道です。",
    { zoom: 14.0, pitch: 75, bearing: 32 }
  ),

  {
    id: "final-convergence",
    title: "Final Convergence",
    meta: bilingual(`Four final stadiums \u2192 ${finalVenue.name}`, `4つの最終スタジアム → ${finalVenue.name}`),
    description: bilingual(
      "Nu Stadium, Al-Awwal Park, Vila Belmiro, and San Siro launch their final lines toward New Jersey together.",
      "Nu Stadium、Al-Awwal Park、Vila Belmiro、San Siroから、4本の線が同時にニュージャージーへ向かいます。"
    ),
    camera: { center: [-26, 38], zoom: 1.7, pitch: 50, bearing: -42, duration: 5200 },
    popup: {
      coordinates: finalVenue.coordinates,
      title: finalVenue.name,
      description: bilingual(finalVenue.description, finalVenue.descriptionJa)
    },
    convergenceAnimation: { duration: CONVERGENCE_DURATION },
    hold: CONVERGENCE_HOLD
  },

  {
    id: "full-network",
    title: "Full Route Network",
    meta: bilingual("The map of an era", "一つの時代を描く地図"),
    description: bilingual(
      "Every birthplace, landmark, career route, and final approach remains visible before the lights fall.",
      "出生地、ランドマーク、キャリアのルート、最後の集結線が一枚の地図に残ります。"
    ),
    camera: networkCamera,
    before: revealFullNetwork,
    popup: {
      coordinates: finalVenue.coordinates,
      title: "All roads meet",
      description: bilingual(
        "The full route network converges at MetLife Stadium.",
        "すべてのルートがメットライフ・スタジアムで交わります。"
      )
    },
    hold: NETWORK_HOLD
  },

  {
    id: "final-stadium",
    title: "MetLife Stadium",
    meta: bilingual("Final venue close-up", "決勝スタジアムへ"),
    description: bilingual(
      "Before the final title, the camera moves in on the stadium where the last road ends.",
      "最後の文字が出る前に、すべての道がたどり着く決勝スタジアムへ寄っていきます。"
    ),
    camera: {
      center: finalVenue.coordinates,
      zoom: 16.05,
      pitch: 76,
      bearing: -34,
      duration: 5600
    },
    popup: {
      coordinates: finalVenue.coordinates,
      title: finalVenue.name,
      description: bilingual(finalVenue.description, finalVenue.descriptionJa)
    },
    hold: FINAL_STADIUM_HOLD
  },

  {
    id: "fade-to-black",
    title: "Fade to Black",
    meta: bilingual("Trailer end card", "物語の終幕"),
    description: bilingual(
      "The map disappears. The final chapter is left waiting.",
      "地図が暗転し、最後の章だけが静かに残ります。"
    ),
    camera: { ...networkCamera, duration: 1200 },
    fadeToBlack: true,
    hold: 2600
  },

  {
    id: "last-dance",
    title: "The Last Dance Begins",
    meta: bilingual("Final text", "最後のメッセージ"),
    description: bilingual(
      "The final message remains after the world fades away.",
      "世界がフェードアウトしたあと、最後の言葉が浮かび上がります。"
    ),
    camera: { ...networkCamera, duration: 0 },
    finalText: true,
    hold: 4200
  }
];
