var themesCollection = [];

function fixit() {
  if (themesCollection.length) return;

  var supplydrop = document.getElementById('supplydrop');
  supplydrop.classList.add('swing-animation');

  setTimeout(function() {
    supplydrop.style.cursor = 'pointer';
    supplydrop.onclick = function () {
      var crateOpenOverlay = document.getElementById('crate-open-overlay');
      crateOpenOverlay.classList.add('fade-in');
      crateOpenOverlay.style.display = 'block';
      
      supplydrop.classList.add('fade-out');

      setTimeout(function() {
        supplydrop.parentNode.removeChild(supplydrop);
      }, 1000);

      const spinner = new Spinner(document.getElementById('spinner'));
    }
  }, 4000);

  var nothemes = document.getElementById('nothemes');
  nothemes.classList.add('fade-out');

  setTimeout(function() {
    nothemes.parentNode.removeChild(nothemes);
  }, 1000);
}

class Spinner {
  constructor(domElement) {
    Card.preload();

    this.currentCards = [
      Card.random(),
      Card.random(),
      Card.random()
    ]

    this.nextCards = [
      Card.random(),
      Card.random(),
      Card.random()
    ]

    this.container = domElement;

    const reelContainer = document.getElementById('reel');
    this.reel = new Reel(reelContainer, this.currentCards);

    this.spin();
  }

  spin() {
    this.onSpinStart();

    this.currentCards = this.nextCards;
    this.nextCards = [
      Card.random(),
      Card.random(),
      Card.random()
    ];

    return Promise.all(
      [this.reel].map((reel) => {
        this.reel.renderCards(this.nextCards);
        return reel.spin();
      })
    ).then(() => this.onSpinEnd());
  }

  onSpinStart() {}

  onSpinEnd() {
    const card = new Card(); // winning card

    const openCrateOverlay = document.getElementById('crate-open-overlay');
    const winScreen = new WinScreen(card);
    openCrateOverlay.appendChild(winScreen.node);

    const openCrateInner = document.getElementById('crate-open-inner');
    openCrateInner.classList.add('fade-out');
    setTimeout(function() {
      openCrateInner.parentNode.removeChild(openCrateInner);
    }, 1000);

    themesCollection.push(card.theme);
  }
}

class Reel {
  constructor(container, initialCards) {
    this.factor = 5;
    this.container = container;

    this.animation = this.container.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        { filter: 'blur(1px)', offset: 0.5 },
        {
          transform: `translateX(-${
            ((Math.floor(this.factor) * 10) / (3 + Math.floor(this.factor) * 10) * 400)
            }%)`,
          filter: 'blur(0)'
        }
      ],
      {
        duration: this.factor * 1000,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );

    this.animation.cancel();

    var that = this;
    initialCards.forEach(function(card) {
      var themeCard = that.createThemeCardElement(card);
      that.container.appendChild(themeCard);
    });
  }

  renderCards(nextCards) {
    for (let i = 3; i < 3 + Math.floor(this.factor) * 10; i++) {
      const next = nextCards[i - Math.floor(this.factor) * 10];
      const card = new Card(
        i >= 10 * Math.floor(this.factor) - 2
          ? (next ? next.theme : undefined)
          : undefined
      );

      var themeCard = this.createThemeCardElement(card);
      this.container.appendChild(themeCard);
    }
  }

  spin() {
    const animationPromise = new Promise(
      (resolve) => (this.animation.onfinish = resolve)
    );
    const timeoutPromise = new Promise(
      (resolve) => setTimeout(resolve, this.factor * 1000)
    );

    this.animation.play();

    return Promise.race([animationPromise, timeoutPromise]).then(() => {
      if (this.animation.playState !== 'finished') this.animation.finish();
    });
  }

  createThemeCardElement(card) {
    var elem = document.createElement('div');
    elem.classList.add('theme-card');

    var title = document.createElement('div');
    title.innerHTML = card.theme.name;

    elem.appendChild(card.img);
    elem.appendChild(title);

    return elem;
  }
}

const cache = {};

class Card {
  constructor(theme = Theme.random()) {
    this.theme = theme;

    if (cache[this.theme.name]) {
      this.img = cache[this.theme.name].cloneNode();
    } else {
      this.img = new Image();
      this.img.src = this.theme.imageSource;

      cache[this.theme.name] = this.img;
    }
  }

  static preload() {
    Theme.allThemes.forEach((theme) => new Card(theme));
  }

  static random() {
    return new Card();
  }
}

class WinScreen {
  constructor(card) {
    this.card = card;
    this.node = this.buildDomElement();
  }

  buildDomElement() {
    var overlay = document.createElement('div');
    overlay.classList.add('winscreen-overlay');

    var title = document.createElement('div');
    title.innerHTML = '<h1>' + this.card.theme.name + '</h1>';
    title.classList.add('winscreen-title');

    var image = this.card.img;
    image.classList.add('winscreen-image');
    image.onclick = () => this.dismiss();

    overlay.appendChild(title);
    overlay.appendChild(image);

    return overlay;
  }

  dismiss() {
    var crateOpenOverlay = document.getElementById('crate-open-overlay');
    crateOpenOverlay.classList.remove('fade-in');
    crateOpenOverlay.classList.add('fade-out');

    var that = this;
    setTimeout(function() {
      crateOpenOverlay.style.display = 'none';
      that.node.parentNode.removeChild(that.node);
      that = null;
    }, 1000);
  }
}

var ThemeRarity = {
  POOP: 1,
  COMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  EXCLUSIVE: 6
}

class Theme {
  name;
  collection;
  rarity;
  imageSource;
  fileSource;
  // dateReleased;
  // dateAcquired;

  constructor(name, collection, rarity, imageSource, fileSource) {
    this.name = name;
    this.collection = collection;
    this.rarity = rarity;
    this.imageSource = imageSource;
    this.fileSource = fileSource;
  }

  static get allThemes() {
    return [
      new Theme(
        'PoopSteve420',
        'Meme Stars',
        ThemeRarity.POOP,
        'https://i.imgur.com/XrtcXEo.jpg',
        ''
      ),
      new Theme(
        'GitHub+',
        'The Professional Developer',
        ThemeRarity.COMMON,
        'https://i.imgur.com/OF1nZ4C.jpg',
        ''
      ),
      new Theme(
        '808 State',
        'Cyber City',
        ThemeRarity.RARE,
        'https://i.imgur.com/aeroqs4.jpg',
        '',
      ),
      new Theme(
        'Hearthstone',
        'I\'d Rather Be Gaming',
        ThemeRarity.EPIC,
        'https://i.imgur.com/wjZvNND.png',
        ''
      ),
      new Theme(
        'IV - The Universe',
        'The Visions',
        ThemeRarity.LEGENDARY,
        'https://i.imgur.com/peEmGPS.jpg',
        ''
      )
    ];
  }

  static random() {
    return this.allThemes[Math.floor(Math.random() * this.allThemes.length)];
  }
}
