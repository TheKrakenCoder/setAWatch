class Card {
  constructor(setIdx, idx, deckIdx) {
    this.setIndex = setIdx;    // index into m_setImages array - Each element is an array of card images
    this.index = idx;          // index into the m_setImages[this.setIndex] - an individual card image
    this.deckIndex = deckIdx;  // which deck is this part of
    this.x = 0;
    this.y = 0;
    this.exhausted = false;
    this.facedown = true;
    this.selected = false;
  }

  show() {
    if (!m_thisPlayer) return;

    let deck = m_decks[this.deckIndex];
    
    if (this.facedown) {
      noStroke(); noFill();
      let backIndex = m_decks[this.deckIndex].backIndex;
      image(m_cardBackImages[backIndex], this.x, this.y, deck.cw, deck.ch);
    } else {
      noStroke(); noFill();
      let set = m_setImages[this.setIndex];
      // image(set[this.index], this.x, this.y);
      image(set[this.index], this.x, this.y, deck.cw, deck.ch);

      if (this.exhausted) {
        fill(255, 0, 0);
        circle(this.x + deck.cw/2, this.y + deck.ch/4, deck.cw*0.5);
      }
    }

    if (this.selected) {
      let deck = m_decks[this.deckIndex];
      stroke(255, 0, 0);
      strokeWeight(4);
      noFill();
      rect(this.x-2, this.y-2, deck.cw, deck.ch);
      strokeWeight(1);
    }

  }

  setFacedown() {
    this.facedown = true;
  }
  setFaceup() {
    this.facedown = false;
  }
  flipCard(player) {
    this.facedown = !this.facedown;
  }

  reset() {
    this.facedown = true;
    this.selected = false;
  }

  // data: a Card object
  copyFromServerData(data) {
    this.setIndex = data.setIndex;
    this.index = data.index;
    this.deckIndex = data.deckIndex;
    this.x = data.x;
    this.y = data.y;
    this.exhausted = data.exhausted;
    this.facedown = data.facedown;
    this.selected = data.selected;
  }

}