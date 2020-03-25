
class Road {
    constructor(parentThis, id, _length, firstCityKey, secondCityKey) {
        this.parentThis = parentThis;
        this.id = id;
        this.pheromoneQte = null;
        this._length = _length;
        this.firstCityKey = firstCityKey;
        this.secondCityKey = secondCityKey;
        this.evaporatePheromone = function () {
        };
    }
}
