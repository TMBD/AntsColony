
class Ant {
    constructor(parentThis, alpha, beta, gama, antKey) {
        this.parentThis = parentThis;
        this.bringFood = false; //permet de savoir si la fourmie porte de la nourriture
        this.traveledRoadsKeys = []; //les cles de l'ensemble des routes traversées jusque là (pour le retour au nid) : pour l'aller j'ajoute la route a la fin de sa traversee
        this.currentRoadKey = null;
        this.restCurrentDistance = null; //la longueur restante de la route courante que la fourmie est entrain de traversée
        this.sumLengthCrossedRoad = 0; //somme des longueur des routes traversés jusque la (seulement pour le voyage courant)
        this.nbNestReached = 0; //le nombre de nid atteint
        this.alpha = alpha;
        this.beta = beta;
        this.gama = gama;
        this.lastCityVisitedKey = null;
        this.AntKey = antKey


///////////////////////////////////////////////////////////////////////////////////
        this.moveForward = function () {
            var exitSuccess = true;
            if (this.restCurrentDistance>0) this.restCurrentDistance--;
            if(this.restCurrentDistance<=0){
                exitSuccess = this.chooseRoad();
                if(exitSuccess) this.moveForward();
            }
            return exitSuccess;
        };


///////////////////////////////////////////////////////////////////////////////////
        this.takeFood = function () {
        };


///////////////////////////////////////////////////////////////////////////////////
        this.dropFood = function () {
        };


///////////////////////////////////////////////////////////////////////////////////
        this.chooseRoad = function () {
            var currentCityKey = this.getDestinationCityKey();
            var success = true;
            if(!this.bringFood){ //a l'aller
                this.traveledRoadsKeys.push(this.currentRoadKey); //!
                this.sumLengthCrossedRoad += this.parentThis.roadsList[this.currentRoadKey]._length;//!
                this.dropPheromone();
                if(currentCityKey== parentThis.lastCityKey){ //si je suis a la derniere ville
                    this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length;
                    this.nbNestReached += 1;
                    this.parentThis.updateBestPath(this.sumLengthCrossedRoad, this.traveledRoadsKeys, this.AntKey); //!
                    this.bringFood = true;
                    this.lastCityVisitedKey = currentCityKey;

                }else{ // si je suis juste sur une quelconque ville 
                    success = this.selectRoad(currentCityKey); //!
                    if(success){
                        this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length; //!
                        this.lastCityVisitedKey = currentCityKey;
                    }
                }

            }else{ // au retour
                if(currentCityKey == this.parentThis.firstCityKey){ //si je suis a la premiere ville
                    this.lastCityVisitedKey = this.parentThis.firstCityKey;
                    this.startSearch();
                }else{ // si je suis juste sur une quelconque ville 
                    this.traveledRoadsKeys.pop(); //!
                    this.lastCityVisitedKey = currentCityKey;
                    this.currentRoadKey = this.traveledRoadsKeys[this.traveledRoadsKeys.length-1];
                    this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length;
                    //this.dropPheromone(); pas besoin d'appeler dropPheromone au retour
                    

                }
            }
            //console.log("");
            return success;
            
        };

        
///////////////////////////////////////////////////////////////////////////////////
        this.startSearch = function () {
            this.traveledRoadsKeys = [];
            this.sumLengthCrossedRoad = 0;//!
            this.bringFood = false;
            this.selectRoad(this.parentThis.firstCityKey); //On pas besoin de la valeur de retour de selectRoad ici car cest sur qu'on trouvera une route non encore emprunté lors de la premiere recherche de route
            this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length; //!
        };


///////////////////////////////////////////////////////////////////////////////////
        this.selectRoad = function(endCityKey) {
            var cityKey = endCityKey;
            var roadsKeysList = this.parentThis.citiesList[cityKey].roadsKeysList
            roadsKeysList = this.removeTraveledRoads(roadsKeysList);
            if(roadsKeysList.length>0){
                var bestRoadKey = roadsKeysList[0];
                var randNumber = Math.random();
                //console.log(this.parentThis);
                if(randNumber<this.parentThis.q0) 
                    var bestRoadsQte = this.parentThis.roadsList[bestRoadKey].pheromoneQte*Math.pow(1/this.parentThis.roadsList[bestRoadKey]._length, this.beta);
                else
                    var bestRoadsQte = Math.pow(this.parentThis.roadsList[bestRoadKey].pheromoneQte, this.alpha)*Math.pow(1/this.parentThis.roadsList[bestRoadKey]._length, this.beta);

                for(var i = 1; i<roadsKeysList.length; i++){
                    var newRoadKey = roadsKeysList[i];
                    if(randNumber<this.parentThis.q0) 
                        var newRoadsQte = this.parentThis.roadsList[newRoadKey].pheromoneQte*Math.pow(1/this.parentThis.roadsList[newRoadKey]._length, this.beta);
                    else
                        var newRoadsQte = Math.pow(this.parentThis.roadsList[newRoadKey].pheromoneQte, this.alpha)*Math.pow(1/this.parentThis.roadsList[newRoadKey]._length, this.beta);
                    
                    if(bestRoadsQte<newRoadsQte) {
                        bestRoadKey = newRoadKey;
                        newRoadsQte = newRoadsQte;
                    }
                }

                this.currentRoadKey = bestRoadKey; 
                //this.sumLengthCrossedRoad += this.parentThis.roadsList[bestRoadKey]._length;
                //console.log("route emprunte : "+bestRoadKey);
                //this.dropPheromone(); //!
                return true;
            }else{
                console.log("fourmie bloque dans une ville n'etant pas connecte a deux routes");
                return false;
            } 
               
        }


///////////////////////////////////////////////////////////////////////////////////
        this.dropPheromone = function () {
            //console.log("this.sumLengthCrossedRoad = "+ this.sumLengthCrossedRoad);
            this.parentThis.roadsList[this.currentRoadKey].pheromoneQte += 1/this.sumLengthCrossedRoad;
            //console.log("pheromone de la route "+this.currentRoadKey+" = "+this.parentThis.roadsList[this.currentRoadKey].pheromoneQte);
            
        };

///////////////////////////////////////////////////////////////////////////////////
        this.getRoadId = function(parent, key) {
            //console.log(parent.roadsList);
            //console.log(key);
            return parent.roadsList[key].id;
            
        };

        this.getDestinationCityKey = function(){
            var firstCityKeyOfCurrentRoad = this.parentThis.roadsList[this.currentRoadKey].firstCityKey;
            var secondCityKeyOfCurrentRoad = this.parentThis.roadsList[this.currentRoadKey].secondCityKey;
            if(firstCityKeyOfCurrentRoad==this.lastCityVisitedKey) return secondCityKeyOfCurrentRoad;
            else if(secondCityKeyOfCurrentRoad==this.lastCityVisitedKey) return firstCityKeyOfCurrentRoad;
            else alert.log("error in function getCurrentCity");
        };

        this.removeTraveledRoads = function(roadsKeysList){
            var goodRoadsKeysList = [];
            var indexOfCurrentRoadKey = roadsKeysList.indexOf(this.currentRoadKey);
            if(indexOfCurrentRoadKey>-1) roadsKeysList.splice(indexOfCurrentRoadKey, 1);
            for(var i = 0; i<roadsKeysList.length; i++){
                if(!this.traveledRoadsKeys.includes(roadsKeysList[i])) goodRoadsKeysList.push(roadsKeysList[i]);
            }
            return goodRoadsKeysList;
        };

    }



}

//! = la position l'instruction est importante
