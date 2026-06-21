// Performance tuning for the published MapLibre story.
// Loaded once before script.js to capture the map instance, then again after
// script.js to wrap camera movement with a bounded idle wait.
(() => {
  const state = window.__storyPerformanceTuning || (window.__storyPerformanceTuning = {});
  const BUILDING_LAYER_ID = "world-cup-3d-buildings";
  const BUILDING_VISIBILITY_ZOOM = 13;
  const MAP_IDLE_TIMEOUT = 1800;

  function waitForMapIdle(map, timeout = MAP_IDLE_TIMEOUT) {
    return new Promise((resolve) => {
      if (!map) {
        resolve();
        return;
      }

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

  function set3DBuildingsForCamera(map, camera = {}) {
    if (!map || !map.getLayer(BUILDING_LAYER_ID)) return;

    const shouldShow =
      (camera.zoom ?? map.getZoom()) >= BUILDING_VISIBILITY_ZOOM &&
      (camera.pitch ?? map.getPitch()) >= 55;

    map.setLayoutProperty(BUILDING_LAYER_ID, "visibility", shouldShow ? "visible" : "none");
  }

  if (window.maplibregl && window.maplibregl.Map && !state.preloadInstalled) {
    const BaseMap = window.maplibregl.Map;

    class StoryMap extends BaseMap {
      constructor(...args) {
        super(...args);
        window.__storyMap = this;
      }
    }

    Object.setPrototypeOf(StoryMap, BaseMap);
    StoryMap.prototype = BaseMap.prototype;
    window.maplibregl.Map = StoryMap;

    const originalAddLayer = BaseMap.prototype.addLayer;
    BaseMap.prototype.addLayer = function addLayerWithBuildingDefault(layer, ...args) {
      if (layer && layer.id === BUILDING_LAYER_ID) {
        layer.layout = { ...(layer.layout || {}), visibility: "none" };
      }
      return originalAddLayer.call(this, layer, ...args);
    };

    const originalFlyTo = BaseMap.prototype.flyTo;
    BaseMap.prototype.flyTo = function flyToWithBuildingVisibility(options = {}) {
      set3DBuildingsForCamera(this, options);
      return originalFlyTo.call(this, options);
    };

    state.preloadInstalled = true;
  }

  if (typeof flyToCamera === "function" && !state.postloadInstalled) {
    const originalFlyToCamera = flyToCamera;

    flyToCamera = async function flyToCameraAndWaitForTiles(camera) {
      const map = window.__storyMap;
      set3DBuildingsForCamera(map, camera);
      await originalFlyToCamera(camera);
      await waitForMapIdle(map, camera?.idleTimeout || MAP_IDLE_TIMEOUT);
    };

    state.postloadInstalled = true;
  }
})();