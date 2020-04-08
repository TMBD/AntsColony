
class Road {
    constructor(parentThis, id, _length, firstCityKey, secondCityKey) {
        this.parentThis = parentThis; //Ceci designe la civilisation dans laquelle appartient la route
        this.id = id; //l'identifiant de la route 
        this.pheromoneQte = null; //la quantité de phéromone de la route
        this._length = _length; //la longueure de la route
        this.firstCityKey = firstCityKey; //la premiere ville qui délimite la route
        this.secondCityKey = secondCityKey; //la deuxieme ville qui delimite la route
    }
}
