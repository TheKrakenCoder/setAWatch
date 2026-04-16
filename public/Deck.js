// In the deck, the bottom cards is [0] and the top card is [len-1]
// For spread out decks, the left card is [0] and the right is [len-1]
class Deck {
  constructor(deckIndex, setIndex, backIndex, cw, ch) {
    this.deckIndex = deckIndex; // index into m_decks (is this really needed?)
    this.setIndex = setIndex;   // index into m_setImages
    this.backIndex = backIndex;  // index into m_backImages
    this.cw = cw;     // card width of cards in this deck
    this.ch = ch;     // card height of cards in this deck
    this.unscaledCw = cw;     // card width of cards in this deck
    this.unscaledCh = ch;     // card height of cards in this deck
    this.isSpread = false;  // should we draw this stack spread out (for a deck normally drawn vertically)
    this.cards = [];  // Card objects
    // this.shuffle();
  }

  // card: a Card object
  addCard(card) {
    // make sure this card is in this deck
    card.deckIndex = this.deckIndex;
    this.cards.push(card);
  }

  // card: a Card object
  addCardToBottom(card) {
    // make sure this card is in this deck
    card.deckIndex = this.deckIndex;
    this.cards.unshift(card);
  }

  // Decks may not contain a continuous list of cards in a set.  For instance the Unhallowed Deck
  // will contain cards from the creature set that might go from indexes 30-38.  The Graveyard
  // will be a bunch of numbers from 0 to 39.  So to shuffle we need to randomly select from those indexes.
  // Actually, we just want to randomly select a card that's already in the list, so it's pretty easy.
  // If we have 5 cards, we have indexes from 0 to 4.  the inedx inside the card itself is not needed.
  shuffle() {
    let indexes = [];
    let cards = [];
    for (let i = 0; i < this.cards.length; i++) indexes[i] = i;
		while (indexes.length > 0) {
			let index = floor(random(indexes.length));
      // console.log('index = ' , index);
      
      cards.push(this.cards[indexes[index]]);
      indexes.splice(index, 1);
		}
    this.cards = cards;

  }


  // returns top card of the deck as Card
  dealCard() {
    let len = this.cards.length;
    if (len == 0) {
      m_messageP.style('color', '#FF0000');
      m_messageP.html('The deck is empty.  Better shuffle.')
      return undefined;
    }

    let cards = this.cards.splice(len-1, 1);
    return cards[0];
  }

  // otherDeck: index of a Deck object
  moveTopCardToDeck(otherDeckIndex) {
    // console.log("this.moveTopCardToDeck");
    let otherDeck = m_decks[otherDeckIndex];
    // console.log('otherDeck.setIndex, this.setIndex = ' , otherDeck.setIndex, this.setIndex);
    
    if (otherDeck.setIndex != this.setIndex) {
      return;
    }
    let card = this.dealCard();
    if (card) {
      card.deckIndex = otherDeck.deckIndex;
      otherDeck.addCard(card);
    }
  }

  reset() {
    this.cards = [];
  }

  // returns an index into a deck's cards array of a passed in card
  findIndexInDeck(card) {
    let indexInDeck = -1;
    for (let j = 0; j < this.cards.length; j++) {
      if (this.cards[j] == card) {
        indexInDeck = j;
      }
    }
    return indexInDeck;
  }


  // xstart: x position of first card
  // ystart: y position of first card
  // xmult:  how many card widths to offset each card from the previous
  // ymult:  how many card heights to offset each card from the previous
  // xwrap:  how many cards to draw before increasing the y value by one card's worth
  // Note this is not super flexible.  It assume either xmult ot ymuly will be 0
  show(xstart, ystart, xmult, ymult, xwrap=0) {
    if (this.isSpread) {
      // draw a rect over the player stuff
      noStroke();  fill(100, 200);
      rect(946*m_s, 0, width-946*m_s, height);
      xwrap = floor((width-946*m_s)/(this.cw*m_s)) + 1;
      // rect(946*m_s, 0, (width-946)*m_s, height);
      // xwrap = floor(((width-1055)/this.cw)*m_s) + 1;
      // console.log('xwrap = ' , xwrap);
      
      xstart = 946*m_s; ystart = 0; xmult = 1; ymult = 0;
    }
    let xdelta = xmult * this.cw;
    let ydelta = ymult * this.ch;
    let yoff = 0;
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].x = xstart + i*xdelta;
      this.cards[i].y = ystart + i*ydelta + yoff;

      // Force some cards faceup and some facedown.  Don't force selected cads to be facedown (useful for debugging)
      if (this.deckIndex == DECK_UNHALLOWED || this.deckIndex == DECK_GRAVEYARD || this.deckIndex == DECK_CUR_LOCS) {
        this.cards[i].facedown = false;
      } else if (this.deckIndex == DECK_HORDE || this.deckIndex == DECK_MONSTERS || this.deckIndex == DECK_UNUSED_LOCS || 
          this.deckIndex == DECK_MAP_LOCS) {
        if (this.cards[i].selected == false) this.cards[i].facedown = true;
      }

      // remember whether the card is facedown, so we can restore it if we are spread
      let facedown = this.cards[i].facedown;
      if (this.isSpread) this.cards[i].facedown =false;

      this.cards[i].show();

      if (this.isSpread) this.cards[i].facedown =facedown;

      if ( xwrap > 0 && ((i+1) % xwrap) == 0) {
        yoff += this.ch;
        xstart -= xwrap*this.cw;
      }
    }
  }

  // spread() {
  //   // draw a rect over the player stuff
  //   noStroke();  fill(100, 200);
  //   rect(1055, 0, width-1055, height);
  //   // turn off spread so we can use thw show() fucntion, then turn it back on again afterwards
  //   this.isSpread = false;
  //   this.show(946, 0, 1, 0, 6);
  //   this.isSpread = true;
  // }

  // data: a Deck object
  copyFromServerData(data) {
    this.deckIndex = data.deckIndex;
    this.setIndex = data.setIndex;
    this.backIndex = data.backIndex;
    this.cw = data.unscaledCw * m_s;
    this.ch = data.unscaledCh * m_s;
    // this.cw = data.cw;
    // this.ch = data.ch;
    this.unscaledCw = data.unscaledCw;
    this.unscaledCh = data.unscaledCh;
    this.isSpread = data.isSpread;
    if (data.cards) {
      this.cards = [];
      for (let c of data.cards) {
        // let card = new Card(c.setIndex, c.index, c.setIndex);  unneeded since copyFromServerData will set all this stuff
        let card = new Card();
        card.copyFromServerData(c);
        this.cards.push(card);
      }
    } else {
      this.cards = [];
    }

  }
}