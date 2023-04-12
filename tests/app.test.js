describe('class Character(charName, charClass)', () => {
    const testChar = new Character('Steve', 'wizard');

    it('name should be a string', () => {
        expect(typeof(testChar.name)).toBe('string');
    });

    it('class should be a string', () => {
        expect(typeof(testChar.class)).toBe('string');
    });

    it('health should be a number between 50 and 60', () => {
        expect(
            testChar.health >= 50 && 
            testChar.health <= 60
        ).toBe(true);
    });

    it('attackTypes should be an object', () => {
        expect(typeof(testChar.attackTypes)).toBe('object');
    });

    it('img should be the warrior, wizard, or ranger image', () => {
        expect(
            testChar.img.src.includes('/img/warrior.png') ||
            testChar.img.src.includes('/img/wizard.png') ||
            testChar.img.src.includes('/img/ranger.png')
        ).toBe(true);
    });
});

describe('class Dragon(dragonName, dragonImg, dragonHealth, dragonX, dragonY, effective, resist)', () => {
    const testDragon = new Dragon('yellow dragon', yellowDragon, 20, 1, 9, 'acid', 'shock')

    it('name should be a string', () => {
        expect(typeof(testDragon.name)).toBe('string');
    });

    it('effective should be a string', () => {
        expect(typeof(testDragon.effective)).toBe('string');
    });

    it('resist should be a string', () => {
        expect(typeof(testDragon.resist)).toBe('string');
    });

    it('alive should be a boolean', () => {
        expect(typeof(testDragon.alive)).toBe('boolean');
    });

    it('health should be a number', () => {
        expect(typeof(testDragon.health)).toBe('number');
    });
});

describe('class Hydra extends Dragon', () => {
    const testHydra = new Hydra('yellow dragon', hydraFive, 20, 1, 9, 'acid', 'shock');

    it('name should be a string', () => {
        expect(typeof(testHydra.name)).toBe('string');
    });

    it('effective should be a string', () => {
        expect(typeof(testHydra.effective)).toBe('string');
    });

    it('resist should be a string', () => {
        expect(typeof(testHydra.resist)).toBe('string');
    });

    it('alive should be a boolean', () => {
        expect(typeof(testHydra.alive)).toBe('boolean');
    });

    it('health should be a number', () => {
        expect(typeof(testHydra.health)).toBe('number');
    });

    it('phase should be a number', () => {
        expect(typeof(testHydra.phase)).toBe('number');
    });
});

describe('class Poof', () => {
    const testPoof = new Poof(1, 1);

    it('img should be an html img element with src containing "poof"', () => {
        expect(
            testPoof.img.src.includes('/img/poof')).toBe(true);
    });

    it('incrementer should be a number', () => {
        expect(typeof(testPoof.incrementer)).toBe('number');
    });
});

describe('class Item(itemName, itemImg, itemX, itemY', () => {
    const testItem = new Item('yellow book', yellowBook, 7, 10);

    it('name should be a string', () => {
        expect(typeof(testItem.name)).toBe('string');
    });

    it('img should be an html img element with src containing "book"', () => {
        expect(
            testItem.img.src.includes('book')).toBe(true);
    });

    it('alive should be a boolean', () => {
        expect(typeof(testItem.alive)).toBe('boolean');
    });
});

describe('function isVisible(obj)', () => {
    character = new Character('Steve', 'wizard');
    const testHydra = new Hydra('five-headed hydra', hydraFive, 20, 1, 9, '', '');
    const testHydraB = new Hydra('five-headed hydra', hydraFive, 20, 1, 1, '', '');

    it('should return true for testHydra', () => {
        expect(isVisible(testHydra)).toBe(true);
    });

    it('should return false for testHydraB', () => {
        expect(isVisible(testHydraB)).toBe(false);
    });
});

describe('function initStory()', () => {
    it('gameEvents.length should be 5', () => {
        initStory();
        expect(gameEvents.length).toBe(5);
    });
});

describe('function addDragons()', () => {
    it('dragons.length should be 4', () => {
        addDragons();
        expect(dragons.length).toBe(4);
    });
});

describe('function addItems()', () => {
    it('items.length should be 4', () => {
        addItems();
        expect(items.length).toBe(4);
    });
});