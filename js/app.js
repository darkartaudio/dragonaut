// =================================================================================
// GLOBAL DOM / VARIABLES
// =================================================================================
const gridSize = 32; // number of pixels in each map square, also corresponds to size of character/monster/item sprites (32 x 32)
const viewRange = 3; // number of map squares in each direction that the character can see

const game = document.querySelector('#game');
const story = document.querySelector('#story');
const storyContainer = document.querySelector('#story-container');
const choices = document.querySelector('#choices');
const setupContainer = document.querySelector('#setup-container');
const setupForm = document.querySelector('#setup-form');

// =================================================================================
// SETUP FOR CANVAS RENDERING
// 2D rendering context for canvas element
// This is used for drawing shapes, text, images, etc.
// =================================================================================
game.setAttribute('height', getComputedStyle(game)['height']);
game.setAttribute('width', getComputedStyle(game)['width']);
const ctx = game.getContext('2d');


// Initialize arrays for dragons and items
let dragons = [];
let items = [];

// Initializes player character and variable to contain movmentEngine loop
let character;
let runGame;

// Initializes variable for attack timeout, so that it can be cancelled when dragon dies
let attackTimeout;

// Initialize active dragon holder for combat
let activeDragon;

// Initialize array for game events
// Important game events will be added to this array and displayed
let gameEvents = [];

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
// let map = [
//     //    0    1    2
//     ['0', 'G', '0'], // 00
//     ['-', '-', '-'], // 01
//     ['-', 'g', '-'], // 02
//     ['-', '-', '-'], // 03
//     ['0', 'W', '0'], // 04
//     ['-', '-', '-'], // 05
//     ['-', 'w', '-'], // 06
//     ['-', '-', '-'], // 07
//     ['0', 'R', '0'], // 08
//     ['-', '-', '-'], // 09
//     ['-', 'r', '-'], // 10
//     ['-', '-', '-'], // 11
//     ['0', 'Y', '0'], // 12
//     ['-', '-', '-'], // 13
//     ['-', 'y', '-'], // 14
//     ['-', '-', '-'], // 15
//     ['0', 'C', '0']  // 16
// ];

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
    ['0', '0', '0', '0', '-', '0', '0', '0', '0'],  // 11
    ['0', '0', '0', '0', 'C', '0', '0', '0', '0']  // 12
];

// =================================================================================
// IMAGES FOR USE WITH MAP
// =================================================================================
const wallTile = document.createElement('img');
wallTile.src = './img/stone-wall.png';

const floorTile = document.createElement('img');
floorTile.src = './img/stone-floor.png';

const darkTile = document.createElement('img');
darkTile.src = './img/dark-tile.png';

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

// function to set up and start game
// launched when player fills out character details and chooses Start Game
function gameSetup(e) {
    e.preventDefault();
    
    // create new character with name and class as chosen by user,
    // then reset and remove setup form, display game status instead
    charName = setupForm.elements['character-name'].value;
    charClass = setupForm.elements['character-class'].value;
    setupForm.reset();
    character = new Character(charName, charClass);
    setupContainer.remove();
    choices.style.justifyContent = 'left';
    choices.append(gameStatus, attackButtons);
    
    // clears and then adds game directions to story
    gameEvents = [];
    gameEvents.unshift('Gather items and slay dragons!');
    gameEvents.unshift('a - left | d - right | w - up | s - down');
    
    addDragons();
    addItems();
    
    runGame = setInterval(movementEngine, 60);
    
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
        this.x = 4;
        this.y = 12;

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
        this.attackTypes.forEach((i) => {
            let btn = document.querySelector(`#${i}-attack`);
            btn.disabled = false;
        });
    }

    attack(attackType) {
        // disable attacks for 3 seconds
        this.disableAttacks();
        attackTimeout = setTimeout(() => { character.enableAttacks() }, 3000);

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

        gameEvents.unshift(attackMsg);
        updateStory();
        if (attackSize > 0) { // if the attack is a hit
            activeDragon.receiveAttack(attackSize, attackType);
        }
    }
    
    receiveAttack(attackSize, attackType) {
        this.attackTypes.forEach((a) => {
            if (a === attackType) {
                attackSize = Math.floor(attackSize * 0.5);
                gameEvents.unshift(`${character.name} resists some of the damage.`);
            }
        });

        this.health -= attackSize;

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }

        this.updateGameStatus();
    }

    die() {
        gameEvents = [];
        gameEvents.unshift(`${this.name} was slain!`);
        gameEvents.unshift('Dragons continue to ravage the countryside until a worthy hero arrives.');

        resetGame();
    }
    
    render() {
        // since view is centered on character, canvas location of character will always be 3x3
        // draw character on canvas
        ctx.drawImage(this.img, 3 * gridSize, 3 * gridSize, this.width, this.height);
    
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
        this.effective = effective;
        this.resist = resist;
        this.alive = true;
        this.img = dragonImg;
        this.x = dragonX;
        this.y = dragonY;
        this.height = gridSize;
        this.width = gridSize;
    }

    render() {
        // if dragon is alive, draw dragon on canvas
        if (isVisible(this) && this.alive) {
            let xOffset = character.x - this.x;
            let yOffset = character.y - this.y;
            ctx.drawImage(this.img, (viewRange - xOffset) * gridSize, (viewRange - yOffset) * gridSize, this.width, this.height);
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

        attackMsg += ` ${character.name} with `;

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
            case 'five-headed hyrda':
                attackType = 'acid';
                break;
        }
            
        attackMsg += ` ${attackType} breath!`;
        gameEvents.unshift(attackMsg);
        if (attackSize > 0) { // if the attack is a hit
            character.receiveAttack(attackSize, attackType);
        }
    }

    receiveAttack(attackSize, attackType) {
        if (attackType === this.effective) {
            attackSize = Math.floor(attackSize * 2);
            gameEvents.unshift(`The ${this.name} howls in agony!`);
        }

        if (attackType === this.resist) {
            attackSize = Math.floor(attackSize * 0.5);
            gameEvents.unshift(`The ${this.name} resists some of the damage.`);
        }

        this.health -= attackSize;

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }

        updateStory();
    }

    die() {
        this.alive = false;
        gameEvents.unshift(`${character.name} has slain the ${this.name}!`);

        // exit combat
        endCombat();
    }
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
                gameEvents.unshift(`${character.name} learns an ice attack!`);
                break;
            case 'green book':
                character.attackTypes.push('acid');
                gameEvents.unshift(`${character.name} learns an acid attack!`);
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
    dragons = [];
    // constructor(dragonName, dragonImg, dragonHealth, dragonX, dragonY, effective, resist)
    dragons.push(new Dragon('yellow dragon', yellowDragon, 20, 1, 9, 'acid', 'shock'));
    dragons.push(new Dragon('red dragon', redDragon, 30, 7, 2, 'ice', 'fire'));
    dragons.push(new Dragon('white dragon', whiteDragon, 40, 1, 2, 'fire', 'ice'));
    dragons.push(new Dragon('five-headed hydra', hydraFive, 20, 4, 5, '', ''));
}

function addItems() {
    items = [];
    items.push(new Item('yellow book', yellowBook, 7, 10));
    items.push(new Item('red book', redBook, 1, 10));
    items.push(new Item('white book', whiteBook, 1, 1));
    items.push(new Item('green book', greenBook, 7, 1));
}

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

// draw the 7x7 map square around character
function renderMap() { 
    // // // // // // //
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

function renderDragons() {
    dragons.forEach((d) => {
        d.render();
    });
}

function renderItems() {
    // items.forEach((i) => {
    //     i.render();
    // })
}

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
            newEvent.textContent = gameEvents[i];
            storyContainer.append(newEvent);
        }
    }
}

function updateStory() {
    clearStory();
    displayStory();
}

function clearCanvas() {
    ctx.clearRect(0, 0, game.width, game.height);
}

function movementEngine() {
    clearCanvas();

    renderMap();
    renderDragons();
    renderItems();
    character.render();

    updateStory();
}

function combatEngine() {
    if (activeDragon.alive) {
        activeDragon.attack();
    } else { // dragon is dead
    }
    
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

function winGame() {
    gameEvents = [];
    gameEvents.unshift(`${character.name} hath smote the ravaging horde of dragons!`);
    gameEvents.unshift('The country folk may now enjoy a life of peace and prosperity!');
    gameEvents.unshift(`Hail ${character.name}!!`);

    resetGame();
}

function combat(d) {
    removeMovementHandler();
    clearInterval(runGame);
    activeDragon = d;
    character.enableAttacks();
    runGame = setInterval(combatEngine, 5000);
    updateStory();
}

function resetGame() {
    clearInterval(runGame);
    clearCanvas();

    choices.innerHTML = '';
    choices.append(setupContainer);
    choices.style.justifyContent = 'center';
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