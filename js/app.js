// =================================================================================
// GLOBAL VARIABLES
// =================================================================================

// number of pixels in each map square, also corresponds to size of character/monster/item sprites (32 x 32)
const gridSize = 32; 

// number of map squares in each direction that the character can see
// need to adjust canvas size in style.css if this number gets big
const viewRange = 3; 

// Initialize arrays for dragons, items, and poof effects
let dragons = [];
let items = [];
let poofs = [];

// Initialize player character and variable to contain movmentEngine loop
let character;
let runGame;

// Initialize variable for attack timeout, cancelled when combat ends
let attackTimeout;

// Initialize active dragon holder for combat
let activeDragon;

// Initialize array for game events
// Each event will be an object containing 
// { 
//  text: the event text,
//  class: list of classes to apply styling to this event
// }
let gameEvents = [];
    
// Array of instructions to display on load
let instructions = [
    { text: 'Create your character!', class: 'storymsg' },
    { text: '', class: 'invis' },
    { text: 'Move around the board using the w-a-s-d keys.', class: 'storymsg' },
    { text: 'Collect books to gain elemental knowledge.', class: 'storymsg' },
    { text: 'Move into a square occupied by a dragon to engage it in combat.', class: 'storymsg' },
    { text: '', class: 'invis' },
    { text: 'Win the game by slaying all of the dragons!', class: 'storymsg' },
    { text: `If the character's health falls to zero, the game is over!`, class: 'storymsg' }
];

// =================================================================================
// GLOBAL DOM VARIABLES
// =================================================================================

const game = document.querySelector('#game');
const story = document.querySelector('#story');
const storyContainer = document.querySelector('#story-container');
const choices = document.querySelector('#choices');
const setupContainer = document.querySelector('#setup-container');
const setupForm = document.querySelector('#setup-form');

const startButton = setupForm.querySelector('button');
startButton.disabled = true;

// Set up game status div, which will be displayed when game starts
const gameStatus = document.createElement('div');
    gameStatus.setAttribute('id', 'game-status');

    const statusName = document.createElement('div');
        statusName.setAttribute('id', 'status-name');
    const statusClass = document.createElement('div');
        statusClass.setAttribute('id', 'status-class');
    const statusHealth = document.createElement('div');
        statusHealth.setAttribute('id', 'status-health');

gameStatus.append(statusName, statusClass, statusHealth);

// Set up attackButtons div, which is the player interface for combat
const attackButtons = document.createElement('div');
    attackButtons.setAttribute('id', 'attack-buttons');

    const normalButton = document.createElement('button');
        normalButton.setAttribute('id', 'normal-attack');
        normalButton.setAttribute('class', 'attack-button');
        normalButton.textContent = 'normal attack';
        normalButton.disabled = true;
    const shockButton = document.createElement('button');
        shockButton.setAttribute('id', 'shock-attack');
        shockButton.setAttribute('class', 'attack-button');
        shockButton.textContent = 'shock attack';
        shockButton.disabled = true;
    const fireButton = document.createElement('button');
        fireButton.setAttribute('id', 'fire-attack');
        fireButton.setAttribute('class', 'attack-button');
        fireButton.textContent = 'fire attack';
        fireButton.disabled = true;
    const iceButton = document.createElement('button');
        iceButton.setAttribute('id', 'ice-attack');
        iceButton.setAttribute('class', 'attack-button');
        iceButton.textContent = 'ice attack';
        iceButton.disabled = true;
    const acidButton = document.createElement('button');
        acidButton.setAttribute('id', 'acid-attack');
        acidButton.setAttribute('class', 'attack-button');
        acidButton.textContent = 'acid attack';
        acidButton.disabled = true;

attackButtons.append(normalButton, shockButton, fireButton, iceButton, acidButton);

// =================================================================================
// SETUP FOR CANVAS RENDERING
// 2D rendering context for canvas element
// This is used for drawing shapes, text, images, etc.
// =================================================================================

game.setAttribute('height', getComputedStyle(game)['height']);
game.setAttribute('width', getComputedStyle(game)['width']);
const ctx = game.getContext('2d');

// =================================================================================
// MAP
// =================================================================================
// LEGEND
//
// G = green dragon, W = white dragon, R = red dragon, Y = yellow dragon
// g = green book, w = white book, r = red book, y = yellow book
// C = character
// 0 = wall tile
// - = floor tile
//
// 0 values are used by renderMap function to create functional barriers
// other values are for easily visually laying out the map and have no functional effect
// =================================================================================

let map = [
//    0    1    2    3    4    5    6    7    8
    ['0', '0', '0', '0', '0', '0', '0', '0', '0'], // 00
    ['0', 'w', '0', '-', '-', '-', '0', 'g', '0'], // 01
    ['0', 'W', '0', '-', '-', '-', '0', 'R', '0'], // 02
    ['0', '-', '-', '-', '-', '-', '-', '-', '0'], // 03
    ['0', '-', '-', '0', '0', '0', '-', '-', '0'], // 04
    ['0', '-', '-', '0', 'G', '0', '-', '-', '0'], // 05
    ['0', '-', '-', '0', '-', '0', '-', '-', '0'], // 06
    ['0', '-', '-', '-', '-', '-', '-', '-', '0'], // 07
    ['0', '-', '-', '-', '-', '-', '-', '-', '0'], // 08
    ['0', 'Y', '0', '-', '-', '-', '0', '-', '0'], // 09
    ['0', 'r', '0', '-', '-', '-', '0', 'y', '0'], // 10
    ['0', '0', '0', '0', '-', '0', '0', '0', '0'], // 11
    ['0', '0', '0', '0', 'C', '0', '0', '0', '0']  // 12
];

// =================================================================================
// IMAGES FOR USE WITH MAP
// =================================================================================

// Tiles
const wallTile = document.createElement('img');
    wallTile.src = './img/stone-wall.png';

const floorTile = document.createElement('img');
    floorTile.src = './img/stone-floor.png';

const darkTile = document.createElement('img');
    darkTile.src = './img/dark-tile.png';

// Books
const yellowBook = document.createElement('img');
    yellowBook.src = './img/book-yellow.png';

const redBook = document.createElement('img');
    redBook.src = './img/book-red.png';

const whiteBook = document.createElement('img');
    whiteBook.src = './img/book-white.png';

const greenBook = document.createElement('img');
    greenBook.src = './img/book-green.png';

// Dragons
const yellowDragon = document.createElement('img');
    yellowDragon.src = './img/dragon-yellow.png';

const redDragon = document.createElement('img');
    redDragon.src = './img/dragon-red.png';

const whiteDragon = document.createElement('img');
    whiteDragon.src = './img/dragon-white.png';

// Hydra phases
const hydraFive = document.createElement('img');
    hydraFive.src = './img/hydra5.png';
const hydraFour = document.createElement('img');
    hydraFour.src = './img/hydra4.png';
const hydraThree = document.createElement('img');
    hydraThree.src = './img/hydra3.png';
const hydraTwo = document.createElement('img');
    hydraTwo.src = './img/hydra2.png';
const hydraOne = document.createElement('img');
    hydraOne.src = './img/hydra1.png';

// Dragon death poof phases
const poof1 = document.createElement('img');
    poof1.src = './img/poof1.png';
const poof2 = document.createElement('img');
    poof2.src = './img/poof2.png';
const poof3 = document.createElement('img');
    poof3.src = './img/poof3.png';    
const poof4 = document.createElement('img');
    poof4.src = './img/poof4.png';

// Game start, over, and win images
const gameStartImg = document.createElement('img');
    gameStartImg.src = './img/game-start.png';

const gameOverImg = document.createElement('img');
    gameOverImg.src = './img/game-over.png';

const gameWinImg = document.createElement('img');
    gameWinImg.src = './img/game-win.png'

// =================================================================================
// EVENT LISTENERS
// =================================================================================

// function to set up and start game
// launched when player fills out character details and chooses Start Game
function gameSetup(e) {
    e.preventDefault();

    // stop the instructions interval
    clearInterval(runGame);
    
    // create new character with name and class as chosen by user,
    // then reset and remove setup form, displaying game status instead
    charName = setupForm.elements['character-name'].value;
    charClass = setupForm.elements['character-class'].value;
    setupForm.reset();
    character = new Character(charName, charClass);
    setupContainer.remove();
    choices.style.justifyContent = 'left';
    choices.append(gameStatus, attackButtons);
    
    // clear and then add game directions to story
    initStory();
    gameEvents.unshift({ text: 'Gather items and slay dragons!', class: 'storymsg'});
    gameEvents.unshift({ text: 'a - left | d - right | w - up | s - down', class: 'storymsg'});
    gameEvents.unshift({ text: '', class: 'invis' });
    updateStory();

    // add dragons and magic items to the game
    addDragons();
    addItems();
    
    // start movement engine
    runGame = setInterval(movementEngine, 60);
    
    // stop movement handler if it's already running, then start movement handler
    removeMovementHandler();
    document.addEventListener('keydown', movementHandler);
}

// event listener for starting the game
setupForm.addEventListener('submit', gameSetup);
    
// stops the movement engine event listener
function removeMovementHandler() {
    document.removeEventListener('keydown', movementHandler);
}

// event listeners for attack buttons
normalButton.addEventListener('click', (e) => {
    character.attack('normal');
});

shockButton.addEventListener('click', (e) => {
    character.attack('shock');
});

fireButton.addEventListener('click', (e) => {
    character.attack('fire');
});

iceButton.addEventListener('click', (e) => {
    character.attack('ice');
});

acidButton.addEventListener('click', (e) => {
    character.attack('acid');
});

// when the page loads, display tagline, instructions, and draw splash image to canvas
window.addEventListener('DOMContentLoaded', () => {
    initStory();
    gameEvents.unshift({ text: 'Save the countryside from a pack of ravaging dragons!', class: 'emphasis' });
    gameEvents.unshift({ text: '', class: 'invis' });
    gameEvents.unshift({ text: '', class: 'invis' });
    setTimeout(() => {
        let runGame = setInterval(displayInstructions, 1000);
    }, 1500);
    updateStory();

    clearCanvas();

    // displays a splash image across the canvas
    // don't know why this isn't working without the setTimeout, but this fixes it
    setTimeout(() => {drawAll(gameStartImg)}, 250);
});

// =================================================================================
// CHARACTER, DRAGON, AND ITEM CLASSES
// =================================================================================
class Character {
    constructor(charName, charClass) {
        this.name = charName;
        this.class = charClass;
        this.health = 50 + Math.floor(Math.random() * 10); // start with 50 plus 0-10 hit points

        // attack types the character has knowledge of
        this.attackTypes = ['normal'];

        // height and width of character image
        this.height = gridSize;
        this.width = gridSize;

        // starting map position
        this.x = 4;
        this.y = 12;

        // previous map position, for handling dragon collisions
        this.prevx = this.x;
        this.prevy = this.y;

        // set character icon image to match choice of class
        this.img = document.createElement('img');
        switch (charClass) {
            case 'warrior':
                this.img.setAttribute('src', './img/warrior.png');
                break;
            case 'wizard':
                this.img.setAttribute('src', './img/wizard.png');
                break;
            case 'ranger':
                this.img.setAttribute('src', './img/ranger.png');
                break;
        }
    }

    // displays character name/class/health to the game status area
    updateGameStatus() {
        statusName.textContent = this.name;
        statusClass.textContent = this.class;
        statusHealth.textContent = this.health + ' hp';

    }
    
    // disables attack buttons when not in combat or waiting for attack to recharge
    disableAttacks() {
        [...document.querySelector('#attack-buttons').children].forEach((i) => { // iterates through attack buttons
            i.disabled = true; // disables each button
        });
    }
    
    // enables attack buttons when attacks are available
    enableAttacks() {
        this.attackTypes.forEach((i) => { // iterates through attacks of which player has knowledge
            let btn = document.querySelector(`#${i}-attack`);
            btn.disabled = false; // enables known buttons
        });
    }

    // called when the character attempts to hit an enemy with an attack
    attack(attackType) {
        // disable attacks for 3 seconds
        this.disableAttacks();
        attackTimeout = setTimeout(() => { this.enableAttacks() }, 3000);

        // calculate attack success/damage/message
        let attackSize = 0;
        let attackMsg = `${this.name} `;

        let attackRoll = Math.floor(Math.random() * 100);
        if (attackRoll > 25) { // hit
            if (attackRoll > 95) { // critical hit, 5 damage
                attackMsg += 'massacres';
                attackSize = 5;
            } else { // normal hit, 3 damage
                attackMsg += 'hits';
                attackSize = 3;
            }
        } else { // miss, no damage
            attackMsg += 'misses';
        }

        
        attackMsg += ` the ${activeDragon.name} with ${attackType} `;
        
        switch (this.class) {
            case 'warrior':
                attackMsg += 'slash!';
                break;
            case 'wizard':
                attackMsg += 'spell!';
                break;
            case 'ranger':
                attackMsg += 'arrow!';
                break;
        }

        // display attack message to story section
        gameEvents.unshift({ text: '', class: 'invis' });
        gameEvents.unshift({ text: attackMsg, class: attackType });
        updateStory();
        
        if (attackSize > 0) { // if the attack is a hit
            activeDragon.receiveAttack(attackSize, attackType); // dragon object receives the attack
        }
    }
    
    // called when an enemy hits the character with an attack
    receiveAttack(attackSize, attackType) {
        this.attackTypes.forEach((a) => {
            if (a === attackType) { // if character has knowledge of attack type
                attackSize = Math.floor(attackSize * 0.5); // attack is less effective
                gameEvents.unshift({ text: `${character.name} resists some of the damage.`, class: 'emphasis' });
            }
        });

        // character takes damage
        this.health -= attackSize;

        // if attack kills the character
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }

        this.updateGameStatus();
    }

    // called when an attack has killed the character
    die() {
        initStory();
        gameEvents.unshift({ text: `${this.name} was slain!`, class: 'emphasis' });
        gameEvents.unshift({ text: '', class: 'invis' });
        gameEvents.unshift({ text: 'Dragons continue to ravage the countryside until a worthy hero arrives.', class: 'storymsg' });

        // draw death splash image on the canvas
        drawAll(gameOverImg);

        // display character creation window so that player can restart game
        resetGame();
    }
    
    render() {
        // since view is centered on character, canvas location of character will always be viewRange x viewRange
        // draw character on canvas
        ctx.drawImage(this.img, viewRange * gridSize, viewRange * gridSize, this.width, this.height);
    
        // update game status
        this.updateGameStatus();
    
        // disable attacks
        // if the game is calling render, we're in movement mode and not combat mode
        this.disableAttacks();
    }
}

class Dragon {
    constructor(dragonName, dragonImg, dragonHealth, dragonX, dragonY, effective, resist) {
        this.name = dragonName;
        this.health = dragonHealth;

        // attack type(s) which are extra effective against the dragon
        this.effective = effective;

        // attack type(s) which are less effective against the dragon
        this.resist = resist;

        // whether the dragon is alive or dead, important for rendering dragons on map as well as checking for victory
        this.alive = true;
        
        // html img tag for dragon icon
        this.img = dragonImg;
        
        // x/y location of dragon on map
        this.x = dragonX;
        this.y = dragonY;
        
        // height/width of dragon icon
        this.height = gridSize;
        this.width = gridSize;
    }

    render() {
        // if dragon is alive, draw dragon on canvas
        if (isVisible(this) && this.alive) {

            // find distance from dragon to character
            let xOffset = character.x - this.x;
            let yOffset = character.y - this.y;
            
            // draw dragon on map
            ctx.drawImage(this.img, (viewRange - xOffset) * gridSize, (viewRange - yOffset) * gridSize, this.width, this.height);
        }
    }

    // called when the dragon attacks the character
    attack() {
        // calculate attack success/damage/message
        let attackSize = 0;
        let attackType = '';
        let attackMsg = `The ${this.name} `;

        let attackRoll = Math.floor(Math.random() * 100);
        if (attackRoll > 25) { // hit
            if (attackRoll > 95) { // critical hit, 5 damage
                attackMsg += 'massacres';
                attackSize = 5;
            } else { // normal hit, 3 damage
                attackMsg += 'hits';
                attackSize = 3;
            }
        } else { // miss, no damage
            attackMsg += 'misses';
        }

        attackMsg += ` ${character.name} with `;

        // set attack type depending on color of dragon
        switch (this.name) {
            case 'yellow dragon':
                attackType = 'shock';
                break;
            case 'red dragon':
                attackType = 'fire';
                break;
            case 'white dragon':
                attackType = 'ice';
                break;
        }
            
        attackMsg += ` ${attackType} breath!`;

        // display attack message to story section
        gameEvents.unshift({ text: '', class: 'invis' });
        gameEvents.unshift({ text: attackMsg, class: attackType });
        
        if (attackSize > 0) { // if the attack is a hit
            character.receiveAttack(attackSize, attackType); // character receives the attack
        }
    }

    // called when the character hits the dragon with an attack
    receiveAttack(attackSize, attackType) {
        if (attackType === this.effective) { // if the attack type is extra effective against the dragon
            attackSize = Math.floor(attackSize * 2); // the attack size is doubled
            gameEvents.unshift({ text: `The ${this.name} howls in agony!`, class: 'emphasis' });
        }

        if (attackType === this.resist) { // if the attack type is less effective against the dragon
            attackSize = Math.floor(attackSize * 0.5); // the attack size is halved
            gameEvents.unshift({ text: `The ${this.name} resists some of the damage.`, class: 'emphasis' });
        }

        this.health -= attackSize; // the dragon takes damage

        if (this.health <= 0) { // if the attack kills the dragon
            this.health = 0;
            this.die();
        }

        updateStory();
    }

    // called when an attack kills the dragon
    die() {
        this.alive = false;

        // create a poof effect that renders on the map
        poofs.push(new Poof(this.x, this.y));

        // display to story section
        gameEvents.unshift({ text: '', class: 'invis' });
        gameEvents.unshift({ text: `${character.name} has slain the ${this.name}!`, class: 'emphasis' });

        // exit combat
        endCombat();
    }
}

// "boss" character, a tougher dragon with multiple phases
class Hydra extends Dragon {
    constructor(dragonName, dragonImg, dragonHealth, dragonX, dragonY, effective, resist) {
        super (dragonName, dragonImg, dragonHealth, dragonX, dragonY, effective, resist);

        this.phase = 5; // the hydra must be "killed" 5 times to actually die
        this.headDown = `One of the hydra's heads falls dead to the ground!`; // message to display when one of the heads has been killed
    }

    // called when the hydra attacks the player
    attack() {
        // calculate attack success/damage/message
        let attackSize = 0;
        let attackType = '';
        let attackMsg = `The ${this.name} `;
        
        let attackRoll = Math.floor(Math.random() * 100);
        if (attackRoll > 25) { // hit
            if (attackRoll > 95) { // critical hit, 5 damage
                attackMsg += 'massacres';
                attackSize = 5;
            } else { // normal hit, 3 damage
                attackMsg += 'hits';
                attackSize = 3;
            }
        } else { // miss, no damage
            attackMsg += 'misses';
        }

        attackMsg += ` ${character.name} with `;

        // set the attack type depending on which phase the hydra is in
        switch (this.phase) {
            case 5:
                attackType = 'chromatic';
                break;
            case 4:
                attackType = 'acid';
                break;
            case 3:
                attackType = 'shock';
                break;
            case 2:
                attackType = 'ice';
                break;
            case 1:
                attackType = 'fire';
                break;
        }
            
        attackMsg += ` ${attackType} breath!`;

        // display attack message to story area
        gameEvents.unshift({ text: '', class: 'invis' }); // add spacer line to the story
        gameEvents.unshift({ text: attackMsg, class: attackType });
        
        if (attackSize > 0) { // if the attack is a hit
            character.receiveAttack(attackSize, attackType); // character receives the attack
        }
    }

    // called when an attack "kills" the hydra
    die() {
        gameEvents.unshift({ text: '', class: 'invis' }); // add spacer line to the story
        
        // change the phase of the dragon and replenish health for phases 5-2
        // type of effective and resisted attacks change, as well as image
        switch (this.phase) {
            case 5:
                gameEvents.unshift({ text: this.headDown, class: 'emphasis' });
                this.effective = 'shock';
                this.resist = 'acid';
                this.img = hydraFour;
                this.health = 20;
                break;
            case 4:
                gameEvents.unshift({ text: this.headDown, class: 'emphasis' });
                this.effective = 'acid';
                this.resist = 'shock';
                this.img = hydraThree;
                this.health = 20;
                break;
            case 3:
                gameEvents.unshift({ text: this.headDown, class: 'emphasis' });
                this.effective = 'fire';
                this.resist = 'ice';
                this.img = hydraTwo;
                this.health = 20;
                break;
            case 2:
                gameEvents.unshift({ text: this.headDown, class: 'emphasis' });
                this.effective = 'ice';
                this.resist = 'fire';
                this.img = hydraOne;
                this.health = 20;
                break;
            case 1: // for phase one, hydra actually dies
                super.die();
                return true;
                break;
        }
        this.render(); // redraw the hydra 
        this.phase--; // hydra phase number is decremented
    }

    render() {
        // since the movement engine isn't redrawing the canvas during combat, we need to take care of a few things to swap hydra images

        // find distance between hydra and character
        let xOffset = character.x - this.x;
        let yOffset = character.y - this.y;

        // clear the square occupied by the hydra to get rid of the previous-phase image
        ctx.clearRect((viewRange - xOffset) * gridSize, (viewRange - yOffset) * gridSize, this.width, this.height);

        // the above also clears the floor tile, so we re-draw that
        ctx.drawImage(floorTile, (viewRange - xOffset) * gridSize, (viewRange - yOffset) * gridSize, this.width, this.height);

        // and then render the dragon as normal
        super.render();
    }
}

// a visual effect that displays when a dragon dies
class Poof {
    constructor(poofX, poofY) {
        // x/y coordinates of effect
        this.x = poofX;
        this.y = poofY;

        // height and width of poof icons
        this.height = gridSize;
        this.width = gridSize;

        // first phase poof image
        this.img = poof1;

        // keeps track of which phase the poof is in
        this.incrementer = 0;

        // and activate phase 1
        this.increment();
    }

    increment() {
        this.incrementer++; // increment to next poof phase
        if(this.incrementer > 4) { // if greater than four, effect is over
            // using shift instead of pop ensures that the oldest poof is the one that is removed
            poofs.shift();
        } else {
            this.img.src = `./img/poof${this.incrementer}.png`; // change poof to different image
            
            // in one second, do this all again until poof effect is over
            setTimeout(() => {
                this.increment();
            }, 1000);
        }
    }

    // draws the poof on the screen
    render() {
        if (isVisible(this)) {

                // finds distance from poof effect to character
                let xOffset = character.x - this.x;
                let yOffset = character.y - this.y;

                // draws poof on map
                ctx.drawImage(this.img, (viewRange - xOffset) * gridSize, (viewRange - yOffset) * gridSize, this.width, this.height);
        }       
    }
}

class Item {
    constructor(itemName, itemImg, itemX, itemY) {
        this.name = itemName;

        // img icon for the item
        this.img = itemImg;

        // x/y coordinates of item
        this.x = itemX;
        this.y = itemY;

        // height/width of img icon
        this.height = gridSize;
        this.width = gridSize;

        // whether the item has been picked up yet
        this.alive = true;
    }
    
    render() {
        // if item is alive (hasn't been picked up yet), and is visible, draw item on canvas
        if (isVisible(this) && this.alive) {

            // find distance between item and character
            let xOffset = character.x - this.x;
            let yOffset = character.y - this.y;

            // draw item on canvas
            ctx.drawImage(this.img, (viewRange - xOffset) * gridSize, (viewRange - yOffset) * gridSize, this.width, this.height);
        }
    }

    // adds corresponding attack to character
    // sets alive = false (i.e. item has been picked up and will no longer render on board)
    pickup() {
        gameEvents.unshift({ text: '', class: 'invis' }); // add a spacer line to the story
        
        switch(this.name) {
            case 'yellow book':
                character.attackTypes.push('shock');
                gameEvents.unshift({ text: `${character.name} gains knowledge of shock!`, class: 'shock' });
                break;
            case 'red book':
                character.attackTypes.push('fire');
                gameEvents.unshift({ text: `${character.name} gains knowledge of fire!`, class: 'fire' });
                break;
            case 'white book':
                character.attackTypes.push('ice');
                gameEvents.unshift({ text: `${character.name} gains knowledge of ice!`, class: 'ice' });
                break;
            case 'green book':
                character.attackTypes.push('acid');
                gameEvents.unshift({ text: `${character.name} gains knowledge of acid!`, class: 'acid' });
                break;
        }
        this.alive = false;
    }
}

// =================================================================================
// KEYBOARD LOGIC
// =================================================================================
function movementHandler(e) {
    let targetX;
    let targetY;

    // set target coordinates based on which key
    switch (e.key) {
        case 'w': // up
            targetX = character.x;
            targetY = character.y - 1;
            break;
        
        case 's': // down
            targetX = character.x;
            targetY = character.y + 1;
            break;

        case 'a': // left
            targetX = character.x - 1;
            targetY = character.y;
            break;
        
        case 'd': // right
            targetX = character.x + 1,
            targetY = character.y;
            break;
        default: // any other key pressed
            return false; // exit movementHandler and do not execute any further code
    }

    if (
        targetX < 0 // trying to leave left edge of map
        || targetX > map[0].length - 1 // right
        || targetY > map.length - 1 // bottom
        || targetY < 0 // top
        || map[targetY][targetX] === '0' // barrier
    ) {
        return false; // don't move character
    } else {
        // store previous location
        character.prevx = character.x;
        character.prevy = character.y;

        // move character
        character.x = targetX;
        character.y = targetY;
    }

    checkForCollisions();
}

// =================================================================================
// CANVAS RENDERING FUNCTIONS
// =================================================================================
function initStory() {
    // creates spacer paragraphs so that story div height stays consistent
    gameEvents = [
        { text: '', class: 'invis' },
        { text: '', class: 'invis' },
        { text: '', class: 'invis' },
        { text: '', class: 'invis' },
        { text: '', class: 'invis' }
    ];
}

// adds all of the dragons to the game in respective locations
function addDragons() {
    dragons = [];
    // constructor(dragonName, dragonImg, dragonHealth, dragonX, dragonY, effective, resist)
    dragons.push(new Dragon('yellow dragon', yellowDragon, 20, 1, 9, 'acid', 'shock'));
    dragons.push(new Dragon('red dragon', redDragon, 30, 7, 2, 'ice', 'fire'));
    dragons.push(new Dragon('white dragon', whiteDragon, 40, 1, 2, 'fire', 'ice'));
    dragons.push(new Hydra('five-headed hydra', hydraFive, 20, 4, 5, '', ''));
}

// adds all of the items to the game in respective locations
function addItems() {
    items = [];
    items.push(new Item('yellow book', yellowBook, 7, 10));
    items.push(new Item('red book', redBook, 1, 10));
    items.push(new Item('white book', whiteBook, 1, 1));
    items.push(new Item('green book', greenBook, 7, 1));
}

// checks if the object is currently visible by the character
function isVisible(obj) {
    // game map coordinates relative to character
    let startX = character.x - viewRange;
    let endX = character.x + viewRange;
    let startY = character.y - viewRange;
    let endY = character.y + viewRange;

    // if obj is within view, return true
    if (
        obj.x >= startX &&
        obj.x <= endX &&
        obj.y >= startY &&
        obj.y <= endY
    ) {
        return true;
    }

    // otherwise return false
    return false;
}

// draw the (viewRange * 2 + 1) by (viewRange * 2 + 1) map square around character
function renderMap() { 
    // // // // // // // <-- example is 7x7
    // - - - - - - - //
    // - - - - - - - //
    // - - - - - - - //
    // - - - C - - - //
    // - - - - - - - //
    // - - - - - - - //
    // - - - - - - - //
    // // // // // // //

    // game map coordinates relative to character
    let startX = character.x - viewRange;
    let endX = character.x + viewRange;
    let startY = character.y - viewRange;
    let endY = character.y + viewRange;


    // we map each map square into a corresponding square on the HTML canvas
    // char and canvas variables initialized here
    let charX;
    let charY
    let canvasY;
    let canvasX;

    // iterate through both the character Y axis and canvas Y axis
    for (charY = startY, canvasY = 0; charY <= endY; charY++, canvasY++) {
        
        // iterate through the both the character X axis and canvas X axis
        for (charX = startX, canvasX = 0; charX <= endX; charX++, canvasX++) {

            // check if coordinates describe a square within the game map
            if (
                charX >= 0 // x coordinate is within left side of map
                && charX < map[0].length // x coordinate is within right side of map
                && charY >= 0 // y coordinate is within top of map
                && charY < map.length // y coordinate is within bottom of map
            ) {
                switch (map[charY][charX]) {
                    case '0': // wall, draw wall tile
                        ctx.drawImage(wallTile, canvasX * gridSize, canvasY * gridSize, gridSize, gridSize);
                        break;
                    default: // floor, draw floor tile
                        ctx.drawImage(floorTile, canvasX * gridSize, canvasY * gridSize, gridSize, gridSize);
                        break;
                }
            } else { // off the map, draw darkness
                ctx.drawImage(darkTile, canvasX * gridSize, canvasY * gridSize, gridSize, gridSize);
            }
        }
    }
}

// draws all of the visible and alive dragons on the canvas
function renderDragons() {
    dragons.forEach((d) => {
        d.render();
    });
}

// draws all of the visible and alive items on the canvas
function renderItems() {
    items.forEach((i) => {
        i.render();
    });
}

// draws all of the visible and alive poofs onto the canvas
function renderPoofs() {
    poofs.forEach((p) => {
        p.render();
    });
}

// blanks out the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, game.width, game.height);
}

// =================================================================================
// COMBAT AND MOVEMENT ENGINE FUNCTIONS
// =================================================================================

// will be called every 60ms when movement aspect of the game is active
function movementEngine() {
    clearCanvas();
    
    renderMap();
    renderDragons();
    renderItems();
    renderPoofs();
    character.render();
    
    updateStory();
}

function combatEngine() {
    // if the dragon is still alive, it attacks
    if (activeDragon.alive) {
        activeDragon.attack();
    }
    
    updateStory();
}

// stops the movement aspect of the game and starts the combat aspect, with "d" being the dragon being fought
function combat(d) {
    // stop the movement
    removeMovementHandler();
    clearInterval(runGame);

    // move character back to previously-occupied square, so it doesn't display on top of dragon
    character.x = character.prevx;
    character.y = character.prevy;
    
    // redraw map one more time to update character position
    movementEngine();

    // store the active dragon for use during combat
    activeDragon = d;

    // enable attack buttons and start combat
    character.enableAttacks();
    runGame = setInterval(combatEngine, 5000);

    updateStory();
}

function endCombat() {
    clearTimeout(attackTimeout); // stop player's attack buttons from becoming activated
    
    clearInterval(runGame); // stop combat engine
    
    // if there are any dragons left alive
    if(dragonsAreAlive()) {
        // start movement engine
        document.addEventListener('keydown', movementHandler);
        runGame = setInterval(movementEngine, 60);
    } else { // all of the dragons are dead, you win!
        winGame();
    }
}

// returns true if any of the dragons are alive, otherwise false
function dragonsAreAlive() {
    for (let i = 0; i < dragons.length; i++) {
        if (dragons[i].alive) {
            return true;
        }
    }
    return false;
}

// =================================================================================
// STORY DISPLAY FUNCTIONS
// =================================================================================
function clearStory() {
    // clear all events from story div
    let displayedEvents = [...storyContainer.querySelectorAll('p')];
    while (displayedEvents.length > 0) {
        displayedEvents[0].parentNode.removeChild(displayedEvents[0]);
        displayedEvents.shift();
    }
}
function displayStory() {
    // display five latest events to story div
    // starting at least recent so that most recent displays last
    for (let i = 4; i >= 0; i--) {
        if(i < gameEvents.length) {
            let newEvent = document.createElement('p');
                newEvent.textContent = gameEvents[i].text;
                newEvent.setAttribute('class', gameEvents[i].class);
            storyContainer.append(newEvent);
        }
    }
}

// clears all story paragraphs, then displays the most recent story
function updateStory() {
    clearStory();
    displayStory();
}

// takes a HTML img element
// slowly draws the img on each square of the canvas in a splash effect
async function drawAll(imgToDraw) {
    let delayTime = 25;
    
    clearCanvas();

    // iterate through the X and Y axes of the canvas
    for (let i = 0; i < (viewRange * 2) + 1; i++) {
        for (let j = 0; j < (viewRange * 2) + 1; j++) {
            // draw image to the current square
            ctx.drawImage(imgToDraw, j * gridSize, i * gridSize, gridSize, gridSize);

            // pause before continuing
            await new Promise(r => setTimeout(r, delayTime));
        }
    }
}

// called when page loads, displays instructions to story area
function displayInstructions() {
    if(instructions.length === 8) { // if we're displaying the first instruction
        initStory(); // clear story first
    }

    if(instructions.length > 0) { // if there are instructions left to display
        gameEvents.unshift(instructions.shift()); // remove the first instruction and display it to story
        updateStory();
    } else { // all instructions have been displayed
        startButton.disabled = false; // enable start game button
    }
}

// adds congratulation to story area
// draws a splash image
// resets game so that player can create another character and play again
function winGame() {
    initStory();
    gameEvents.unshift({ text: `${character.name} hath smote the ravaging horde of dragons!`, class: 'storymsg' });
    gameEvents.unshift({ text: '', class: 'invis' });
    gameEvents.unshift({ text: 'The country folk may now enjoy a life of peace and prosperity!', class: 'storymsg' });
    gameEvents.unshift({ text: '', class: 'invis' });
    gameEvents.unshift({ text: `Hail ${character.name}!!`, class: 'emphasis' });

    drawAll(gameWinImg);
    
    resetGame();
}

// resets game so that player may create another character and play again
function resetGame() {
    // stop any movement or combat engines that are running
    clearInterval(runGame);
    
    // clear out the game status area
    choices.innerHTML = '';

    // add the character creation setup form to the page and style appropriately
    choices.append(setupContainer);
    choices.style.justifyContent = 'center';
}

// =================================================================================
// COLLISION DETECTION
// =================================================================================

// checks if the player has collided with any dragons or items
function checkForCollisions() {
    // iterates through dragons in the game
    dragons.forEach((d) => {
        // if player collides with a dragon, i.e. x and y coordinates are the same
        if(d.alive && d.x === character.x && d.y === character.y) {
            gameEvents.unshift({ text: '', class: 'invis' }); // add spacer line to the story
            gameEvents.unshift({ text: `${character.name} engages a ${d.name} in glorious combat!`, class: 'emphasis' });
            combat(d); // combat begins
        }
    });

    // iterates through items in the game
    items.forEach((i) => {
        // if player collides with an item, i.e. x and y coordinates are the same
        if(i.alive && i.x === character.x && i.y === character.y) {
            i.pickup(); // character picks up the item
        }
    });
}