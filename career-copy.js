// Public-page override for route scene descriptions.
// Loaded after script.js so it can adjust the reusable scene objects.
(() => {
  if (typeof scenes === "undefined") return;

  const bilingualLine = (en, ja) => (ja ? `${en}\n${ja}` : en);
  const routeCopy = {
    "messi-route": {
      en: "Newell's Old Boys, FC Barcelona, Paris Saint-Germain, and Inter Miami CF form the arc of a career that changed football.",
      ja: "ニューウェルズ・オールドボーイズ、FCバルセロナ、パリ・サンジェルマン、インテル・マイアミCF。サッカー史を変えたキャリアの軌跡です。"
    },
    "ronaldo-route": {
      en: "CD Nacional, Sporting CP, Manchester United, Real Madrid, Juventus, and Al Nassr trace a career built on constant reinvention.",
      ja: "CDナシオナル、スポルティングCP、マンチェスター・ユナイテッド、レアル・マドリード、ユヴェントス、アル・ナスル。挑戦を続けた道のりです。"
    },
    "neymar-route": {
      en: "Santos FC, FC Barcelona, Paris Saint-Germain, Al Hilal, and Santos FC again trace the path of Brazil's modern star.",
      ja: "サントスFC、FCバルセロナ、パリ・サンジェルマン、アル・ヒラル、そして再びサントスFCへ。ブラジルの現代的スターの軌跡です。"
    },
    "modric-route": {
      en: "NK Zadar, Dinamo Zagreb, Tottenham Hotspur, Real Madrid, and AC Milan chart the path of Croatia's midfield standard.",
      ja: "NKザダル、ディナモ・ザグレブ、トッテナム・ホットスパー、レアル・マドリード、ACミラン。クロアチアの司令塔が世界へ進んだ道です。"
    }
  };

  scenes.forEach((scene) => {
    const copy = routeCopy[scene.id];
    if (!copy || !scene.player) return;

    scene.meta = bilingualLine(scene.player.routeLabel, scene.player.routeLabelJa);
    scene.description = bilingualLine(copy.en, copy.ja);

    if (scene.popupAfterAnimation) {
      scene.popupAfterAnimation.description = bilingualLine(
        `Career route: ${scene.player.routeLabel}.`,
        `キャリアルート：${scene.player.routeLabelJa}`
      );
    }
  });

  const finalConvergence = scenes.find((scene) => scene.id === "final-convergence");
  if (finalConvergence) {
    finalConvergence.description = bilingualLine(
      "From Nu Stadium, Al-Awwal Park, Vila Belmiro, and San Siro, four legends make their way to New Jersey.",
      "Nu Stadium、Al-Awwal Park、Vila Belmiro、San Siroから、4人のレジェンドがにニュージャージーへ向かいます。"
    );
  }
})();
