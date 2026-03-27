const CLASS_NONE = -1, CLASS_BEASTMASTER = 0, CLASS_CLERIC = 1, CLASS_RANGER = 2, CLASS_ROGUE = 3, CLASS_WARRIOR = 4, CLASS_WIZARD = 5; CLASS_NUM_CLASSES = 6;
const m_classNames = ['Beast Master', 'Cleric', 'Ranger', 'Rogue', 'Warrior', 'Wizard'];
const m_classCampFull = ["SET TRAP: As soon as a Creature in the 1st position of the Line is revealed during the Watch phase, you may assign this result to that Creature as direct damage.  If this defeats the Creature, its ability is not triggered",
                     "HEAL: Choose an Adventurer: refresh 1 of their Ability cards. (Requirement: 4+)",
                     "ELVEN SCOUT: Draw the top 4 cards of the Creature deck, look an them, and return them to the top of the Creature dek in any order",
                     "PREPARED: Perform the Equip action.  You may then choose an Adventurer on Watch to perform than Equip action",
                     "WOOD AXE: Advance the Firewood token by +4",
                     "TELEPORT: Draw the top 4 cards of the Unused Locations deck, look at them, and then choose one of them to swap with the top card of the Map deck.  Return the remainin cards to the bottom of the Unused Locations dek in any order" 
                    ];
const m_classCamp = ["SET TRAP: look it up!!",
                     "HEAL: Refresh 1 Ability of an Adventurer. (Requirement: 4+)",
                     "ELVEN SCOUT: Rearrage top 4 cards of Creature deck",
                     "PREPARED: Equip. Allow someone else to Equip",
                     "WOOD AXE: Advance the Firewood token by +4",
                     "TELEPORT: look it up!!" 
                    ];

var m_socket;
var m_initButton, m_nameInputButton, m_initialPlayer;
var m_players = [];  
var m_playersTemp = [];
// var m_thisPlayer;
var m_initialized = false;
var m_difficulty = 2;
var m_mySocketId;
var m_classRadio;
var m_playerClassNameParagraph;
// var m_playerClassNameParagraphs = [];
var m_cw = 109, m_ch = 150;  // for vertical cards
var m_bw = 100, m_bh = 75;   // for buttons
var m_bs = 30;               // width height for buttons on cards
var m_campImage;
var m_buttonTest, m_buttonCardTest;
var m_buttonShiftLeft, m_buttonSwapTwoCards;
var m_setImages = [];
// var m_deckImages = [];
var m_decks = [];
var m_cardBackImages = [];
// Message from server
var m_messageP;
var m_oldMessage = "&nbsp";
var m_colorNum = 0;
var m_colors = ['#000000', '#FF0000', '#55AA55', '#0000FF'];
const NUM_MONSTER = 36, NUM_UNHALLOWED = 9, NUM_ACOLYTE = 2, NUM_SUMMON = 4; 
const NUM_LOC_REGULAR = 15, NUM_LOC_FINAL = 1, NUM_LOC_RESPITE = 4; 
const NUM_CARDS_PER_CLASS = 5;
var m_debugSet=-1, m_debugDeck=-1;
let m_spreadingToppingOrBottoming = false;  // when we click these buttons on a deck we don't want to select the card
const m_dieSizes = [8, 6, 8, 6, 8, 6];      // beats master thru wizard
const m_dieColors = ['blue', 'red', 'green', 'orange', 'purple', 'yellow'];
const m_dieSize = 40;
let m_selectedDieInfo = {};
let m_didDragDie = false;
let m_firewood = 7;
let m_buttonOpenSeason, m_isOpenSeason = false;

    
// Decks are separate collections of cards on the table during play.  Each Deck is associated with one Set and many decks can use
// the same set.  For example, Decks Creatures, Graveyard, horde and Unhallowed will all use the Set Creatures
const DECK_BEASTMASTER = 0, DECK_CLERIC = 1, DECK_RANGER = 2, DECK_ROGUE = 3, DECK_WARRIOR = 4, DECK_WIZARD = 5, DECK_MONSTERS = 6, 
      DECK_UNHALLOWED  = 7, DECK_LINE = 8, DECK_GRAVEYARD  = 9, DECK_HORDE = 10, DECK_GENERIC = 11, DECK_REMOVED_FROM_GAME = 12, 
      DECK_MAP_LOCS = 13, DECK_CUR_LOCS = 14, DECK_UNUSED_LOCS = 15, DECK_TEMP_LOCS = 16,  DECK_NUM_DECKS = 17; 
// Sets are essentually cards with the same backs.  Each Set is an array of images
const SET_BEASTMASTER = 0, SET_CLERIC = 1, SET_RANGER = 2, SET_ROGUE = 3, SET_WARRIOR = 4, SET_WIZARD = 5, SET_CREATURES = 6, SET_LOCATIONS = 7,
      SET_NUM_SETS = 8;
const BACK_CREATURE = 0, BACK_LOCATION = 1, BACK_GENERIC = 2;

function preload() {
  m_campImage = loadImage('Assets/GameBoardCamp.jpg');
  let img = loadImage('Assets/cardBackTemp.jpg');
  m_cardBackImages[BACK_GENERIC] = img;
  img = loadImage('Assets/CardBackCreature.jpg');
  m_cardBackImages[BACK_CREATURE] = img;
  img = loadImage('Assets/CardBackLocation.jpg');
  m_cardBackImages[BACK_LOCATION] = img;
  for (let i = 0; i < SET_NUM_SETS; i++) m_setImages[i] = [];

  // Creatures
  for (let i = 0; i < NUM_CARDS_PER_CLASS; i++) {
    m_setImages[SET_BEASTMASTER].push(loadImage('Assets/Beastmaster' + i + '.jpg'));
    m_setImages[SET_CLERIC].push(loadImage('Assets/Cleric' + i + '.jpg'));
    m_setImages[SET_RANGER].push(loadImage('Assets/Ranger' + i + '.jpg'));
    m_setImages[SET_ROGUE].push(loadImage('Assets/Rogue'   + i + '.jpg'));
    m_setImages[SET_WARRIOR].push(loadImage('Assets/Warrior'   + i + '.jpg'));
    m_setImages[SET_WIZARD].push(loadImage('Assets/Wizard'   + i + '.jpg'));
  }
  for (let i = 0; i < NUM_MONSTER; i++) m_setImages[SET_CREATURES].push(loadImage('Assets/SAW'        + i + '.jpg'));
  for (let i = 0; i < NUM_UNHALLOWED;  i++) m_setImages[SET_CREATURES].push(loadImage('Assets/Unhallowed' + i + '.jpg'));
  for (let i = 0; i < NUM_ACOLYTE; i++)  m_setImages[SET_CREATURES].push(loadImage('Assets/Acolyte'    + i + '.jpg'));
  for (let i = 0; i < NUM_SUMMON; i++)  m_setImages[SET_CREATURES].push(loadImage('Assets/Summon'     + i + '.jpg'));

  // Locations
  for (let i = 0; i < NUM_LOC_REGULAR; i++)  m_setImages[SET_LOCATIONS].push(loadImage('Assets/Locations'     + i + '.jpg'));
  for (let i = 0; i < NUM_LOC_FINAL; i++)  m_setImages[SET_LOCATIONS].push(loadImage('Assets/LocationsFinal'     + i + '.jpg'));
  for (let i = 0; i < NUM_LOC_RESPITE; i++)  m_setImages[SET_LOCATIONS].push(loadImage('Assets/LocationsRespite'     + i + '.jpg'));
  
}  // preload()

function setup() {
  createCanvas(1600, 900);

  m_playerClassNameParagraph = createP();
  m_playerClassNameParagraph.position(400, 400);
  m_playerClassNameParagraph.size(800, 200);
  m_playerClassNameParagraph.style('background-color', "grey");
  m_playerClassNameParagraph.hide();

    
  // /////////////////////////////////////////////
  // // For already created players
  // for (let i = 0; i < 6; i++) {
  //   m_playerClassNameParagraphs[i] = createP();
  //   m_playerClassNameParagraphs[i].position(1055, i*255+50);
  // }

  /////////////////////////////////////////////
  // Cards, Sets and Decks
  /////////////////////////////////////////////

  ////////////////////////////////////////////
  // Resize stuff as needed
  m_campImage.resize(0, 341);
  // m_cardBackTempImage.resize(m_cw, m_ch);

  // resize set images
  // for (img of m_setImages[SET_BEASTMASTER]) img.resize(m_cw, m_ch);  
  // for (img of m_setImages[SET_CLERIC]) img.resize(m_cw, m_ch);       
  // for (img of m_setImages[SET_RANGER]) img.resize(m_cw, m_ch);       
  // for (img of m_setImages[SET_ROGUE]) img.resize(m_cw, m_ch);        
  // for (img of m_setImages[SET_WARRIOR]) img.resize(m_cw, m_ch);        
  // for (img of m_setImages[SET_WIZARD]) img.resize(m_cw, m_ch);        

  /////////////////////////////////////////////
  // Create Class Decks
  /////////////////////////////////////////////
  // JMU since DECK_BEASTMASTER and SET_BEASTMASTER are the same, this could easily be done with a loop
  m_decks[DECK_BEASTMASTER] = new Deck(DECK_BEASTMASTER, SET_BEASTMASTER, BACK_GENERIC, m_cw, m_ch);
  m_decks[DECK_CLERIC] = new Deck(DECK_CLERIC, SET_CLERIC, BACK_GENERIC, m_cw, m_ch);
  m_decks[DECK_RANGER] = new Deck(DECK_RANGER, SET_RANGER, BACK_GENERIC, m_cw, m_ch);
  m_decks[DECK_ROGUE] = new Deck(DECK_ROGUE, SET_ROGUE, BACK_GENERIC, m_cw, m_ch);
  m_decks[DECK_WARRIOR] = new Deck(DECK_WARRIOR, SET_WARRIOR, BACK_GENERIC, m_cw, m_ch);
  m_decks[DECK_WIZARD] = new Deck(DECK_WIZARD, SET_WIZARD, BACK_GENERIC, m_cw, m_ch);

  /////////////////////////////////////////////
  // Create and add Cards to our Decks and then shuffle the decks
  createClassCardsAndAddToDeck(SET_BEASTMASTER, DECK_BEASTMASTER);
  createClassCardsAndAddToDeck(SET_CLERIC, DECK_CLERIC);
  createClassCardsAndAddToDeck(SET_RANGER, DECK_RANGER);
  createClassCardsAndAddToDeck(SET_ROGUE, DECK_ROGUE);
  createClassCardsAndAddToDeck(SET_WARRIOR, DECK_WARRIOR);
  createClassCardsAndAddToDeck(SET_WIZARD, DECK_WIZARD);
  
  for (i = DECK_BEASTMASTER; i <= DECK_WIZARD; i++) m_decks[i].shuffle();

  //////////////////////////////////////////////
  // Create Monster Decks
  //////////////////////////////////////////////
  m_decks[DECK_MONSTERS] = new Deck(DECK_MONSTERS, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);
  m_decks[DECK_UNHALLOWED] = new Deck(DECK_UNHALLOWED, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);
  m_decks[DECK_LINE] = new Deck(DECK_LINE, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);
  m_decks[DECK_GRAVEYARD] = new Deck(DECK_GRAVEYARD, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);
  m_decks[DECK_HORDE] = new Deck(DECK_HORDE, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);
  m_decks[DECK_GENERIC] = new Deck(DECK_GENERIC, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);
  m_decks[DECK_REMOVED_FROM_GAME] = new Deck(DECK_REMOVED_FROM_GAME, SET_CREATURES, BACK_CREATURE, m_cw, m_ch);

  /////////////////////////////////////////////
  // Create and add Cards to our Monster Decks and then shuffle the decks.

  // The start variable moves through the creatures set, from regular monsters, to unhallowed to acolytes to summons
  let start = 0;
  createCreatureCardsAndAddToDeck(SET_CREATURES, DECK_MONSTERS, start, NUM_MONSTER);
  start += NUM_MONSTER;
  createCreatureCardsAndAddToDeck(SET_CREATURES, DECK_UNHALLOWED, start, NUM_UNHALLOWED);
  start += NUM_UNHALLOWED;
  // createCreatureCardsAndAddToDeck(SET_CREATURES, DECK_LINE, start, 0);
  // createCreatureCardsAndAddToDeck(SET_CREATURES, DECK_GRAVEYARD, start, 0);
  // createCreatureCardsAndAddToDeck(SET_CREATURES, DECK_HORDE, start, 0);
  // createCreatureCardsAndAddToDeck(SET_CREATURES, DECK_GENERIC, start, 0);

  for (i = DECK_MONSTERS; i <= DECK_UNHALLOWED; i++) m_decks[i].shuffle();

  /////////////////////////////////////////////
  // Create the final Monster deck.

  // First eliminate all but 28 creatures
  // for (let i = 0; i < 8; i++) m_decks[DECK_MONSTERS].moveTopCardToDeck(DECK_REMOVED_FROM_GAME);
  while (m_decks[DECK_MONSTERS].cards.length > 28) m_decks[DECK_MONSTERS].moveTopCardToDeck(DECK_REMOVED_FROM_GAME);

  // Now add 2 Acolytes and reshuffle
  let card = new Card(SET_CREATURES, start, DECK_MONSTERS);
  start += 1;
  card.facedown = true;
  m_decks[DECK_MONSTERS].addCard(card);
  card = new Card(SET_CREATURES, start, DECK_MONSTERS);
  start += 1;
  card.facedown = true;
  m_decks[DECK_MONSTERS].addCard(card);
  m_decks[DECK_MONSTERS].shuffle();

  // Add 1 sumomn card for each level of difficulty
  let packetNum = floor(m_decks[DECK_MONSTERS].cards.length / m_difficulty);
  console.log('packetNum = ' , packetNum);
  console.log('m_difficulty = ' , m_difficulty);
  
  for (let i = 0; i < m_difficulty; i++) {
    card = new Card(SET_CREATURES, start, DECK_MONSTERS);
    start += 1;
    card.facedown = true;
    let loc = i*packetNum + floor(random(packetNum)) + i;  // the extra i is because we are adding cards as we go
    m_decks[DECK_MONSTERS].cards.splice(loc, 0, card);
  }
  // // Now add two Summons Cards, one in each half
  // card = new Card(SET_CREATURES, start, DECK_MONSTERS);
  // start += 1;
  // card.facedown = true;
  // let loc = floor(random(15));
  // m_decks[DECK_MONSTERS].cards.splice(loc, 0, card);
  // card = new Card(SET_CREATURES, start, DECK_MONSTERS);
  // start += 1;
  // card.facedown = true;
  // loc = floor(random(15)) + 15;
  // m_decks[DECK_MONSTERS].cards.splice(loc, 0, card);

  /////////////////////////////////////////////
  // Create the Horde deck and adjust the Unhallowed deck so it has 7 items
  
  // put one card from the Unhallowed Deck into the Horde
  m_decks[DECK_UNHALLOWED].moveTopCardToDeck(DECK_HORDE);
  for (card of m_decks[DECK_HORDE].cards) card.facedown = true;
  // leave 7 cards in the Unhallowed
  m_decks[DECK_UNHALLOWED].moveTopCardToDeck(DECK_REMOVED_FROM_GAME);
  for (card of m_decks[DECK_UNHALLOWED].cards) card.facedown = false;

  //////////////////////////////////////////////
  // Create Location Decks
  //////////////////////////////////////////////
  m_decks[DECK_MAP_LOCS] = new Deck(DECK_MAP_LOCS, SET_LOCATIONS, BACK_LOCATION, m_ch, m_cw);
  m_decks[DECK_UNUSED_LOCS] = new Deck(DECK_UNUSED_LOCS, SET_LOCATIONS, BACK_LOCATION, m_ch, m_cw);
  m_decks[DECK_CUR_LOCS] = new Deck(DECK_CUR_LOCS, SET_LOCATIONS, BACK_LOCATION, m_ch, m_cw);
  m_decks[DECK_TEMP_LOCS] = new Deck(DECK_TEMP_LOCS, SET_LOCATIONS, BACK_LOCATION, m_ch, m_cw);
  m_decks[DECK_TEMP_LOCS].isSpread = true;

  /////////////////////////////////////////////
  // Create and add Cards to our Location Decks and then shuffle the decks.
  start = 0;
  createLocationCardsAndAddToDeck(SET_LOCATIONS, DECK_MAP_LOCS, start, NUM_LOC_REGULAR);
  start += NUM_LOC_REGULAR;
  m_decks[DECK_MAP_LOCS].shuffle();
  // move all but 8 of the cards to the Unused Locations deck
  while (m_decks[DECK_MAP_LOCS].cards.length > 8) m_decks[DECK_MAP_LOCS].moveTopCardToDeck(DECK_UNUSED_LOCS);
  // add one of the final location cards to the bottom of the map locs deck
  card = new Card(SET_LOCATIONS, start, DECK_MAP_LOCS);
  start += 1;
  m_decks[DECK_MAP_LOCS].cards.unshift(card);

  // create the respite locations, add them to unused locaitons and shuffle
  createLocationCardsAndAddToDeck(SET_LOCATIONS, DECK_UNUSED_LOCS, start, NUM_LOC_RESPITE);
  m_decks[DECK_UNUSED_LOCS].shuffle();

  /////////////////////////////////////////////
  // GUI
  /////////////////////////////////////////////
  // Temporary Buttons

  // Init Button
  m_initButton = createButton('Init: Enter Name');
  m_initButton.mousePressed(initPlayerToServer);
  m_nameInputButton = createInput();

  /////////////////////////////////////////////
  // Radio Buttons for class
  m_classRadio = createRadio();
  for (let i = 0; i < m_classNames.length; i++) {
    m_classRadio.option(i, m_classNames[i]);

  }
  // Set default
  m_classRadio.selected('0');
  // Style: Make options align horizontally
  // Select all input elements within the radio
  let opts = selectAll('input', m_classRadio);
  for (let i = 0; i < opts.length; i++) {
    opts[i].style('margin', '10px'); // Spacing between buttons
  }

  //////////////////////////////////////////////
  // Permanent buttons on top of canvas
  //////////////////////////////////////////////
  m_messageP = createDiv('Message here');

  ///////////////////////////////////////////////
  // Controls on Canvas
  let buttonFlip = createNormalButton("Flip Cards", 0*m_bw, 750, m_bw, m_bh);
  buttonFlip.style('font-size', '16px');
  buttonFlip.style('background-color', "#F0F0F0")
  buttonFlip.mousePressed(flipCards);

  let buttonExhaust = createNormalButton("(Un)Exhaust Cards", 1*m_bw, 750, m_bw, m_bh);
  buttonExhaust.style('font-size', '16px');
  buttonExhaust.style('background-color', "#F0F0F0")
  buttonExhaust.mousePressed(exhaustToggleCards);

  m_buttonShiftLeft = createNormalButton("Shift Cards Left", 2*m_bw, 750, m_bw, m_bh);
  m_buttonShiftLeft.style('font-size', '16px');
  m_buttonShiftLeft.style('background-color', "#F0F0F0")
  m_buttonShiftLeft.mousePressed(shiftLeft);

  m_buttonSwapTwoCards = createNormalButton("Swap Two Cards", 3*m_bw, 750, m_bw, m_bh);
  m_buttonSwapTwoCards.style('font-size', '16px');
  m_buttonSwapTwoCards.style('background-color', "#F0F0F0")
  m_buttonSwapTwoCards.mousePressed(swapTwoCards);

  let buttonShuffle = createNormalButton("Shuffle Deck of Selected Card", 4*m_bw, 750, m_bw, m_bh);
  buttonShuffle.style('font-size', '16px');
  buttonShuffle.style('background-color', "#F0F0F0")
  buttonShuffle.mousePressed(shuffleDeckOfSelectedCard);

  let buttonRemove = createNormalButton("Remove Selected Card from Game", 5*m_bw, 750, m_bw, m_bh);
  buttonRemove.style('font-size', '16px');
  buttonRemove.style('background-color', "#F0F0F0")
  buttonRemove.mousePressed(removeSelectedCardFromGame);

  m_buttonOpenSeason = createNormalButton("Open Season", 0*m_bw, 825, m_bw, m_bh);
  m_buttonOpenSeason.style('font-size', '16px');
  m_buttonOpenSeason.style('background-color', "#FF0000")
  m_buttonOpenSeason.mousePressed(toggleOpenSeason);

  let buttonRollAllDice = createNormalButton("Roll All Dice", 1*m_bw, 825, m_bw, m_bh);
  buttonRollAllDice.style('font-size', '16px');
  buttonRollAllDice.style('background-color', "#F0F0F0")
  buttonRollAllDice.mousePressed(rollAllDice);

  let buttonRollSelectedDice = createNormalButton("Roll Selected Dice", 2*m_bw, 825, m_bw, m_bh);
  buttonRollSelectedDice.style('font-size', '16px');
  buttonRollSelectedDice.style('background-color', "#F0F0F0")
  buttonRollSelectedDice.mousePressed(rollSelectedDice);

  let buttonDecrementSelectedDice = createNormalButton("Decrement Selected Dice", 3*m_bw, 825, m_bw, m_bh);
  buttonDecrementSelectedDice.style('font-size', '16px');
  buttonDecrementSelectedDice.style('background-color', "#F0F0F0")
  buttonDecrementSelectedDice.mousePressed(decrementSelectedDice);

  let buttonIncrementSelectedDice = createNormalButton("Increment Selected Dice", 4*m_bw, 825, m_bw, m_bh);
  buttonIncrementSelectedDice.style('font-size', '16px');
  buttonIncrementSelectedDice.style('background-color', "#F0F0F0")
  buttonIncrementSelectedDice.mousePressed(incrementSelectedDice);

  let buttonDecrementFirewood = createNormalButton("Decrease Firewood", 5*m_bw, 825, m_bw, m_bh);
  buttonDecrementFirewood.style('font-size', '16px');
  buttonDecrementFirewood.style('background-color', "#F0F0F0")
  buttonDecrementFirewood.mousePressed(function(){
      if (m_firewood > 0) m_firewood --;
      update();
    });

  let buttonIncrementFirewood = createNormalButton("Increase Firewood", 6*m_bw, 825, m_bw, m_bh);
  buttonIncrementFirewood.style('font-size', '16px');
  buttonIncrementFirewood.style('background-color', "#F0F0F0")
  buttonIncrementFirewood.mousePressed(function(){
      if (m_firewood < 15) m_firewood ++;
      update();
    });

  let buttonCampCheckMap = createNormalButton("Camp Check Map", 8*m_bw, 750, m_bw, m_bh);
  buttonCampCheckMap.style('font-size', '16px');
  buttonCampCheckMap.style('background-color', "#F0F0F0")
  buttonCampCheckMap.mousePressed(campCheckMap);

  let buttonCampTeleport = createNormalButton("Camp Wizard Teleport", 8*m_bw, 825, m_bw, m_bh);
  buttonCampTeleport.style('font-size', '16px');
  buttonCampTeleport.style('background-color', "#F0F0F0")
  buttonCampTeleport.mousePressed(campWizardTeleport);

  ///////////////////////////////////////////////
  // Controls for individual decks
  ///////////////////////////////////////////////
  let doDeal=true, doSpread=true, doTop=true, doBottom=true;
  createDeckButtons(DECK_MONSTERS, DECK_LINE, 809, 0, m_decks[DECK_MONSTERS].cw, m_decks[DECK_MONSTERS].ch, 
                    doDeal, doSpread, doTop, doBottom);
  createDeckButtons(DECK_HORDE, DECK_LINE, 700, 0, m_decks[DECK_HORDE].cw, m_decks[DECK_HORDE].ch, 
                    doDeal, doSpread, doTop, doBottom);
  createDeckButtons(DECK_UNHALLOWED, DECK_LINE, 700, m_ch, m_decks[DECK_UNHALLOWED].cw, m_decks[DECK_UNHALLOWED].ch, 
                    doDeal, doSpread, doTop, doBottom);
  createDeckButtons(DECK_GRAVEYARD, DECK_LINE, 809, m_ch, m_decks[DECK_GRAVEYARD].cw, m_decks[DECK_GRAVEYARD].ch, 
                    doDeal, doSpread, doTop, doBottom);
  doDeal = false, doSpread = false, doTop=true, doBottom=true;
  createDeckButtons(DECK_LINE, DECK_LINE, 0, 450, m_decks[DECK_LINE].cw, m_decks[DECK_LINE].ch, 
                    doDeal, doSpread, doTop, doBottom);

  doDeal = false, doSpread = true, doTop=true, doBottom=true;
  createDeckButtons(DECK_UNUSED_LOCS, DECK_LINE, 0, 0, m_decks[DECK_UNUSED_LOCS].cw, m_decks[DECK_UNUSED_LOCS].ch, 
                    doDeal, doSpread, doTop, doBottom);
  doDeal = true, doSpread = true, doTop=true, doBottom=true;
  createDeckButtons(DECK_MAP_LOCS, DECK_CUR_LOCS, m_decks[DECK_MAP_LOCS].cw, 0, m_decks[DECK_MAP_LOCS].cw, m_decks[DECK_MAP_LOCS].ch, 
                    doDeal, doSpread, doTop, doBottom);
  doDeal = false, doSpread = false, doTop=true, doBottom=true;
  createDeckButtons(DECK_GENERIC, DECK_CUR_LOCS, 946, 0, m_decks[DECK_GENERIC].cw, m_decks[DECK_GENERIC].ch, 
                    doDeal, doSpread, doTop, doBottom);

  //////////////////////////////////////////
  // Camp Counter buttons
  for (let i = 0; i < 4; i++) {
    let b3 = createNormalButton('⬆', width-m_bs, 225*i + 10, m_bs, m_bs);
    b3.mousePressed(function() {
      if (m_players[i].campCounter < 2) m_players[i].campCounter++;
    });
    let b4 = createNormalButton('⬇', width-m_bs, 225*i + 40, m_bs, m_bs);
    b4.mousePressed(function() {
      if (m_players[i].campCounter > 0) m_players[i].campCounter--;
    });
  }

  ///////////////////////////////////////////////
  // Test
  // m_buttonTest = createNormalButton('Shuffle Player 1', 7*m_bw, 825, m_bw, m_bh);
  // m_buttonTest.mousePressed(function(){
  //   m_decks[DECK_BEASTMASTER].shuffle();
  //   update();
  // });
  // let b2 = createNormalButton('Shuffle Player 2', 8*m_bw, 825, m_bw, m_bh);
  // b2.mousePressed(function(){
  //   m_decks[DECK_CLERIC].shuffle();
  //   update();
  // });
  // // let b3 = createNormalButton('⬆', 0, m_cw, m_bs, m_bs);
  // let b4 = createNormalButton('top', 200, m_cw, m_bs, m_bs);

  /////////////////////////////////////////////
  // Network communication
  /////////////////////////////////////////////
  
  // socket
  m_socket = io();

  // initPlayer message //
  // After the sketch sends the 'start' message, by pressing the Init button, the server responds with the 'initPlayer' message.
  // By the time this gets called, we should have our m_socket.id and this m_players[0].socketId
  // data: a single Player, and it should be ourselves
  m_socket.on('initPlayer', function(data) {
    console.log('initPlayer message: We got ' , data);
    // Only the player who sent the start message to the server wants to process
    // the initPlayer message
    if (m_mySocketId === data.socketId) {
      console.log('initPlayer message: found player');
      m_initialPlayer.copyFromServerData(data);
      m_players.push(m_initialPlayer);
      m_initialized = true;
      m_initButton.hide();
      m_nameInputButton.hide();
      m_classRadio.hide();
      // m_playerClassNameParagraphs[m_initialPlayer.class].html(m_classNames[m_initialPlayer.class]);
    } else {
      console.log('initPlayer message: This message intended for another player');
    }

  });

  // heartbeat message //
  // data: object containing a Player array and a Table
  m_socket.on('heartbeat', function(data) {
    if (!m_initialPlayer) return;
    console.log('heartbeat message: We got ' , data);
    createPlayersFromServerData(data.players);
    createDecksFromServerData(data.decks);
    setMessageFromServerData(data.message);
    m_firewood = data.firewood;
    m_isOpenSeason = data.isOpenSeason;
    // // Note I wasn't able to pass in m_discards into the function here and fill it in 
    // // using the function argument.  I had to directly specify m_discards in the function.
    // // This is probably because I keep changing what m_discards is.
    // // createCardArrayFromServerData(data.discards, m_discards);
  });

  // update();

}  // setup()

////////////////////////////////////////////////////////////////
// Setup helper functions

function createClassCardsAndAddToDeck(setIdx, deckIdx) {
  for (let i = 0; i < m_setImages[setIdx].length; i++) {
    let card = new Card(setIdx, i, deckIdx);
    card.facedown = false;
    m_decks[deckIdx].addCard(card);
  }
}
function createCreatureCardsAndAddToDeck(setIdx, deckIdx, startIdx, len) {
  for (let i = startIdx; i < startIdx+len; i++) {
    let card = new Card(setIdx, i, deckIdx);
    card.facedown = true;
    m_decks[deckIdx].addCard(card);
  }
}
function createLocationCardsAndAddToDeck(setIdx, deckIdx, startIdx, len) {
  for (let i = startIdx; i < startIdx+len; i++) {
    let card = new Card(setIdx, i, deckIdx);
    card.facedown = true;
    m_decks[deckIdx].addCard(card);
  }
}

// x, y of card
function createDeckButtons(deckIndex, deckDealToIndex, x, y, cw, ch, doDeal=true, doSpread=true, doTop=true, doBottom=true) {
  if (doDeal) {
    let monstDeal = createNormalButton('Deal', x, y+ch/2-m_bs, m_bs, m_bs);
    monstDeal.style('padding', '0px 0px'); 
    monstDeal.style('background-color', "#F0F0F0")
    monstDeal.mousePressed(function(){
      m_decks[deckIndex].moveTopCardToDeck(deckDealToIndex);
      update();
    });
  } 

  if (doSpread) {
    let monstSpread = createNormalButton('Sprd', x, y+ch/2, m_bs, m_bs);
    monstSpread.style('padding', '0px 0px'); 
    monstSpread.style('background-color', "#F0F0F0")
    monstSpread.mousePressed(function(){
      m_decks[deckIndex].isSpread = !m_decks[deckIndex].isSpread;
      if (m_decks[deckIndex].isSpread) monstSpread.style('background-color', "#00F000");
      else                             monstSpread.style('background-color', "#F0F0F0")
      // unselect the top card of the deck which got selected when we clicked on Spread.
      // This doesn't work because the mousePressed() is called after this function
      // m_decks[deckIndex].cards.at(-1).selected = false;
      m_spreadingToppingOrBottoming = true;
      unselectAll();
      update();
    });
  }
  
  if (doTop) {
    let monstTop = createNormalButton('Top', x+cw-m_bs, y+ch/2-m_bs, m_bs, m_bs);
    monstTop.style('padding', '0px 0px'); 
    monstTop.style('background-color', "#F0F0F0")
    monstTop.mousePressed(function(){
      let cards = findSelectedCards();
      for (let card of cards) {
        if (card.setIndex == m_decks[deckIndex].setIndex) {
          // remove from old deck (remove before adding, because adding changes the deckIndex)
          let idx = m_decks[card.deckIndex].findIndexInDeck(card)
          let cards2 = m_decks[card.deckIndex].cards.splice(idx, 1);
          // add to new deck
          cards2[0].facedown = true;
          m_decks[deckIndex].addCard(cards2[0]);
          m_spreadingToppingOrBottoming = true;
          unselectAll();
        } else {
          m_messageP.html("Card is not in the same set as the deck");
        }
      }  // for each card
      update();
    });
  }
  
  if (doBottom) {
    let monstBot = createNormalButton('Bot', x+cw-m_bs, y+ch/2, m_bs, m_bs);
    monstBot.style('padding', '0px 0px'); 
    monstBot.style('background-color', "#F0F0F0")
    monstBot.mousePressed(function(){
      let cards = findSelectedCards();
      for (let card of cards) {
        if (card.setIndex == m_decks[deckIndex].setIndex) {
          // remove from old deck (remove before adding, because adding changes the deckIndex)
          let idx = m_decks[card.deckIndex].findIndexInDeck(card)
          let cards2 = m_decks[card.deckIndex].cards.splice(idx, 1);
          // add to new deck
          cards2[0].facedown = true;
          m_decks[deckIndex].addCardToBottom(cards2[0]);
          unselectAll();
          m_spreadingToppingOrBottoming = true;
        } else {
          m_messageP.html("Card is not in the same set as the deck");
        }
      }
      update();
    });
  }
}  // createDeckButtons()

////////////////////////////////////////////
// NETWORK FUNCTIONS
////////////////////////////////////////////

// called when user presses the Init button
function initPlayerToServer() {
  if (m_nameInputButton.value().length <= 0) {
    // m_messageP.style('color', '#000000');
    m_messageP.html("Enter a real name, buddy");
    return;
  }
  console.log("INITPLAYER");
  m_initialPlayer = new Player(-1, m_nameInputButton.value(), m_classRadio.value());
  // m_initialPlayer.dealer = true;
  m_initialPlayer.socketId = '/#' + m_socket.id; 
  m_thisPlayer = m_initialPlayer;
  m_socket.emit('start', m_initialPlayer);
}  // initPlayerToServer()

// emit all the players and the table to the server
function update() {
  if (m_initialized) {
    let msg = m_messageP.html();
    // console.log('msg = ' + msg)
    let data = {
      players: m_players,
      decks: m_decks,
      message: msg,
      firewood: m_firewood,
      isOpenSeason: m_isOpenSeason,
    };
    m_socket.emit('update', data);
  }
}

// called when we get a heartbeat from the server
// data: array of Player objects
function createPlayersFromServerData(data) {
  console.log('player data = ' , data);
  
  m_playersTemp = [];
  for (p of data) {
    let player = new Player(p.seatPos, p.name, p.class);
    // console.log('heartbeat message: p.seatPos = ' + p.seatPos);
    // console.log('heartbeat message: p.cardY = ' + p.cardY);
    player.copyFromServerData(p);
    m_playersTemp.push(player);
    // console.log('heartbeat message: player.socketId = ' + player.socketId);
    // console.log('heartbeat message: player.seatPos = ' + player.seatPos);
    // console.log('heartbeat message: player.cardY = ' + player.cardY);
  }
  // sort the array by seatPos, so advancing and changing dealer (next hand) work properlu
  // javascript sort converts to strings first, so returning a.seatPos - b.seatPos correctly sorts numbers
  // m_playersTemp.sort((a, b) => {return a.seatPos > b.seatPos});
  m_playersTemp.sort((a, b) => {return a.seatPos - b.seatPos});
  m_players = m_playersTemp;

}  // createPlayersFromServerData()

// data: array of Deck objects
function createDecksFromServerData(data) {
  console.log('deck data = ' , data);
  // this line prevents us from overwriting our decks when we first come up and the server
  // doesn't have any decks yet.  This messes things up for the first person and subsequently everyone
  // has no decks.
  if (data.length == 0) return;

  let decksTemp = [];
  for (d of data) {
    let deck = new Deck();
    deck.copyFromServerData(d);
    decksTemp.push(deck);
  }
  m_decks = decksTemp;

}  // createDeckFromServerData()

// data: String
function setMessageFromServerData(data) {
  // m_messageP.style('background-color', 'FF0000');
  if (m_oldMessage != data) {
    m_oldMessage = data;
    m_colorNum++;
    if (m_colorNum >= m_colors.length) m_colorNum = 0;
  }
  m_messageP.style('color', m_colors[m_colorNum]);
  m_messageP.html(data);
}  //setMessageFromServerData()


////////////////////////////////////////////
// GUI FUNCTIONS
////////////////////////////////////////////

function createNormalButton(name, x, y, w, h) {
  let button = createButton(name);
    button.style('width',  w+'px');
    button.style('height', h+'px');
    button.position(x, y);
    return button;
}  // createNormalButton()

// returns the Card if one is found
function findCardUnderCursor() {

  let foundCard = null;
  let cw, ch;
  for (let d = 0; d < m_decks.length; d++) {
    let deck = m_decks[d];
    cw = deck.cw;
    ch = deck.ch;
    for (let c = 0; c < deck.cards.length; c++) {
      let card = deck.cards[c];
      if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
        foundCard = card;
      }
    }
  }
  return foundCard;

}

function mousePressed() {
  console.log('mousePressed');
  // Don't pay attention to presses in the control area
  if (mouseX > 0 && mouseX < m_cw*8 && mouseY > 750) return;

  ////////////////////////////////////////
  // Dice
  let foundDie = false;
  for (let p = 0; p < m_players.length; p++) {
    // If openSeason is off, don't check other player's dice
    if (!m_isOpenSeason && m_thisPlayer.seatPos != p) continue;
    for (let d = 0; d < m_players[p].dice.length; d++) {
      let die = m_players[p].dice[d];
      if (mouseX > die.x && mouseX < die.x + m_dieSize && mouseY > die.y && mouseY < die.y + m_dieSize) {
        foundDie = true;
        m_players[p].dice[d].selected = !m_players[p].dice[d].selected;
        if (m_players[p].dice[d].selected) {
          // m_selectedDieInfo = { playerNum: p, dieIndex:d, x:mouseX, y:mouseY };
          // let plyr =  m_players[p].seatPos;
          m_selectedDieInfo = { playerNum: p, dieIndex:d, x:m_players[p].dice[d].x, y:m_players[p].dice[d].y };
          console.log('m_selectedDieInfo = ' , m_selectedDieInfo);
          
        }
        // // if we have a
        // if (Object.keys(m_selectedDieInfo).length != 0) m_selectedDieInfo = { player: p, dice:d };
        // else                                        m_selectedDieInfo = {};
      }
    }
  }
  // return if we selected a dice
  // if (Object.keys(m_selectedDieInfo).length != 0) return;
  if (foundDie) {
    update();
    return;
  } else {
    unselectAllDice();
  }

  ////////////////////////////////////////
  // Cards

  // If spreading, topping or bottoming we don't want to select the top card of the deck we just clicked on
  if (m_spreadingToppingOrBottoming) {
    m_spreadingToppingOrBottoming = false;
    return;
  }

  // let foundCard = false;
  // let cw, ch;
  // for (let d = 0; d < m_decks.length; d++) {
  //   let deck = m_decks[d];
  //   cw = deck.cw;
  //   ch = deck.ch;
  //   for (let c = 0; c < deck.cards.length; c++) {
  //     let card = deck.cards[c];
  //     if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
  //       card.selected = !card.selected;
  //       foundCard = true;
  //     }
  //   }
  // }



  let foundCard = findCardUnderCursor();

  // You can't select other plays cards unless it is open season
  if (foundCard && !m_isOpenSeason && foundCard.deckIndex <= DECK_WIZARD && m_thisPlayer.class != foundCard.deckIndex) foundCard = null;

  if (foundCard) foundCard.selected = !foundCard.selected;

  if (!foundCard) {
    foundCard = unselectAll();
  }
  if (foundCard || !foundDie) update();
}

function mouseDragged() {
  // console.log('mouseDragged');
  // If a die is selected
  if (Object.keys(m_selectedDieInfo).length != 0) {
    m_selectedDieInfo.x = mouseX;
    m_selectedDieInfo.y = mouseY;
    m_didDragDie = true;
  }

  // if (m_lastSelectedTableCardIndex != -1) {
  //   m_lastSelectedTableCardPos[0] = mouseX;
  //   m_lastSelectedTableCardPos[1] = mouseY;
  //   m_didDragTableCard = true;
  // }
}

function mouseReleased() {
  console.log('mouseReleased');
  // If we didn't drag the card at all, we just want to select it, so 
  // nothing more needs to be done.
  if (!m_didDragDie) {
    m_selectedDieInfo = {};
    return;
  }

  // If we had a selected die
  if (Object.keys(m_selectedDieInfo).length != 0) {
    // Assign the position of the die and update everyone
    console.log('mouseReleased m_selectedDieInfo = ' , m_selectedDieInfo);
    let x = m_selectedDieInfo.x;
    let y = m_selectedDieInfo.y;
    if (x > 0 && x < m_cw*8 && y > 750-m_dieSize) y = 750-m_dieSize;
    // m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].x = m_selectedDieInfo.x;
    // m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].y = m_selectedDieInfo.y;
    m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].x = x;
    m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].y = y;
    m_players[m_selectedDieInfo.playerNum].dice[m_selectedDieInfo.dieIndex].selected = false;
    m_selectedDieInfo = {};
    m_didDragDie = false;
    update();
  }

}

function unselectAllDice() {
  if (m_isOpenSeason) {
    for (let i = 0; i < m_players.length; i++) {
      for (d of m_players[i].dice) d.selected = false;
    }
  } else {
    for (d of m_players[m_thisPlayer.seatPos].dice) d.selected = false;
  }

}

// Unselect all cards and return boolean if any cards were selected
function unselectAll() {
  let foundSelectedCard = false;
  for (let d = 0; d < m_decks.length; d++) {
    // you can't unselect other people's cards by clicking on the table, unless it's open season
    if (m_thisPlayer.class == d || d > DECK_WIZARD || m_isOpenSeason) {
      for (let c = 0; c < m_decks[d].cards.length; c++) {
        if (m_decks[d].cards[c].selected) {
          m_decks[d].cards[c].selected=false;
          foundSelectedCard = true;
        }
      }
    }
  }
  return foundSelectedCard;
}

// returns an array of all selected cards
function findSelectedCards() {
  let cards = [];
  for (let d = 0; d < m_decks.length; d++) {
    for (let c = 0; c < m_decks[d].cards.length; c++) {
      if (m_decks[d].cards[c].selected) {
       cards.push(m_decks[d].cards[c]);
      }
    }
  }
  return cards;
}

function flipCards() {
  let cards = findSelectedCards();
  console.log('cards = ' , cards);
  
  for (let i = 0; i < cards.length; i++) {
    cards[i].facedown = !cards[i].facedown;
  }

  if (cards.length > 0) update();
}

function exhaustToggleCards() {
  let cards = findSelectedCards();
  for (let i = 0; i < cards.length; i++) {
    cards[i].exhausted = !cards[i].exhausted;
  }

  if (cards.length > 0) update();
}

function shiftLeft() {
  console.log('shiftLeft');
  let cards = findSelectedCards();
  let didShift = false;
  console.log('cards.length = ' , cards.length);
  
  for (let i = 0; i < cards.length; i++) {
    // find the deck and the index inside the deck of this card.
    let deck = m_decks[cards[i].deckIndex];
    let indexInDeck = deck.findIndexInDeck(cards[i]);

    // 0 is legal index but you can't shift it left
    if (indexInDeck >=1 ) {
      [deck.cards[indexInDeck-1], deck.cards[indexInDeck]] = [deck.cards[indexInDeck], deck.cards[indexInDeck-1]];
      didShift = true;
    }
  }
  console.log('m_decks[0] = ' , m_decks[0]);
  
  if (didShift) update();
}

function swapTwoCards() {
  console.log('swapTwoCards');
  let cards = findSelectedCards();
  if (cards.length != 2) {
    m_messageP.html('You can only swap exactly two cards');
    update();
    return;
  }
  if (cards[0].setIndex != cards[1].setIndex) {
    m_messageP.html('You can only swap two cards from the same Set');
    update();
    return;
  }

  let deck1 = m_decks[cards[0].deckIndex];
  let indexInDeck1 = deck1.findIndexInDeck(cards[0]);
  let deck2 = m_decks[cards[1].deckIndex];
  let indexInDeck2 = deck2.findIndexInDeck(cards[1]);

  // Swap the deck indexes inside the cards in case they are not the same
  let temp = cards[0].deckIndex;
  cards[0].deckIndex = cards[1].deckIndex;
  cards[1].deckIndex = temp;

  // Now swap the cards
  [deck1.cards[indexInDeck1], deck2.cards[indexInDeck2]] = [deck2.cards[indexInDeck2], deck1.cards[indexInDeck1]];
  update();

}

function shuffleDeckOfSelectedCard() {
  let cards = findSelectedCards();
  if (cards.length != 1) {
    m_messageP.html('You must have exactly 1 card selected');
    update();
    return;
  }

  cards[0].selected = false;
  m_decks[cards[0].deckIndex].shuffle();
  update();

}

function removeSelectedCardFromGame() {
  let cards = findSelectedCards();
  if (cards.length == 0) {
    m_messageP.html('You must selected at least 1 card');
    update();
    return;
  }
  for (let card of cards) {
    card.selected = false;
    let idx = m_decks[card.deckIndex].findIndexInDeck(card)
    let cards2 = m_decks[card.deckIndex].cards.splice(idx, 1);
    cards2[0].selected = false;  // this is redundant
    m_decks[DECK_REMOVED_FROM_GAME].addCard(cards2[0]);
  }
  update();
}

function toggleOpenSeason() {
  m_isOpenSeason = !m_isOpenSeason;
  update();
  // if (m_isOpenSeason) m_buttonOpenSeason.style('background-color', "#00FF00");
  // else                m_buttonOpenSeason.style('background-color', "#FF0000");
}

function rollAllDice() {
  for (let p of m_players) {
    for (let d = 0; d < p.dice.length; d++) {
      let die = p.dice[d];
      die.curValue = floor(random(die.maxValue)) + 1;
      die.x = 1150+m_dieSize*d;
      die.y = 35+225*p.seatPos
      die.selected = false;
    }
  }
  update();
}

function rollSelectedDice() {
  // let p = m_thisPlayer.seatPos;
  for (let p of m_players) {
    if (!m_isOpenSeason && m_thisPlayer.seatPos != p.seatPos) continue;

    // for (let d = 0; d < m_players[p].dice.length; d++) {
      // let die = m_players[p].dice[d];
    for (let d = 0; d < p.dice.length; d++) {
      let die = p.dice[d];
      if (die.selected) {
        die.curValue = floor(random(die.maxValue)) + 1;
        die.selected = false;
      }
    }
  }
  update();
}
function incrementSelectedDice() {
  // let p = m_thisPlayer.seatPos;
  for (let p of m_players) {
    if (!m_isOpenSeason && m_thisPlayer.seatPos != p.seatPos) continue;
    // for (let d = 0; d < m_players[p].dice.length; d++) {
      // let die = m_players[p].dice[d];
    for (let d = 0; d < p.dice.length; d++) {
      let die = p.dice[d];
      if (die.selected) {
        die.curValue += 1;
        if (die.curValue > die.maxValue) die.curValue = 1;
      }
    }
  }
  update();
}
function decrementSelectedDice() {
  // let p = m_thisPlayer.seatPos;
  for (let p of m_players) {
    if (!m_isOpenSeason && m_thisPlayer.seatPos != p.seatPos) continue;
    // for (let d = 0; d < m_players[p].dice.length; d++) {
    //   let die = m_players[p].dice[d];
    for (let d = 0; d < p.dice.length; d++) {
      let die = p.dice[d];
      if (die.selected) {
        die.curValue -= 1;
        if (die.curValue <= 0) die.curValue = die.maxValue;
      }
    }
  }
  update();
}

function campCheckMap() {
  // Add the top card from both Unused Locations and Locations to the Temporary Locations
  m_decks[DECK_UNUSED_LOCS].moveTopCardToDeck(DECK_TEMP_LOCS);
  m_decks[DECK_MAP_LOCS].moveTopCardToDeck(DECK_TEMP_LOCS);
  // for (card of m_decks[DECK_MAP_LOCS].cards) card.facedown = false;
}

function campWizardTeleport() {
  // Add the top 4 cards of Unseen Locations to the Temporary Location
  for (let i = 0; i < 4; i++) m_decks[DECK_UNUSED_LOCS].moveTopCardToDeck(DECK_TEMP_LOCS);
}

////////////////////////////////////////////
// DRAW FUNCTIONS
////////////////////////////////////////////

function draw() {
  // The m_socket doesn't get an actual ID until after we are out of setup();
  // Hopefully by the time we receive our first message from the socket, we
  // have executed the lie of code below
  // m_players[0].socketId = '/#' + m_socket.id;
  m_mySocketId = '/#' + m_socket.id;

  background(220);
  stroke(0);
  noFill();
  // for (let player of m_players) {
  //   text(player.name, 10, 50+100*player.seatPos);
  //   text(m_classNames[player.class], 200, 50+100*player.seatPos);
  //   // console.log('player name/class' , player.name, m_classNames[player.class]);
    
  // }
  // circle(width/2, height/2, 100);

  drawBoard();

  // Debug
  if (m_debugSet != -1)  debugDrawSet(m_debugSet);
  if (m_debugDeck != -1) debugDrawDeck(m_debugDeck);

  // check for cursor over a card
  checkCardHover();
  checkCampAbilityHover();

  if (m_isOpenSeason) m_buttonOpenSeason.style('background-color', "#00FF00");
  else                m_buttonOpenSeason.style('background-color', "#FF0000");

}  // draw()

// Setting m_debugSet to soemthing other than -1 causes this function to be called in draw();
function debugDrawSet(setIdx) {
  let xpos = 0;
  let ypos = -m_ch;
  for (let i = 0; i < m_setImages[setIdx].length; i++) {
    if (i % 10 == 0) {xpos = 0; ypos += m_ch}
    image(m_setImages[setIdx][i], xpos, ypos, m_cw, m_ch);
    xpos += m_cw;
  }
}
// Setting m_debugSet to soemthing other than -1 causes this function to be called in draw();
function debugDrawDeck(deckIdx) {
  let xpos = 0;
  let ypos = -m_ch;
  let deck = m_decks[deckIdx];
  for (let i = 0; i < deck.cards.length; i++) {
    let card = deck.cards[i];
    let setIdx = card.setIndex;
    let idx = card.index;
    if (i % 10 == 0) {xpos = 0; ypos += m_ch}
    image(m_setImages[setIdx][idx], xpos, ypos, m_cw, m_ch);
    xpos += m_cw;
  }
}

function drawBoard() {
  if (!m_initialized) return;
  if (m_decks.length == 0) return;
  if (m_players.length == 0) return;
  textSize(16);
  noFill();

  // camp image
  image(m_campImage, 0, m_cw);

  ////////////////////////////
  // Players - must be drawn before decks in case any of them are 'spread'
  for (player of m_players) player.showNoDice();

  // locations
  m_decks[DECK_UNUSED_LOCS].show(0, 0, 0, 0);
  m_decks[DECK_MAP_LOCS].show(m_ch, 0, 0, 0);
  m_decks[DECK_CUR_LOCS].show(2*m_ch, 0, 0, 0);
  stroke(0); noFill(); strokeWeight(1);
  rect(0, 0, m_ch, m_cw);
  text('UNUSED: ' + m_decks[DECK_UNUSED_LOCS].cards.length, 0, m_cw/2);
  rect(0, 0, m_ch, m_cw);
  text('   MAP: ' + m_decks[DECK_MAP_LOCS].cards.length, m_ch, m_cw/2);
  rect(0, 0, m_ch, m_cw);
  text('CURRENT: ' + m_decks[DECK_CUR_LOCS].cards.length, 2*m_ch, m_cw/2);

  // JMU this should be put in a function can then called once per deck
  // Hoard
  stroke(0); noFill(); strokeWeight(1);
  rect(700, 0, m_cw, m_ch);
  m_decks[DECK_HORDE].show(700, 0, 0, 0);
  stroke(0); fill(0); strokeWeight(1); textSize(16);
  text("HOARD "+m_decks[DECK_HORDE].cards.length, 700, m_ch/2)

  // Monsters
  stroke(0); noFill(); strokeWeight(1);
  rect(700+m_cw, 0, m_cw, m_ch);
  m_decks[DECK_MONSTERS].show(700+m_cw, 0, 0, 0);
  stroke(0); fill(0); strokeWeight(1); textSize(16);
  text("CREAT "+m_decks[DECK_MONSTERS].cards.length, 700+m_cw, m_ch/2)

  // Unhallowed
  stroke(0); noFill(); strokeWeight(1);
  rect(700, m_ch, m_cw, m_ch);
  m_decks[DECK_UNHALLOWED].show(700, m_ch, 0, 0);
  stroke(0); fill(0); strokeWeight(1); textSize(16);
  text("UNHALL " + m_decks[DECK_UNHALLOWED].cards.length, 700, 3*m_ch/2)

  // Graveyard
  stroke(0); noFill(); strokeWeight(1);
  rect(700+m_cw, m_ch, m_cw, m_ch);
  m_decks[DECK_GRAVEYARD].show(700+m_cw, m_ch, 0, 0);
  stroke(0); fill(0); strokeWeight(1); textSize(16);
  text("GRAVE " +m_decks[DECK_GRAVEYARD].cards.length, 700+m_cw, 3*m_ch/2)

  // // player 1 cards
  // for (let i = 0; i < 5; i++) {
  //   rect(width-((i+1)*m_cw), 75, m_cw, m_ch);
  // }
  // if (m_players.length > 0) m_players[0].show();
  // if (m_players.length > 1) m_players[1].show();

  // generic player cards 1
  stroke(0); noFill(); strokeWeight(1);
  for (let i = 0; i < 6; i++) rect(width-((5+1)*m_cw), i*m_ch, m_cw, m_ch);
  m_decks[DECK_GENERIC].show(946, 0, 0, m_ch);
  stroke(0); fill(0); strokeWeight(1); textSize(16);
  text("GENERAL "+m_decks[DECK_GENERIC].cards.length, width-((5+1)*m_cw), m_ch/2)

  // The Line
  noFill();
  for (let i = 0; i < 8; i++) {
    rect(0+i*m_cw, 450, m_cw, m_ch);
    rect(0+i*m_cw, 450+m_ch, m_cw, m_ch);
  }
  stroke(0); fill(0); strokeWeight(1); textSize(16);
  text("LINE", 0, 450+m_ch/2)
  stroke(0); noFill(); strokeWeight(1);
  rect(700+m_cw, m_ch, m_cw, m_ch);
  m_decks[DECK_LINE].show(0, 450, 1, 0, 8);

  // the buttons on the bottom
  stroke(0); noFill(); strokeWeight(1);
  for (let i = 0; i < 9; i++) {
    rect(0+i*m_bw, 750, m_bw, m_bh);
    rect(0+i*m_bw, 750+m_bh, m_bw, m_bh);
  }

  // fire indicator
  let fireX = 687/2;
  let fireY = 109 + (341/2);
  let numReveal = 0;
  if (m_firewood < 7) numReveal = 1;
  else if (m_firewood < 12) numReveal = 2;
  else numReveal = 3;
  stroke(255, 0, 0); fill(255, 0, 0); strokeWeight(1); textSize(32);
  text(m_firewood + '(' + numReveal + ')', fireX-25, fireY);

  // If there is anything in the temporary location deck, draw it
  if (m_decks[DECK_TEMP_LOCS].cards.length > 0) m_decks[DECK_TEMP_LOCS].show();

  // Players Dice -  must be drawn last so they are clickable
  stroke(0); noFill(); strokeWeight(1);
  for (player of m_players) player.showDice();


}  // drawBoard()

function checkCardHover() {
  let card = findCardUnderCursor();
  // only show faceup cards
  if (card ) {
    let deckIndex = card.deckIndex;
    if (m_decks[deckIndex].isSpread || card.facedown == false) {
      let w = m_decks[deckIndex].cw;
      let h = m_decks[deckIndex].ch;
      let set = m_setImages[card.setIndex];
      let x = width/2 - w;
      let y = height/2 - h;
      image(set[card.index], x, y, w*2, h*2);
    }
  }

}  // checkCardHover()

function checkCampAbilityHover() {
  let ability = -1;
  for (let i = 0; i < m_players.length; i++) {
    let minX = 1150,       maxX = minX+100;
    let minY = 5 + 225*i, maxY = minY + 25
    if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY)  ability = i;
  }

  // if (ability > -1) {
  //   fill(100); stroke(0); strokeWeight(1);
  //   rect(450, 400, 700, 200);
  //   stroke(0); noFill(); textSize(16);
  //   text(m_classCampFull, 460, 410);
  // }

  if (ability > -1) {
    let abilityIdx = m_players[ability].class;
    m_playerClassNameParagraph.html(m_classCampFull[abilityIdx]);
    m_playerClassNameParagraph.show();
  } else {
    m_playerClassNameParagraph.hide();
    m_playerClassNameParagraph.html("");
  }
}