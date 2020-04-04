
class Civilisation {
    constructor(name) {
        this.name = name; //le nom de la civilisation
        this.citiesList = [];//la liste des villes de la civilisation
        this.roadsList = []; //la liste des routes de la civilisation
        this.antsList = []; //la liste des fourmis de la civilisation
        this.firstCityKey = null; //la ville de départe de des fourmies
        this.lastCityKey = null;//la ville de destination des fourmis(la ou se trouve la )
        this.q0 = 0.8; 
        this.rho0 = 0.85;
        this.bestPathLength = null; //La longueure du meilleure chemin trouvé jusque la 
        this.bestRoadsListKey = null; //la liste des routes qui fond partie du meilleurs chemin
        this.nbNestReached = 0; //juste pour savoir le nombre de fois qu'on est arrivé au noeud final
        this.nbBestRoadUpdeted = 0; //le nombre de fois qu'un plus cours chemin est trouvé
        /////////////// attributs pour l'algo génétique
        this.runAlgoGene = false; //permet de savoir si l'utilisateur a choisi de faire tourner l'algo génétique ou pas 
        this.nbIterForAlgoGene = null; //permet de savoir au bout de combien d'itération on doit lancer l'algo génétique
        this.bestAntKey = null; //la fourmi qui a trouvé le meilleur chemin actuel pour la crossOver

        //permet d'ajouter une ville dans la liste des villes
        this.addCity = function(id, x, y){ 
            return -1+this.citiesList.push(new City(id, x, y));
        };

        //permet d'ajouter une route
        this.addRoad = function(id, norme, firstCityKey, secondCityKey){
            return -1+this.roadsList.push(new Road(this, id, norme, firstCityKey, secondCityKey));
        };

        //permet d'ajouter une fourmi
        this.addAnt = function(){
            var alpha = -5+10*Math.random();
            var beta = -5+10*Math.random();
            var gama = -5+10*Math.random();
            var antKey = this.antsList.length;
            this.antsList.push(new Ant(this, alpha, beta, gama, antKey));
        };

        //permet de creer la liste des fourmis
        this.initAnts = function(nbAnts){
            for(let i = 0; i<nbAnts; i++){
                this.addAnt();
            }
        };


        //permet d'initialiser la valeur des pheromones des routes
        this.initPheromones = function(nbAnts){
            for(let i = 0; i<this.roadsList.length; i++){//On boucle sur toutes les routes
                var firstCityKey = this.roadsList[i].firstCityKey;//Pour chaque route on cherche la 1e ville à la quelle elle est connecté
                var secondCityKey = this.roadsList[i].secondCityKey;//on cherche la 2e ville à la quelle elle est connecté
                var firstListRoadsKeys = this.citiesList[firstCityKey].roadsKeysList; //liste des routes avec lesquelles elle est connecté pas via la 1e route
                var secondListRoadsKeys = this.citiesList[secondCityKey].roadsKeysList;//liste des routes avec lesquelles elle est connecté pas via la 1e route

                var bestRoadLength = this.roadsList[firstListRoadsKeys[0]]._length;

                for(let j = 1; j<firstListRoadsKeys.length; j++){
                    if(bestRoadLength>this.roadsList[firstListRoadsKeys[j]]._length)
                        bestRoadLength = this.roadsList[firstListRoadsKeys[j]]._length;
                }

                for(let j = 0; j<secondListRoadsKeys.length; j++){
                    if(bestRoadLength>this.roadsList[secondListRoadsKeys[j]]._length)
                        bestRoadLength = this.roadsList[secondListRoadsKeys[j]]._length;
                }

                this.roadsList[i].pheromoneQte = nbAnts/bestRoadLength;
            }
        };


        //permet de de donner le coup d'envoi
        this.go = function () {
            for(let i = 0; i<this.antsList.length; i++){
                this.antsList[i].lastCityVisitedKey = this.firstCityKey;
                this.antsList[i].startSearch();
            }

        };

        //permet de faire un pas pour toutes les fourmis
        this.takeOneStep = function () {
            for(let i = 0; i<this.antsList.length; i++){
                var success = this.antsList[i].moveForward();
                if(success == false) this.antsList.splice(i, 1);
            }
            //console.log('takeOneStep');

        };

        ///////////////////////////////////////////

        //permet de mettre a jour le meilleur chemin a chaque fois qu'un fourmi arrive a la ville de destination
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


        //permet de mettre en surbrillance le meilleur chemin trouvé a l'instant t
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

        //permet d'effectuer la selection génétique
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

        //permet de chercher la fourmi la plus rapide pour le crossOver
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
