// =================================================================================
// GLOBAL DOM / VARIABLES
// =================================================================================
const gridSize = 32; // number of pixels in each map square, also corresponds to size of character/monster/item sprites (32 x 32)

const game = document.querySelector('#game');
const story = document.querySelector('#story');
const storyContainer = document.querySelector('#story-container');
const choices = document.querySelector('#choices');
const setupContainer = document.querySelector('#setup-container');
const setupForm = document.querySelector('#setup-form');

const ctx = game.getContext('2d');


// Initialize arrays for dragons and items
const dragons = [];
const items = [];

// Initializes player character and variable to contain movmentEngine loop
let character;
let runGame;

// Initialize active dragon holder for combat
let activeDragon;

// Initialize array for game events
// Important game events will be added to this array and displayed
const gameEvents = [];

// =================================================================================
// MAP LEGEND
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
    //    0    1    2
    ['0', 'G', '0'], // 00
    ['-', '-', '-'], // 01
    ['-', 'g', '-'], // 02
    ['-', '-', '-'], // 03
    ['0', 'W', '0'], // 04
    ['-', '-', '-'], // 05
    ['-', 'w', '-'], // 06
    ['-', '-', '-'], // 07
    ['0', 'R', '0'], // 08
    ['-', '-', '-'], // 09
    ['-', 'r', '-'], // 10
    ['-', '-', '-'], // 11
    ['0', 'Y', '0'], // 12
    ['-', '-', '-'], // 13
    ['-', 'y', '-'], // 14
    ['-', '-', '-'], // 15
    ['0', 'C', '0']  // 16
];

// =================================================================================
// IMAGES FOR USE WITH MAP
// =================================================================================
const wallTile = document.createElement('img');
wallTile.src = './img/stone-wall.png';

const floorTile = document.createElement('img');
floorTile.src = './img/stone-floor.png';

const yellowBook = document.createElement('img');
yellowBook.src = './img/book-yellow.png';

const redBook = document.createElement('img');
redBook.src = './img/book-red.png';

const whiteBook = document.createElement('img');
whiteBook.src = './img/book-white.png';

const greenBook = document.createElement('img');
greenBook.src = './img/book-green.png';

const yellowDragon = document.createElement('img');
yellowDragon.src = './img/dragon-yellow.png';

const redDragon = document.createElement('img');
redDragon.src = './img/dragon-red.png';

const whiteDragon = document.createElement('img');
whiteDragon.src = './img/dragon-white.png';

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

// Set up attackButtons div, which will be updated when character finds a new item
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
// EVENT LISTENERS
// =================================================================================
function removeMovementHandler() {
    document.removeEventListener('keydown', movementHandler);
}

setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // create new character with name and class as chosen by user,
    // then remove setup form and display game status instead
    charName = setupForm.elements['character-name'].value;
    charClass = setupForm.elements['character-class'].value;
    character = new Character(charName, charClass);
    setupContainer.remove();
    choices.style.justifyContent = 'left';
    choices.append(gameStatus, attackButtons);

    // add game directions to story
    gameEvents.unshift('Gather items and slay dragons!');
    gameEvents.unshift('a - left | d - right | w - up | s - down');
    
    addDragons();
    addItems();
    
    runGame = setInterval(movementEngine, 60);

    removeMovementHandler();
    document.addEventListener('keydown', movementHandler);
});

// =================================================================================
// SETUP FOR CANVAS RENDERING
// 2D rendering context for canvas element
// This is used for drawing shapes, text, images, etc.
// =================================================================================
game.setAttribute('height', getComputedStyle(game)['height']);
game.setAttribute('width', getComputedStyle(game)['width']);

// =================================================================================
// ENTITIES
// =================================================================================
class Character {
    constructor(charName, charClass) {
        this.name = charName;
        this.class = charClass;
        this.health = 50 + Math.floor(Math.random() * 10); // start with 50 plus 0-10 hit points
        this.attackTypes = ['normal'];
        this.height = gridSize;
        this.width = gridSize;

        // starting map position
        this.x = 1;
        this.y = 16;

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

    updateGameStatus() {
        statusName.textContent = this.name;
        statusClass.textContent = this.class;
        statusHealth.textContent = this.health + ' hp';

    }
    
    disableAttacks() {
        this.attackTypes.forEach((i) => {
            let btn = document.querySelector(`#${i}-attack`);
            btn.disabled = true;
        });
    }
    
    enableAttacks() {
        this.attackTypes.forEach((i) => {
            let btn = document.querySelector(`#${i}-attack`);
            btn.disabled = false;
        });
    }
    
    receiveAttack(attackSize, attackType) {
        this.attackTypes.forEach((a) => {
            if (a === attackType) {
                attackSize = Math.floor(attackSize * 0.5);
                gameEvents.unshift(`${character.name} resists some of the damage.`);
            }
        });
        this.health -= attackSize;
        this.updateGameStatus();
    }
    
    render() {
        // draw character on canvas
        ctx.drawImage(this.img, this.x * gridSize, this.y * gridSize, this.width, this.height);
    
        // update game status
        this.updateGameStatus();
    
        // disable attacks
        // if the game is calling render, we're in movement mode and not combat mode
        this.disableAttacks();
    }

    // TODO: attack functionality
    // TODO: receive attack functionality
    // TODO: evade/resist attack functionality
}

class Dragon {
    constructor(dragonName, dragonImg, dragonX, dragonY) {
        this.name = dragonName;
        this.height = gridSize;
        this.width = gridSize;
        this.img = dragonImg;
        this.x = dragonX;
        this.y = dragonY;
        this.alive = true;
    }

    render() {
        // if dragon is alive, draw dragon on canvas
        if (this.alive) {
            ctx.drawImage(this.img, this.x * gridSize, this.y * gridSize, this.width, this.height);
        }
    }

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

        attackMsg += ` ${character.name} with its `;

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
            case 'green dragon':
                attackType = 'acid';
                break;
        }
            
        attackMsg += ` ${attackType} breath!`;
        gameEvents.unshift(attackMsg);
        if (attackSize > 0) { // if the attack is a hit
            character.receiveAttack(attackSize, attackType);
        }
    }

    // TODO: attack functionality
    // TODO: receive attack functionality
    // TODO: evade/resist attack functionality
}

class Item {
    constructor(itemName, itemImg, itemX, itemY) {
        this.name = itemName;
        this.height = gridSize;
        this.width = gridSize;
        this.img = itemImg;
        this.x = itemX;
        this.y = itemY;
        this.alive = true;
    }

    render() {
        // if item is alive (hasn't been picked up yet), draw item on canvas
        if (this.alive) {
            ctx.drawImage(this.img, this.x * gridSize, this.y * gridSize, this.width, this.height);
        }
    }

    // adds corresponding attack to character
    // sets alive = false (i.e. item has been picked up and will no longer render on board)
    pickup() {
        switch(this.name) {
            case 'yellow book':
                character.attackTypes.push('shock');
                gameEvents.unshift(`${character.name} learns a shock attack!`);
                break;
            case 'red book':
                character.attackTypes.push('fire');
                gameEvents.unshift(`${character.name} learns a fire attack!`);
                break;
            case 'white book':
                character.attackTypes.push('ice');
                gameEvents.unshift(`${character.name} learns a ice attack!`);
                break;
            case 'green book':
                character.attackTypes.push('acid');
                gameEvents.unshift(`${character.name} learns a acid attack!`);
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
    } else { // move character
        character.x = targetX;
        character.y = targetY;
    }

    checkForCollisions();
}

// TODO: handle screen scrolling

// =================================================================================
// GAME PROCESSES
// =================================================================================
function addDragons() {
    dragons.push(new Dragon('yellow dragon', yellowDragon, 1, 12));
    dragons.push(new Dragon('red dragon', redDragon, 1, 8));
    dragons.push(new Dragon('white dragon', whiteDragon, 1, 4));
    dragons.push(new Dragon('five-headed hydra', hydraFive, 1, 0));
}

function addItems() {
    items.push(new Item('yellow book', yellowBook, 1, 14));
    items.push(new Item('red book', redBook, 1, 10));
    items.push(new Item('white book', whiteBook, 1, 6));
    items.push(new Item('green book', greenBook, 1, 2));
}

function renderMap() {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            switch (map[i][j]) {
                case '0': // barrier
                    ctx.drawImage(wallTile, j * gridSize, i * gridSize, gridSize, gridSize);
                    break;
                default: // non-barrier
                    ctx.drawImage(floorTile, j * gridSize, i * gridSize, gridSize, gridSize);
                    break;
            }
        }
    }
}

function renderDragons() {
    dragons.forEach((d) => {
        d.render();
    })
}

function renderItems() {
    items.forEach((i) => {
        i.render();
    })
}

function updateStory() {
    // clear all events from story div
    let displayedEvents = [...storyContainer.querySelectorAll('p')];
    while (displayedEvents.length > 0) {
        displayedEvents[0].parentNode.removeChild(displayedEvents[0]);
        displayedEvents.shift();
    }

    // display five latest events to story div
    // starting at least recent so that most recent displays last
    for (let i = 4; i >= 0; i--) {
        if(i < gameEvents.length) {
            let newEvent = document.createElement('p');
            newEvent.textContent = gameEvents[i];
            storyContainer.append(newEvent);
        }
    }
}

function movementEngine() {
    // Clear the canvas
    ctx.clearRect(0, 0, game.width, game.height);
    
    renderMap();
    renderDragons();
    renderItems();
    character.render();

    updateStory();
}

function combatEngine() {
    character.enableAttacks();
    activeDragon.attack();
    updateStory();
}

function combat(d) {
    removeMovementHandler();
    clearInterval(runGame);
    activeDragon = d;
    updateStory();
    character.enableAttacks();
    runGame = setInterval(combatEngine, 5000);
    // d.alive = false;
    // document.addEventListener('keydown', movementHandler);
    // runGame = setInterval(movementEngine, 60);
}

// =================================================================================
// COLLISION DETECTION
// =================================================================================
function checkForCollisions() {
    dragons.forEach((d) => {
        if(d.alive && d.x === character.x && d.y === character.y) {
            gameEvents.unshift(`${character.name} engages a ${d.name} in glorious combat!`);
            combat(d);
        }
    });

    items.forEach((i) => {
        if(i.alive && i.x === character.x && i.y === character.y) {
            gameEvents.unshift(`${character.name} finds a ${i.name}.`);
            i.pickup();
        }
    });
}