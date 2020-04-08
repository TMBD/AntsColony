
class City {
    constructor(id, x, y) {
        this.id = id; //L'identifiant de la ville 
        this.x = x; // la position x de la ville
        this.y = y; // la position y de la ville
        this.roadsKeysList = []; //la liste des routes qui permettent d'aboutir a cette ville
        this.addRoad = function(key){ //permet d'ajouter une ville dans la liste des villes ci-dessus
            this.roadsKeysList.push(key);
        };
        
    }
}
