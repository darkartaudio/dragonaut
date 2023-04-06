// GLOBAL DOM / VARIABLES
const game = document.querySelector('#game');
const story = document.querySelector('#story');
const choices = document.querySelector('#choices');
const setupForm = document.querySelector('#setup-form');

const ctx = game.getContext('2d');

let character;
let runGame;


// LEGEND
// G - green dragon, W - white dragon, R - red dragon, B - black dragon
// g - green book, w - white book, r - red book, b - black book
// C - character
// 0 - wall tile
// x - floor tile
let map = [
    //    0    1    2
    ['0', 'G', '0'], // 00
    ['x', 'x', 'x'], // 01
    ['x', 'g', 'x'], // 02
    ['x', 'x', 'x'], // 03
    ['0', 'W', '0'], // 04
    ['x', 'x', 'x'], // 05
    ['x', 'w', 'x'], // 06
    ['x', 'x', 'x'], // 07
    ['0', 'R', '0'], // 08
    ['x', 'x', 'x'], // 09
    ['x', 'r', 'x'], // 10
    ['x', 'x', 'x'], // 11
    ['0', 'B', '0'], // 12
    ['x', 'x', 'x'], // 13
    ['x', 'b', 'x'], // 14
    ['x', 'x', 'x'], // 15
    ['0', 'C', '0']  // 16
];

const wallTile = document.createElement('img');
wallTile.src = './img/stone-wall.png';

const floorTile = document.createElement('img');
floorTile.src = './img/stone-floor.png';


const tileImages = {
    '0': wallTile,
    'x': floorTile,
    // 'C': character.img
    // add more characters and corresponding images here
};

// EVENT LISTENERS
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let charName = setupForm.elements['character-name'].value;
    let charClass = setupForm.elements['character-class'].value;
    
    character = new Character(charName, charClass);
    
    // TODO: setup map, add items and enemies
    
    // runGame = setInterval(gameLoop, 60);
    runGame = gameLoop();
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
        this.height = 16;
        this.width = 16;
        this.x = 1 * 32;
        this.y = 16 * 32;
        this.imgURL = '';

        switch (charClass) {
            case 'warrior':
                this.imgURL = './img/warrior.png';
                break;
            case 'wizard':
                this.imgURL = "./img/wizard.png";
                break;
            case 'ranger':
                this.imgURL = "./img/ranger.png";
                break;
        }


        this.img = document.createElement('img');
        this.img.setAttribute('src', this.imgURL);

        this.render = function () {
            // console.log(this.img, this.x, this.y, this.width, this.height);
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
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

// ====================== KEYBOARD LOGIC ======================= //
function movementHandler(e) {
    // TODO: handle game boundaries
    switch (e.key) {
        case 'w':
        // case 'ArrowUp':
            character.y - 32 >= 0 ? (character.y -= 32) : null;
            break;
        
        case 's':
        // case 'ArrowDown':
            character.y + 32 <= game.height - character.height ? (character.y += 32) : null;
            break;

        case 'a':
        // case 'ArrowLeft':
            character.x - 32 >= 0 ? (character.x -= 32) : null;
            break;
        
        case 'd':
        // case 'ArrowRight':
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
    
    // TODO: draw map
    renderMap();
    
    // TODO: for each Dragon/Item, render if alive
    // TODO: for each Dragon/Item, check for collision
    
    character.render();
}

function renderMap() {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            // console.log(map[i][j]);
            // switch (map[i][j]) {
            //     case '0':
            //         ctx.drawImage(wallTile, j * 32, i * 32, 32, 32);
            //         break;
            // }
            const tileImage = tileImages[map[i][j]];
            if (tileImage) {
                ctx.drawImage(tileImage, j * 32, i * 32, 32, 32);
            }
        }
    }
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