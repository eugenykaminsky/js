'use strict';

/*
Класс Vector позволяет контролировать расположение объектов в двумерном пространстве и управлять их размером и перемещением.
*/
class Vector {
    /*
    Конструктор принимает два аргумента — координаты по оси X и по оси Y, числа, по умолчанию 0.
    Создает объект со свойствами x и y, равными переданным в конструктор координатам.
    */
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }
  /*
  Метод plus создает и возвращает новый объект типа Vector,
  координаты которого будут суммой соответствующих координат суммируемых векторов.
   */
  plus(vector) {
    if (!(vector instanceof Vector)) {
		throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
	}
    return new Vector(vector.x + this.x, vector.y + this.y);
  }
  /*
  Создает и возвращает новый объект типа Vector, координаты которого будут равны
  соответствующим координатам исходного вектора, умноженным на множитель.
   */
  times(coefficient) {
    return new Vector(this.x * coefficient, this.y * coefficient);
  }
}

/*
Класс Actor позволяет контролировать все движущиеся объекты на игровом поле и контролировать их пересечение.
*/
class Actor{
    /*
    Конструктор принимает три аргумента: расположение, объект типа Vector,
    размер, тоже объект типа Vector и скорость, тоже объект типа Vector.
    По умолчанию создается объект с координатами 0:0, размером 1x1 и скоростью 0:0.
    Если в качестве первого, второго или третьего аргумента передать не объект типа Vector,
    то конструктор должен бросить исключение.*

     */
	constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)){
		if (!(pos instanceof Vector)){
			throw new Error('Должно быть определено свойство pos, в котором размещен Vector');
		}
		
		if (!(size instanceof Vector)){
			throw new Error('Должно быть определено свойство size, в котором размещен Vector');
		}
		
		if (!(speed instanceof Vector)){
			throw new Error('Должно быть определено свойство speed, в котором размещен Vector');
		}
		
		this.pos = pos;
		this.size = size;
		this.speed = speed;	
	}
	
 act() {}
  
  get left() {
    return this.pos.x;
  }
  
  get top() {
    return this.pos.y;
  }
  
  get right() {
    return this.pos.x + this.size.x;
  }
  
  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
	    return `actor`;
	}

	 /*
        Метод isIntersect проверяет, пересекается ли текущий объект с переданным объектом, и если да, возвращает true, иначе – false
     */
    isIntersect(item) {
        if (!(item instanceof Actor) || item === undefined) {
            throw new Error(`Переменная item должна быть типа Actor: ${item}`);
        }
        if (item === this) {
            return false;
        }

        if ((this.right > item.left && this.left < item.right) &&
            (this.bottom > item.top && this.top < item.bottom)) {
            return true;
        } else {
            return false;
        }
    }
}

/*
  Объекты класса Level реализуют схему игрового поля конкретного уровня,
  контролируют все движущиеся объекты на нём и реализуют логику игры.
 */

class Level {
    /*
    Принимает два аргумента: сетку игрового поля с препятствиями,
    массив массивов строк, и список движущихся объектов, массив объектов Actor
    */
    constructor(grid = [], actors = []) {
        this.grid = grid;             // сетка игрового поля
        this.actors = actors;         // список движущихся объектов игрового поля
        this.height = grid.length;    // высота игрового поля
        this.status = null;           // состояние прохождения уровня
        this.finishDelay = 1;         // таймаут после окончания игры
        this.player = this.actors.find(function(actor) {  // движущийся объект
            return actor.type === 'player';
        });
    }

    get width() {                      // ширина игрового поля
        return this.grid.reduce(function(memo, string) {
            if (string.length > memo) {
                return string.length;
            } else return memo;
        }, 0);
    }

    isFinished() {                      // определяет, завершен ли уровень
        if (this.status !== null && this.finishDelay < 0) {
            return true;
        } else return false;
    }

    actorAt(object) {                // определяет, расположен ли какой-то другой движущийся объект в переданной позиции
        if (!(object instanceof Actor) || object === undefined) {
            throw new Error(``);
        }

        return this.actors.find(function(actor) {
            if (actor.isIntersect(object)) return actor;
        });
    }

    obstacleAt(pos, size) {              // определяет, нет ли препятствия в указанном месте
        const intersectingObject = new Actor(pos, size);

        if (intersectingObject.left < 0 ||
            intersectingObject.right > this.width ||
            intersectingObject.top < 0) return 'wall';

        if (intersectingObject.bottom > this.height) return 'lava';

        const bottom = Math.ceil(intersectingObject.bottom);
        const top = Math.floor(bottom - intersectingObject.size.y);
        const left = Math.round(intersectingObject.left);
        const right = Math.round(left + intersectingObject.size.x);

        let obstacle;

        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                if (this.grid[y][x] && !obstacle) {
                    obstacle = this.grid[y][x];
                }
            }
        }

        return obstacle;
    }

    removeActor(actor) {                 // удаляет переданный объект с игрового поля
        this.actors.splice(this.actors.findIndex(function(element) {
            if (element === actor) return element;
        }), 1);
    }

    noMoreActors(type) {                 // определяет, остались ли еще объекты переданного типа на игровом поле
        let noMoreActors = true;

        if (this.actors.find(function(actor) {
                if (actor.type === type) return actor;
            })) noMoreActors = false;

        return noMoreActors;
    }

    playerTouched(obstacleType, actor) { // меняет состояние игрового поля при касании игроком каких-либо объектов или препятствий
        if (this.status !== null) return;

        if (obstacleType === 'lava' || obstacleType === 'fireball') {
            this.status = 'lost';
            return;
        }

        if (obstacleType === 'coin' && actor instanceof Actor) this.removeActor(actor);

        if (!this.actors.find(function(actor) {
                if (actor.type === 'coin') return actor;
            })) {
            this.status = 'won';
            return;
        }
    }
}

class LevelParser {
    constructor(dictionary) {
        this.dictionary = dictionary;
    }

    actorFromSymbol(symbol) {
        if (!symbol) {
            return undefined;
        }

        return this.dictionary[symbol];
    }

    obstacleFromSymbol(symbol) {
        if (symbol === 'x') return 'wall';
        if (symbol === '!') return 'lava';
        return undefined;
    }

    createGrid(gridSource) {
        if (gridSource.length === 0) return [];

        const thisParser = this;

        function getGrid(row) {
            return row.split('').map(thisParser.obstacleFromSymbol);
        }

        return gridSource.map(getGrid);
    }

    createActors(plan) {
        if (!this.dictionary) return [];
        if (plan.length === 0) return [];

        let actors = [];

        let x = 0;
        let y = 0;

        const thisParser = this;

        function getActors(row) {
            const rowLength = row.length;

            for (let symbol of row) {
                const constr = thisParser.actorFromSymbol(symbol);

                if (constr && (constr === Actor || constr.prototype instanceof Actor)) {
                    actors.push(new constr(new Vector(x, y)));
                }

                x++;
                if (x >= rowLength) x = 0;
            }
            y++;
        }

        plan.forEach(getActors);

        return actors;
    }

    parse(levelPlan) {
        return new Level(this.createGrid(levelPlan), this.createActors(levelPlan));
    }
}

     /*
        Класс Fireball станет прототипом для движущихся опасностей на игровом поле.
        Он должен наследовать весь функционал движущегося объекта Actor.
     */

class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
        super(pos, undefined, speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        if (!time) return this.pos;
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed = this.speed.times(-1);
    }

    act(time, level) {
        const nextPos = this.getNextPosition(time);

        if (!level.obstacleAt(nextPos, this.size)) this.pos = nextPos;
        else this.handleObstacle();
    }
}
    /*
        Класс HorizontalFireball представляет собой объект,
        который движется по горизонтали со скоростью 2 и при столкновении
        с препятствием движется в обратную сторону.
    */
class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(2, 0));
    }
}

    /*
        Класс VerticalFireball представляет собой объект,
        который движется по вертикали со скоростью 2 и при
        столкновении с препятствием движется в обратную сторону.
    */

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
    }
}

    /*
        Класс FireRain представлет собой объект,
        который движется по вертикали со скоростью 3
        и при столкновении с препятствием начинает движение
        в том же направлении из исходного положения, которое задано при создании.
    */

class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.initPos = pos;
    }

    handleObstacle() {
        this.speed = this.speed;
        this.pos = this.initPos;
    }
}

class Coin extends Actor {               // Класс Coin реализует поведение монетки на игровом поле
    constructor(pos = new Vector(0, 0)) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));

        this.initPos = new Vector(this.pos.x, this.pos.y);
        this.springSpeed = 8;
        this.springDist = 0.07;

        function getRandom(min, max) {
            return Math.random() * (max - min) + min;
        }

        this.spring = getRandom(0, 2 * Math.PI);
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);

        return this.initPos.plus(this.getSpringVector());
    }

    act(time = 1) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(pos = new Vector(0, 0)) {
        pos.y += -0.5;
        super(pos, new Vector(0.8, 1.5), new Vector(0, 0));
    }

    get type() {
        return 'player';
    }
}



const schemas = [
    [
        '         ',
        '         ',
        '    =    ',
        '       o ',
        '@     xx ',
        '        o',
        'xxx    xxx',
        '         '
    ],
    [
        '   |     ',
        '      v  ',
        '  =      ',
        '@       o',
        '        x',
        '    x    ',
        'x        ',
        '         '
    ]
];

const actorDict = {
    '@': Player,
    '|': VerticalFireball,
    'o': Coin,
    '=': HorizontalFireball,
    'v': FireRain
}

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));