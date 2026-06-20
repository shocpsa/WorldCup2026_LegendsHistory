(() => {
  const sceneTrack = document.querySelector("#scene-track");
  if (!sceneTrack || typeof scenes === "undefined") return;

  let ready = false;

  function buildSceneNav() {
    sceneTrack.innerHTML = "";

    scenes.forEach((scene, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scene-jump";
      button.textContent = String(index + 1);
      button.title = `${index + 1}. ${scene.title}`;
      button.setAttribute("aria-label", `Go to scene ${index + 1}: ${scene.title}`);
      button.addEventListener("click", () => handleJumpRequest(index));
      sceneTrack.append(button);
    });

    setActiveScene(0);
  }

  function setActiveScene(index) {
    Array.from(sceneTrack.children).forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "step" : "false");
    });
  }

  const originalUpdatePanel = updatePanel;
  updatePanel = function patchedUpdatePanel(scene, index) {
    originalUpdatePanel(scene, index);
    setActiveScene(index);
  };

  function handleJumpRequest(index) {
    if (typeof isPlaying !== "undefined" && isPlaying) {
      window.location.hash = `scene-${index + 1}`;
      window.location.reload();
      return;
    }

    jumpToScene(index);
  }

  async function jumpToScene(index) {
    if (!ready) return;

    if (typeof animationFrame !== "undefined" && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (typeof isPlaying !== "undefined") isPlaying = false;
    map.stop();
    document.querySelector("#start-button").disabled = false;
    document.querySelector("#replay-button").disabled = false;

    const scene = scenes[index];
    resetStory();
    prepareRoutesForScene(index);
    updatePanel(scene, index);
    applySceneChrome(scene);
    closePopup();
    setStatus(`Scene ${index + 1}`);

    if (scene.fadeToBlack || scene.finalText) {
      document.querySelector("#blackout").classList.add("is-visible");
    }

    await flyToCamera({
      ...scene.camera,
      duration: Math.min(scene.camera.duration || 0, 1800),
      curve: 1.08
    });

    const popup = scene.popupAfterAnimation || scene.popup;
    if (popup && !scene.finalText) {
      showPopup(popup.coordinates, popup.title, popup.description);
    }
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

  function readHashSceneIndex() {
    const match = window.location.hash.match(/^#scene-(\d+)$/);
    if (!match) return null;

    const index = Number(match[1]) - 1;
    return index >= 0 && index < scenes.length ? index : null;
  }

  function initSceneNav() {
    ready = true;
    buildSceneNav();

    const hashIndex = readHashSceneIndex();
    if (hashIndex !== null) {
      window.setTimeout(() => jumpToScene(hashIndex), 250);
    }
  }

  if (typeof map.loaded === "function" && map.loaded()) {
    initSceneNav();
  } else {
    map.on("load", initSceneNav);
  }
})();
