// =================================================================================
// GLOBAL DOM / VARIABLES
// =================================================================================
const gridSize = 32; // number of pixels in each map square, also corresponds to size of character/monster/item sprites (32 x 32)

const game = document.querySelector('#game');
const story = document.querySelector('#story');
const storyContainer = document.querySelector('#story-container');
const choices = document.querySelector('#choices');
const setupForm = document.querySelector('#setup-form');

const ctx = game.getContext('2d');

// set up game status div, which will be displayed when game starts
const gameStatus = document.createElement('div');
gameStatus.setAttribute('id', 'game-status');
const statusName = document.createElement('div');
statusName.setAttribute('id', 'status-name');
const statusHealth = document.createElement('div');
statusHealth.setAttribute('id', 'status-health');
gameStatus.append(statusName, statusHealth);

let character;
let runGame;

// Important game events will be added to this array and displayed
// Starts with 5 empty events for display purposes
const gameEvents = [
    '',
    '',
    '',
    '',
    ''
];

// =================================================================================
// MAP LEGEND
// G = green dragon, W = white dragon, R = red dragon, Y = yellow dragon
// g = green book, w = white book, r = red book, y = yellow book
// C = character
// 0 = wall tile
// - = floor tile
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

// =================================================================================
// EVENT LISTENERS
// =================================================================================
function removeMovementHandler() {
    document.removeEventListener('keydown', movementHandler);
}

setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // create new character with name and class as chosen by user, then remove
    // setup form and display game status instead
    charName = setupForm.elements['character-name'].value;
    charClass = setupForm.elements['character-class'].value;
    character = new Character(charName, charClass);
    setupForm.remove();
    choices.append(gameStatus);

    // add directions to story
    gameEvents.unshift('Gather items and slay dragons!');
    gameEvents.unshift('a - left | d - right | w - up | s - down');

    // TODO: add items and enemies
    
    runGame = setInterval(gameLoop, 60);

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
        this.health = 10 + Math.floor(Math.random() * 6); // start with 10 plus 0-5 hit points
        this.attackTypes = [];
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

    render() {
        // draw character on canvas
        ctx.drawImage(this.img, this.x * gridSize, this.y * gridSize, this.width, this.height);

        // update game status
        statusName.textContent = this.name;
        statusHealth.textContent = this.health;
    }

    // TODO: attack functionality
    // TODO: receive attack functionality
    // TODO: evade/resist attack functionality
}

// TODO: Dragon class (black dragon, red dragon, white dragon, green five-headed dragon)
class Dragon {
    constructor() {

    }

    // TODO: attack functionality
    // TODO: receive attack functionality
    // TODO: evade/resist attack functionality
}

// TODO: 
class Item {
    constructor() {

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
    }

    if (
        targetX < 0 // trying to leave left edge of map
        || targetX > map[0].length - 1 // right
        || targetY > map.length - 1 // bottom
        || targetY < 0 // top
        || map[targetY][targetX] === '0' // barrier
    ) {
        return false; // ie don't move character
    } else { // move character
        character.x = targetX;
        character.y = targetY;

        gameEvents.unshift(`Moved to: ${character.x}, ${character.y}`);
    }

    // TODO: for each Dragon/Item, check for collision
    checkForCollisions();
}

// TODO: disable movement while in combat
// TODO: handle screen scrolling
// TODO: check for collision with enemies/items after movement

// =================================================================================
// GAME PROCESSES
// =================================================================================
function renderMap() {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            switch (map[i][j]) {
                case '0':
                    ctx.drawImage(wallTile, j * 32, i * 32, 32, 32);
                    break;
                default:
                    ctx.drawImage(floorTile, j * 32, i * 32, 32, 32);
                    break;
            }
        }
    }
}

function renderDragons() {
}

function renderItems() {
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

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, game.width, game.height);
    
    renderMap();
    
    renderDragons();
    renderItems();

    character.render();

    updateStory();
}

// =================================================================================
// COLLISION DETECTION
// =================================================================================
function checkForCollisions() {

}

function detectHit(obj1, obj2) {
    let hitTest = (
        obj1.y + obj1.height > obj2.y &&
        obj1.y < obj2.y + obj2.height &&
        obj1.x + obj1.width > obj2.x &&
        obj1.x < obj2.x + obj2.width
    );

    return hitTest;
}