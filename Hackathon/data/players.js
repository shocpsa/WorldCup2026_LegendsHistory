// Shared story data. Coordinates use [longitude, latitude], the order MapLibre expects.
// Edit this file to change players, stops, landmark text, route colors, or photos.
// Put player portraits in assets/players/ and set photo, for example:
// photo: "./assets/players/messi.jpg"
window.FINAL_GENERATION_DATA = {
  finalVenue: {
    id: "metlife",
    name: "MetLife Stadium",
    city: "East Rutherford, New Jersey, USA",
    coordinates: [-74.0745, 40.8135],
    description: "The 2026 FIFA World Cup final destination, where every road in this story meets.",
    descriptionJa: "2026年FIFAワールドカップ決勝の舞台。この物語のすべての道がここで交わります。"
  },

  players: [
    {
      id: "messi",
      name: "Lionel Messi",
      shortName: "Messi",
      country: "Argentina",
      color: "#0072ce",
      photo: "./assets/players/Messi.jpg",
      photoCredit: {
        title: "2026 Lionel Messi (cropped).jpg",
        author: "The White House / Daniel Torok",
        source: "https://commons.wikimedia.org/wiki/File:2026_Lionel_Messi_(cropped).jpg",
        license: "Public Domain Mark 1.0",
        licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
        note: "Cropped on Wikimedia Commons; displayed cropped."
      },
      card: {
        countryJa: "アルゼンチン",
        role: "Argentina captain",
        roleJa: "アルゼンチンの象徴",
        highlight: "World Cup champion, 2022",
        highlightJa: "2022年ワールドカップ優勝",
        routeFocus: "Rosario to Miami",
        routeFocusJa: "ロサリオからマイアミへ"
      },
      landmark: {
        name: "Obelisco de Buenos Aires",
        role: "Argentina landmark",
        coordinates: [-58.3816, -34.6037],
        description: "A national gathering point in Buenos Aires, lit here as the Argentine chapter begins.",
        descriptionJa: "ブエノスアイレスの象徴的な広場。アルゼンチン編はここから幕を開けます。"
      },
      birthplace: {
        name: "Rosario",
        role: "Birthplace",
        coordinates: [-60.6393, -32.9442],
        description: "The river city where Lionel Messi's football life began.",
        descriptionJa: "リオ・パラナ沿いの街。リオネル・メッシのサッカー人生が始まった場所です。"
      },
      routeLabel: "Rosario \u2192 Barcelona \u2192 Paris \u2192 Miami",
      routeLabelJa: "ロサリオ → バルセロナ → パリ → マイアミ",
      route: [
        { name: "Rosario", role: "Birthplace", coordinates: [-60.6393, -32.9442] },
        {
          name: "Barcelona",
          role: "FC Barcelona",
          stadium: "Spotify Camp Nou",
          coordinates: [2.1228, 41.3809]
        },
        {
          name: "Paris",
          role: "Paris Saint-Germain",
          stadium: "Parc des Princes",
          coordinates: [2.253, 48.8414]
        },
        {
          name: "Miami",
          role: "Inter Miami",
          stadium: "Nu Stadium",
          coordinates: [-80.2596, 25.793]
        }
      ]
    },

    {
      id: "ronaldo",
      name: "Cristiano Ronaldo",
      shortName: "Ronaldo",
      country: "Portugal",
      color: "#c1121f",
      photo: "./assets/players/Ronaldo.webp",
      photoCredit: {
        title: "2025 Cristiano Ronaldo (cropped).jpg",
        author: "The White House / Daniel Torok",
        source: "https://commons.wikimedia.org/wiki/File:2025_Cristiano_Ronaldo_(cropped).jpg",
        license: "Public Domain Mark 1.0",
        licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
        note: "Cropped on Wikimedia Commons; displayed cropped."
      },
      card: {
        countryJa: "ポルトガル",
        role: "Portugal icon",
        roleJa: "ポルトガルの絶対的レジェンド",
        highlight: "A final shot at the trophy",
        highlightJa: "最後の頂点を狙う物語",
        routeFocus: "Madeira to Riyadh",
        routeFocusJa: "マデイラからリヤドへ"
      },
      landmark: {
        name: "Bel\u00e9m Tower",
        role: "Portugal landmark",
        coordinates: [-9.2159, 38.6916],
        description: "Lisbon's riverfront monument frames the start of Portugal's chapter.",
        descriptionJa: "リスボンの川沿いに立つ歴史的な塔。ポルトガル編の出発点です。"
      },
      birthplace: {
        name: "Funchal",
        role: "Birthplace",
        coordinates: [-16.9241, 32.6669],
        description: "Madeira's capital, where Cristiano Ronaldo's path first took shape.",
        descriptionJa: "マデイラ島の中心都市。クリスティアーノ・ロナウドの原点です。"
      },
      routeLabel: "Funchal \u2192 Lisbon \u2192 Manchester \u2192 Madrid \u2192 Turin \u2192 Riyadh",
      routeLabelJa: "フンシャル → リスボン → マンチェスター → マドリード → トリノ → リヤド",
      route: [
        { name: "Funchal", role: "Birthplace", coordinates: [-16.9241, 32.6669] },
        {
          name: "Lisbon",
          role: "Sporting CP",
          stadium: "Estadio Jose Alvalade",
          coordinates: [-9.1608, 38.7612]
        },
        {
          name: "Manchester",
          role: "Manchester United",
          stadium: "Old Trafford",
          coordinates: [-2.2913, 53.4631]
        },
        {
          name: "Madrid",
          role: "Real Madrid",
          stadium: "Santiago Bernabeu",
          coordinates: [-3.6883, 40.4531]
        },
        {
          name: "Turin",
          role: "Juventus",
          stadium: "Allianz Stadium",
          coordinates: [7.6413, 45.1096]
        },
        {
          name: "Riyadh",
          role: "Al Nassr",
          stadium: "Al-Awwal Park",
          coordinates: [46.6231, 24.7292]
        }
      ]
    },

    {
      id: "neymar",
      name: "Neymar Jr.",
      shortName: "Neymar",
      country: "Brazil",
      color: "#d99000",
      photo: "./assets/players/Neymar.jpg",
      photoCredit: {
        title: "Neymar Jr. with Al Hilal, 3 October 2023 - 01 (cropped).jpg",
        author: "Moghaddam Madadi / Tasnim News Agency",
        source: "https://commons.wikimedia.org/wiki/File:Neymar_Jr._with_Al_Hilal,_3_October_2023_-_01_(cropped).jpg",
        license: "CC BY 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        note: "Cropped on Wikimedia Commons; displayed cropped."
      },
      card: {
        countryJa: "ブラジル",
        role: "Brazil No. 10",
        roleJa: "ブラジルの10番",
        highlight: "Carrying the modern Brazil story",
        highlightJa: "現代ブラジルを背負うスター",
        routeFocus: "Santos roots to Riyadh",
        routeFocusJa: "サントスの原点からリヤドへ"
      },
      landmark: {
        name: "Christ the Redeemer",
        role: "Brazil landmark",
        coordinates: [-43.2105, -22.9519],
        description: "Rio de Janeiro's mountain icon opens Brazil's chapter.",
        descriptionJa: "リオデジャネイロを見下ろす巨大な像。ブラジル編を象徴するランドマークです。"
      },
      birthplace: {
        name: "Mogi das Cruzes",
        role: "Birthplace",
        coordinates: [-46.1857, -23.5208],
        description: "The S\u00e3o Paulo city where Neymar Jr.'s story started.",
        descriptionJa: "サンパウロ州の街。ネイマールJr.の物語が始まった場所です。"
      },
      routeLabel: "Mogi das Cruzes \u2192 Santos \u2192 Barcelona \u2192 Paris \u2192 Riyadh",
      routeLabelJa: "モジ・ダス・クルーゼス → サントス → バルセロナ → パリ → リヤド",
      route: [
        { name: "Mogi das Cruzes", role: "Birthplace", coordinates: [-46.1857, -23.5208] },
        {
          name: "Santos",
          role: "Santos FC",
          stadium: "Vila Belmiro",
          coordinates: [-46.3389, -23.9511]
        },
        {
          name: "Barcelona",
          role: "FC Barcelona",
          stadium: "Spotify Camp Nou",
          coordinates: [2.1228, 41.3809]
        },
        {
          name: "Paris",
          role: "Paris Saint-Germain",
          stadium: "Parc des Princes",
          coordinates: [2.253, 48.8414]
        },
        {
          name: "Riyadh",
          role: "Al Hilal",
          stadium: "Kingdom Arena",
          coordinates: [46.6056, 24.7756]
        }
      ]
    },

    {
      id: "modric",
      name: "Luka Modri\u0107",
      shortName: "Modri\u0107",
      country: "Croatia",
      color: "#ffffff",
      photo: "./assets/players/Modric.jpg",
      photoCredit: {
        title: "Ofrenda de la Liga y la Champions-57-L.Millan (52109310843) (Luka Modric).jpg",
        author: "Fotografias Archimadrid.es",
        source: "https://commons.wikimedia.org/wiki/File:Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_(52109310843)_(Luka_Modri%C4%87).jpg",
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
        note: "Cropped on Wikimedia Commons; displayed cropped."
      },
      card: {
        countryJa: "クロアチア",
        role: "Croatia captain",
        roleJa: "クロアチア黄金世代の司令塔",
        highlight: "Ballon d'Or winner, 2018",
        highlightJa: "2018年バロンドール受賞",
        routeFocus: "Zadar to Milan",
        routeFocusJa: "ザダルからミラノへ"
      },
      landmark: {
        name: "Dubrovnik Old Town",
        role: "Croatia landmark",
        coordinates: [18.0944, 42.6403],
        description: "Croatia's stone-walled coast sets the stage for its golden captain.",
        descriptionJa: "城壁に囲まれたアドリア海沿いの旧市街。クロアチア編の舞台を作ります。"
      },
      birthplace: {
        name: "Zadar",
        role: "Birthplace",
        coordinates: [15.2322, 44.1194],
        description: "The Adriatic city tied to Luka Modri\u0107's early life.",
        descriptionJa: "アドリア海に面した街。ルカ・モドリッチの歩みの原点です。"
      },
      routeLabel: "Zadar \u2192 Zagreb \u2192 London \u2192 Madrid \u2192 Milan",
      routeLabelJa: "ザダル → ザグレブ → ロンドン → マドリード → ミラノ",
      route: [
        { name: "Zadar", role: "Birthplace", coordinates: [15.2322, 44.1194] },
        {
          name: "Zagreb",
          role: "Dinamo Zagreb",
          stadium: "Stadion Maksimir",
          coordinates: [16.0189, 45.8187]
        },
        {
          name: "London",
          role: "Tottenham Hotspur",
          stadium: "White Hart Lane",
          coordinates: [-0.0664, 51.6043]
        },
        {
          name: "Madrid",
          role: "Real Madrid",
          stadium: "Santiago Bernabeu",
          coordinates: [-3.6883, 40.4531]
        },
        {
          name: "Milan",
          role: "AC Milan",
          stadium: "San Siro",
          coordinates: [9.1239, 45.4781]
        }
      ]
    }
  ]
};
