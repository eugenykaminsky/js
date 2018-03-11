'use strict';

class Vector {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }
  
  plus(vector) {
    if (!(vector instanceof Vector)) {
		throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
	}
    return new Vector(vector.x + this.x, vector.y + this.y);
  }
  
  times(coefficient) {
    return new Vector(this.x * coefficient, this.y * coefficient);
  }
}

class Actor{
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
  
  get type() {
    return `actor`;
  }
  
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
	
	isIntersect(actor){
		if(!(actor instanceof Actor)){
			throw new Error(`Переменная actor должна быть типа Actor: ${actor}`);
		}
		
		if(this === actor){
			return false;
		}
		
		if(actor.size.x < 0 || actor.size.y < 0){
			return false;
		}
		
		if((this.pos.x === actor.pos.x + actor.size.x)||(actor.pos.x === this.pos.x + actor.size.x)||
		(this.pos.y === actor.pos.y + actor.size.y)||(actor.pos.y === this.pos.y + actor.size.y)){
			return false;
		}
		 
	}
}


class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.height = grid.length;
    this.status = null;
    this.finishDelay = 1;
    this.player = this.actors.find(function(actor) {
      return actor.type === 'player';
    });
  }

  get width() {
    return this.grid.reduce(function(memo, string) {
      if (string.length > memo) {
        return string.length;
      } else return memo;
    }, 0);
  }

  isFinished() {
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    } else return false;
  }

  actorAt(object) {
    if (!(object instanceof Actor) || object === undefined) {
      throw new Error(``);
    }

    return this.actors.find(function(actor) {
      if (actor.isIntersect(object)) return actor;
    });
  }

  obstacleAt(pos, size) {
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

  removeActor(actor) {
    this.actors.splice(this.actors.findIndex(function(element) {
      if (element === actor) return element;
    }), 1);
  }

  noMoreActors(type) {
    let noMoreActors = true;

    if (this.actors.find(function(actor) {
      if (actor.type === type) return actor;
    })) noMoreActors = false;

    return noMoreActors;
  }

  playerTouched(obstacleType, actor) {
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

