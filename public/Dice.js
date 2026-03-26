class Dice {
  constructor(maxVal, x, y, color) {
    this.maxValue = maxVal;
    this.x = x;  // upper left of square/triangle
    this.y = y;
    this.color = color;
    this.curValue = 0;
    this.selected = false;
  }

  // We need the playerPos and diceIdx to compare against the selected die
  show(playerPos, diceIdx) {
    fill(this.color);  stroke(0); strokeWeight(1); textSize(16);
    if (this.maxValue == 8) {
      triangle(this.x, this.y, this.x+m_dieSize, this.y, this.x + m_dieSize/2, this.y + m_dieSize );
    } else {
      rect(this.x, this.y, m_dieSize, m_dieSize);
    }
    fill(0);
    let y = this.y + m_dieSize/2;
    if (this.maxValue == 6) y += 3;
    text(this.curValue, this.x + m_dieSize/2 - 5, y);

    // if (Object.keys(m_selectedDie).length != 0) {
    //   if (m_selectedDie.player == playerPos && m_selectedDie.dice == diceIdx) {
    //     fill(0, 255, 0);
    //     circle(this.x, this.y, 3);
    //   }
    // }
    if (this.selected) {
      fill(0, 255, 0);
      circle(this.x, this.y, 12);
    }
  }

  // We have to pass extra data into copyFromServerData() because we lose the positions
  // of our dice when they are recalculated the first time we get server data and our seatPos is -1.
  // Passing the seatPos allows us to calculate the y properly (assuming it is incorrect)
  copyFromServerData(data, seatPos) {
    this.maxValue = data.maxValue;
    this.x = data.x;
    if (data.y >= 0) this.y = data.y;
    else             this.y = 35+225*seatPos;
    this.color = data.color;
    this.curValue = data.curValue;
    this.selected = data.selected;
  }
}