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
    this.campCounter = 0;
    this.dice = [];

    for (let i = 0; i < 3; i++) {
      this.dice[i] = new Dice(m_dieSizes[this.class], 1150+m_dieSize*i, 35+225*this.seatPos, m_dieColors[this.class]);
    }
  }  // xtor

  showNoDice() {
    // underlying rect
    fill(m_playerBackgroundColors[this.class]); noStroke();
    rect(1055*m_s, 225*this.seatPos*m_s, width-1055*m_s, 75*m_s);

    // name, class, melee/ranged
    stroke(0); noFill(); textSize(16);
    text(this.name, 1055*m_s, (20 + 225*this.seatPos)*m_s)
    text(m_classNames[this.class], 1055*m_s, (40 + 225*this.seatPos)*m_s)
    let rng = (m_isRangedClass[this.class] == 1) ? "Ranged" : "Melee";
    text(rng, 1055*m_s, (60 + 225*this.seatPos)*m_s);
    text(m_classCamp[this.class], 1150*m_s, (25 + 225*this.seatPos)*m_s)

    // camp counter
    fill(255);
    circle(width-50*m_s, (225*this.seatPos + 75/2)*m_s, 30);
    fill(0);
    text(this.campCounter, width+(-50-5)*m_s, (225*this.seatPos + 75/2 + 5)*m_s );

    // deck
    let deck = m_decks[this.class];
    let xstart = 1055*m_s;
    let ystart = (0 + 225*this.seatPos)*m_s + m_ch/2;
    let xmult = 1;  // 1 card width
    deck.show(xstart, ystart, xmult, 0);

    // separator line after first 3 cards
    stroke(m_dieColors[this.class]); fill(m_dieColors[this.class]);
    rect(1055*m_s+3*deck.cw, (75+225*this.seatPos)*m_s, 7, m_ch);
  }

  showDice() {
    for (let die = 0; die < this.dice.length; die++) {
      // if we have a dragged die, and it's this one, change the position before drawing.
      // This only changes this player's info, it does not update. 
      if (Object.keys(m_selectedDieInfo).length != 0 && m_selectedDieInfo.playerNum == this.seatPos && m_selectedDieInfo.dieIndex == die) {
        m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].x = m_selectedDieInfo.x;
        m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].y = m_selectedDieInfo.y;
      }
      this.dice[die].show(this.seatPos, die);
    }
  }

  // data: a Player object
  copyFromServerData(data) {
    this.socketId = data.socketId;
    this.seatPos = data.seatPos;
    this.name = data.name;
    this.class = data.class;
    this.campCounter = data.campCounter;

    // We have to pass extra data into die.copyFromServerData() because we lose the positions
    // of our dice when they are recalculated the first time we get server data and our seatPos is -1.
    // Passing the seatPos allows us to calculate the y properly (assuming it is incorrect)
    this.dice = [];
    if (data.dice) {
      for (let d of data.dice) {
        let die = new Dice();
        die.copyFromServerData(d, this.seatPos);
        this.dice.push(die);
      }
    } 

  }  // copyFromServerData

}  // class Player