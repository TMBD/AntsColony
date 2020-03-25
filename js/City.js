
class City {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.roadsKeysList = [];
        //this.backwardRoadsKeysList = [];
        this.getMyForwardsRoads = function () {
        };
        this.getMybackwardsRoads = function () {
        };
        this.addRoad = function(key){
            this.roadsKeysList.push(key);
        };
        
    }
}
