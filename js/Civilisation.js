
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
        this.nbBestRoadUpdeted = 0;
        this.runAlgoGene = false;
        this.nbIterForAlgoGene = null;
        this.bestAntKey = null;

        this.addCity = function(id, x, y){
            return -1+this.citiesList.push(new City(id, x, y));
        };

        this.addRoad = function(id, norme, firstCityKey, secondCityKey){
            return -1+this.roadsList.push(new Road(this, id, norme, firstCityKey, secondCityKey));
        };

        this.addAnt = function(){
            var alpha = -5+10*Math.random();
            var beta = -5+10*Math.random();
            var gama = -5+10*Math.random();
            var antKey = this.antsList.length;
            this.antsList.push(new Ant(this, alpha, beta, gama, antKey));
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
                //console.log("initPhero de la route "+i+" = "+this.roadsList[i].pheromoneQte);

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


        this.updateBestPath = function (pathLength, roadsListKeys, antKey) {
            if(this.bestPathLength == null){
                this.bestPathLength = pathLength;
                this.bestRoadsListKey = roadsListKeys;
                this.bestAntKey = antKey;
                //console.log("first Best path found");
                this.highlightBestRoads();
                this.nbBestRoadUpdeted++;
            }
            else if(pathLength<this.bestPathLength){
                this.bestPathLength = pathLength;
                this.bestRoadsListKey = roadsListKeys;
                this.bestAntKey = antKey;
                this.highlightBestRoads();
                this.nbBestRoadUpdeted++;
            }
            this.nbNestReached++;
            if(this.runAlgoGene && (this.nbNestReached%this.nbIterForAlgoGene == 0)){
                this.algoGene();
            }

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

        this.algoGene = function(){
            console.log("running Algo gene");
            var antNumberForAlgoGene = parseInt(0.25*this.antsList.length, 10);
            var antNumberToCrosswithBest = parseInt(0.25*antNumberForAlgoGene, 10);
            var antNumberToCrossWithFaster = parseInt(0.25*antNumberForAlgoGene, 10);
            var antNumberToMut = parseInt(0.50*antNumberForAlgoGene, 10);
            var fasterAntKey = this.getTheFasterAntKey();
            var iter = antNumberToCrosswithBest;
            for(var i = 0; i<iter; i++){
                if(i!=this.bestAntKey && i!=fasterAntKey){
                    this.antsList[i].alpha = (this.antsList[i].alpha+this.antsList[this.bestAntKey].alpha)/2;
                    this.antsList[i].beta = (this.antsList[i].beta+this.antsList[this.bestAntKey].beta)/2;
                    this.antsList[i].gama = (this.antsList[i].gama+this.antsList[this.bestAntKey].gama)/2;
                }
            }

            iter += antNumberToCrossWithFaster;
            for(i = antNumberToCrosswithBest; i<iter; i++){
                if(i!=this.bestAntKey && i!=fasterAntKey){
                    this.antsList[i].alpha = (this.antsList[i].alpha+this.antsList[fasterAntKey].alpha)/2;
                    this.antsList[i].beta = (this.antsList[i].beta+this.antsList[fasterAntKey].beta)/2;
                    this.antsList[i].gama = (this.antsList[i].gama+this.antsList[fasterAntKey].gama)/2;
                }
            }
            
            iter += antNumberToMut;
            for(i = antNumberToCrosswithBest+antNumberToCrossWithFaster; i<iter; i++){
                if(i!=this.bestAntKey && i!=fasterAntKey){
                    var alpha = -5+10*Math.random();
                    var beta = -5+10*Math.random();
                    var gama = -5+10*Math.random();

                    this.antsList[i].alpha = alpha;
                    this.antsList[i].beta = beta;
                    this.antsList[i].gama = gama;
                }
            }

        };

        this.getTheFasterAntKey = function(){
            var fasterAntKey = 0;
            for(var i = 1; i<this.antsList.length; i++){
                if(this.antsList[fasterAntKey].nbNestReached<this.antsList[i].nbNestReached){
                    fasterAntKey = i;
                }
            }
            return fasterAntKey;
        };

    }
}
