// Player should have a seatPosition, that never changes.  When a new Player
// comes on board, we (the server) pick the lowest unused seat position.
//         2
//     1       3
//         0
// When we draw the players, we always draw a player at the bottom of the screen
// in seat position 0.  So we draw based on a relative seat position.
class Player {
  constructor(idx, name, charClass) {
    // index will end up getting set by the server
    this.socketId = 0;       // string
    this.seatPos = idx;      // integer
    this.name = name;        // string
    this.class = charClass;  // integer - used as a deck index
  }  // xtor

  show() {
    // underlying rect
    fill(0, 100, 50); noStroke();
    rect(1055, 225*this.seatPos, width-1055, 75);

    // name
    stroke(0); noFill(); textSize(16);
    text(this.name, 1055, 25 + 225*this.seatPos)
    text(m_classNames[this.class], 1055, 50 + 225*this.seatPos)
    text(m_classCamp[this.class], 1150, 25 + 225*this.seatPos)

    // deck
    let deck = m_decks[this.class];
    let xstart = 1055;
    let ystart = 0 + 225*this.seatPos + m_ch/2;
    let xmult = 1;  // 1 card width
    deck.show(xstart, ystart, xmult, 0);

    // let x = 1055;
    // let y = 0 + 225*this.class + m_ch/2;
    // for (let i = 0; i < deck.cards.length; i++) {
    //   deck.cards[i].x = x + i*m_cw;
    //   deck.cards[i].y = y;
    //   deck.cards[i].facedown = false;  // player cards are always faceup
    //   deck.cards[i].show();
    // }
  }

  // data: a Player object
  copyFromServerData(data) {
    this.socketId = data.socketId;
    this.seatPos = data.seatPos;
    this.name = data.name;
    this.class = data.class;

    // this.cards = [];
    // if (data.cards) {
    //   for (let c of data.cards) {
    //     let card = new Card();
    //     card.copyFromServerData(c);
    //     this.cards.push(card);
    //   }
    // } else {
    //   this.cards = [];
    // }
    // this.selected = data.selected;
    // this.dealer = data.dealer;
    // this.folded = data.folded;
    // this.bet = data.bet;
    // this.money = data.money
  }  // copyFromServerData

}  // class Player