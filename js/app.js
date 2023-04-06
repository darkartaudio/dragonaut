// GLOBAL DOM / VARIABLES
const game = document.querySelector('#game');
const story = document.querySelector('#story');
const choices = document.querySelector('#choices');
const setupForm = document.querySelector('#setup-form');

const ctx = game.getContext('2d');

let character;
let runGame;

// EVENT LISTENERS
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let charName = setupForm.elements['character-name'].value;
    let charClass = setupForm.elements['character-class'].value;

    character = new Character(charName, charClass);

    // TODO: setup map, add items and enemies

    runGame = setInterval(gameLoop, 60);
    document.addEventListener('keydown', movementHandler);
});


// ====================== SETUP FOR CANVAS RENDERING ======================= //
// 2D rendering context for canvas element
// This is used for drawing shapes, text, images, etc.
game.setAttribute('height', getComputedStyle(game)['height']);
game.setAttribute('width', getComputedStyle(game)['width']);

// console.log(game.height, game.width);

// ====================== ENTITIES ======================= //
class Character {
    constructor(charName, charClass) {
        this.name = charName;
        this.class = charClass;
        this.health = 10 + Math.floor(Math.random() * 6); // start with 10 plus 0-5 hit points
        this.attackTypes = [];
        this.height = 32;
        this.width = 32;
        this.x = 0;
        this.y = 0;

        switch (charClass) {
            case 'warrior':
                this.img = "../img/warrior.png";
                break;
            case 'wizard':
                this.img = "../img/wizard.png";
                break;
            case 'ranger':
                this.img = "../img/ranger.png";
                break;
        }

        this.render = function () {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    // TODO: attack functionality
    // TODO: receive attack functionality
    // TODO: evade/resist attack functionality
}

// TODO: Dragon class (black dragon, red dragon, blue dragon, green five-headed dragon)
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

// ====================== KEYBOARD LOGIC ======================= //
function movementHandler(e) {
    // TODO: handle game boundaries
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            character.y - 32 >= 0 ? (character.y -= 32) : null;
            break;
        
        case 's':
        case 'ArrowDown':
            character.y + 32 <= game.height - character.height ? (character.y += 32) : null;
            break;

        case 'a':
        case 'ArrowLeft':
            character.x - 32 >= 0 ? (character.x -= 32) : null;
            break;
        
        case 'd':
        case 'ArrowRight':
            character.x + 32 <= game.width - character.width ? (character.x += 32) : null;
            break;
    }
}

// TODO: disable movement while in combat
// TODO: handle screen scrolling
// TODO: check for collision with enemies/items after movement

// ====================== GAME PROCESSES ======================= //
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, game.width, game.height);

    // TODO: for each Dragon, render if alive
    // TODO: for each Item, render if alive

    // character.render();
}

// ====================== COLLISION DETECTION ======================= //
function detectHit(obj1, obj2) {
    let hitTest = (
        obj1.y + obj1.height > obj2.y &&
        obj1.y < obj2.y + obj2.height &&
        obj1.x + obj1.width > obj2.x &&
        obj1.x < obj2.x + obj2.width
    );

    return hitTest;
}