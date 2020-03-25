
class Civilisation {
    constructor(name) {
        this.name = name;
        this.citiesList = [];
        this.roadsList = [];
        this.antsList = [];
        this.firstCityKey = null;
        this.lastCityKey = null;
        this.q0 = 0.8;
        this.rho0 = 0.85;
        this.bestPathLength = null;
        this.bestRoadsListKey = null;
        this.nbNestReached = 0; //juste pour savoir le nombre de fois qu'on est arrivé au noeud final 


        this.addCity = function(id, x, y){
            this.citiesList.push(new City(id, x, y));
        };

        this.addRoad = function(id, norme, firstCityKey, secondCityKey){
            return -1+this.roadsList.push(new Road(this, id, norme, firstCityKey, secondCityKey));
        };

        this.addAnt = function(){
            var alpha = -5+10*Math.random();
            var beta = -5+10*Math.random();
            var gama = -5+10*Math.random();
            this.antsList.push(new Ant(this, alpha, beta, gama));
        };

        this.initAnts = function(nbAnts){
            for(let i = 0; i<nbAnts; i++){
                this.addAnt();
            }
        };


        this.initPheromones = function(nbAnts){
            //console.log(this);
            //console.log("this.citiesList : "+this.citiesList);
            for(let i = 0; i<this.roadsList.length; i++){
                var firstCityKey = this.roadsList[i].firstCityKey;
                var secondCityKey = this.roadsList[i].secondCityKey;
                var firstListRoadsKeys = this.citiesList[firstCityKey].roadsKeysList;
                var secondListRoadsKeys = this.citiesList[secondCityKey].roadsKeysList;
                //console.log("firstCityKey : "+firstCityKey);
                //console.log("secondCityKey : "+secondCityKey);
                // console.log("firstListRoadsKeys : "+firstListRoadsKeys);
                // console.log("secondListRoadsKeys : "+secondListRoadsKeys);
                var bestRoadLength = this.roadsList[firstListRoadsKeys[0]]._length;

                for(let j = 1; j<firstListRoadsKeys.length; j++){
                    if(bestRoadLength>this.roadsList[firstListRoadsKeys[j]]._length)
                        bestRoadLength = this.roadsList[firstListRoadsKeys[j]]._length;
                }

                for(let j = 0; j<secondListRoadsKeys.length; j++){
                    //console.log("j : "+j);
                    //console.log("secondListRoadsKeys[j] : "+secondListRoadsKeys[j]);
                    if(bestRoadLength>this.roadsList[secondListRoadsKeys[j]]._length)
                        bestRoadLength = this.roadsList[secondListRoadsKeys[j]]._length;
                }

                this.roadsList[i].pheromoneQte = nbAnts/bestRoadLength;
                console.log("initPhero de la route "+i+" = "+this.roadsList[i].pheromoneQte);

            }
        };


        this.go = function () {
            for(let i = 0; i<this.antsList.length; i++){
                this.antsList[i].lastCityVisitedKey = this.firstCityKey;
                this.antsList[i].startSearch();
            }

        };

        this.takeOneStep = function () {
            for(let i = 0; i<this.antsList.length; i++){
                var success = this.antsList[i].moveForward();
                if(success == false) this.antsList.splice(i, 1);
            }
            //console.log('takeOneStep');

        };
        ///////////////////////////////////////////
        this.genetiqueSelection = function () {
        };


        this.updateBestPath = function (pathLength, roadsListKeys) {
            if(this.bestPathLength == null){
                this.bestPathLength = pathLength;
                this.bestRoadsListKey = roadsListKeys;
                console.log("first Best path found");
                this.highlightBestRoads();
            }
            else if(pathLength<this.bestPathLength){
                this.bestPathLength = pathLength;
                this.bestRoadsListKey = roadsListKeys;
                console.log("another best path found");
                this.highlightBestRoads();
            }
            this.nbNestReached++;
            //console.log(""+this.bestRoadsListKey);
            console.log("");
            console.log("");
            console.log("");

        };


        this.highlightBestRoads = function(){
            for(var i = 0; i<this.roadsList.length; i++){
                var currenRoadId = this.roadsList[i].id;
                $("#"+currenRoadId).css({"background-color": "rgb(245, 0, 0)", "height": "1px"});
            }

            for(var i = 0; i<this.bestRoadsListKey.length; i++){
                var currenRoadKey = this.bestRoadsListKey[i];
                var currenRoadId = this.roadsList[currenRoadKey].id;
                $("#"+currenRoadId).css({"background-color": "rgb(1, 5, 65)", "height": "3px"});
            }
        };

    }
}
