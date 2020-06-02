var collection = [];

function fixit() {
  if (collection.length) return;

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
      "death_star",
      "death_star",
      "death_star",
    ]

    this.nextCards = [
      "death_star",
      "death_star",
      "death_star",
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

    collection.add(card);
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
    initialCards.forEach(function(theme) {
      const card = new Card(theme);
      var themeCard = that.createThemeCardElement(card);
      that.container.appendChild(themeCard);
    });
  }

  renderCards(nextCards) {
    for (let i = 3; i < 3 + Math.floor(this.factor) * 10; i++) {
      const card = new Card(
        i >= 10 * Math.floor(this.factor) - 2
          ? nextCards[i - Math.floor(this.factor) * 10]
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
    title.innerHTML = card.name + ' constructor';

    elem.appendChild(card.img);
    elem.appendChild(title);

    return elem;
  }
}

const cache = {};

class Card {
  constructor(name = Card.random()) {
    this.name = name;

    if (cache[name]) {
      this.img = cache[name].cloneNode();
    } else {
      this.img = new Image();
      this.img.src = `../media/theme_preview_images/${name}.svg`;

      cache[name] = this.img;
    }
  }

  static preload() {
    Card.themes.forEach((theme) => new Card(theme));
  }

  static get themes() {
    return [
      "death_star",
      "falcon",
      "yoda"
    ];
  }

  static random() {
    return this.themes[Math.floor(Math.random() * this.themes.length)];
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
    title.innerHTML = '<h1>' + this.card.name + '</h1>';
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
