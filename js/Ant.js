
class Ant {
    constructor(parentThis, alpha, beta, gama, antKey) {
        this.parentThis = parentThis; //Ceci designe la civilisation dans laquelle appartient la fourmi
        this.bringFood = false; //permet de savoir si la fourmie porte de la nourriture
        this.traveledRoadsKeys = []; //les cles de l'ensemble des routes traversées jusque là (pour le retour au nid) : pour l'aller j'ajoute la route a la fin de sa traversee
        this.currentRoadKey = null; //la cle de la route courante que la fourmi a emprunté
        this.restCurrentDistance = null; //la longueur restante de la route courante que la fourmie est entrain de traversée
        this.sumLengthCrossedRoad = 0; //somme des longueur des routes traversés jusque la (seulement pour le voyage courant)
        this.nbNestReached = 0; //le nombre de nid atteint
        this.alpha = alpha;
        this.beta = beta;
        this.gama = gama;
        this.lastCityVisitedKey = null; //la derniere ville visité par la fourmi
        this.AntKey = antKey //la position de la fourmi dans la liste des fourmie de la civilisation 


///////////////////////////////////////////////////////////////////////////////////

        //Permet aux fourmilles de se deplacer en avant d'un pas 
        this.moveForward = function () {
            var exitSuccess = true;
            if (this.restCurrentDistance>0) this.restCurrentDistance--; //S'il reste de la distance sur la route que la fourmi est entrain de parcourir alors on avance juste d'un pas 
            if(this.restCurrentDistance<=0){ //sinon c'est que la fourmi est arrivée au bout de la route est donc il faut qu'il choisisse une route à parcourir
                exitSuccess = this.chooseRoad();//On lui fait choisir une route 
                if(exitSuccess) this.moveForward();//Puis on lui fait avancé d'un seul pas sur la route qu'il a choisi
            }
            return exitSuccess;
        };


///////////////////////////////////////////////////////////////////////////////////

        //permet au fourmi de choisir une route lorsque la fourmi vient a bout du chemin courant
        this.chooseRoad = function () {
            var currentCityKey = this.getDestinationCityKey();
            var success = true;
            if(!this.bringFood){ //si on est a l'aller (i.e. la fourmi est entrain d'aller chercher la nourriture)
                this.traveledRoadsKeys.push(this.currentRoadKey); //!
                this.sumLengthCrossedRoad += this.parentThis.roadsList[this.currentRoadKey]._length;//!
                this.dropPheromone();//Si on est a l'allé on met à jour le pheromone de la route
                if(currentCityKey== parentThis.lastCityKey){ //si je suis a la derniere ville
                    this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length;
                    this.nbNestReached += 1;
                    this.parentThis.updateBestPath(this.sumLengthCrossedRoad, this.traveledRoadsKeys, this.AntKey); //! On cherche à savoir si le chemin que la fourmi à emprunté est le plus court chemin pour l'enregistré
                    this.bringFood = true; 
                    this.lastCityVisitedKey = currentCityKey;

                }else{ // si je suis juste sur une quelconque ville 
                    success = this.selectRoad(currentCityKey); //!  je sélectionne une route en me basant sur les phéromones 
                    if(success){
                        this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length; //!
                        this.lastCityVisitedKey = currentCityKey;
                    }
                }

            }else{ // au retour
                if(currentCityKey == this.parentThis.firstCityKey){ //si je suis a la premiere ville
                    this.lastCityVisitedKey = this.parentThis.firstCityKey;
                    this.startSearch();//On recommence la recherche
                }else{ // si je suis juste sur une quelconque ville 
                    this.traveledRoadsKeys.pop(); //!
                    this.lastCityVisitedKey = currentCityKey;
                    this.currentRoadKey = this.traveledRoadsKeys[this.traveledRoadsKeys.length-1];
                    this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length;
                }
            }
            return success;
            
        };

        
///////////////////////////////////////////////////////////////////////////////////
        //Permet de d'initialiser la recherche 
        this.startSearch = function () {
            this.traveledRoadsKeys = [];
            this.sumLengthCrossedRoad = 0;//!
            this.bringFood = false;
            this.selectRoad(this.parentThis.firstCityKey); //On pas besoin de la valeur de retour de selectRoad ici car cest sur qu'on trouvera une route non encore emprunté lors de la premiere recherche de route
            this.restCurrentDistance = this.parentThis.roadsList[this.currentRoadKey]._length; //!
        };


///////////////////////////////////////////////////////////////////////////////////
        //permet a la fourmi de sectionner une route en fonction de ses paramettre alpha beta et de la pheromone des routes possibles
        this.selectRoad = function(endCityKey) {
            var cityKey = endCityKey;
            var roadsKeysList = this.parentThis.citiesList[cityKey].roadsKeysList //On cherche les differentes routes qu'il est possible d'enprunter à partir de la ville courante
            roadsKeysList = this.removeTraveledRoads(roadsKeysList); //On supprime les routes déja parcourus pour éviter que la fourmi ne les empruntes
            if(roadsKeysList.length>0){ //S'il rest au moins une route parmi les routes qu'il est possible de prendre apres suppression des routes déja empruntés
                var bestRoadKey = roadsKeysList[0];
                
                //Ici on choisi au hasard la meilleur route à prendre mais en essayant de favoriser les routes qui ont le plus de phéromones en se basant sur les paramétres de la fourmies (alpha, beta)
                var randNumber = Math.random();
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
                return true;
            }else{//Certaines fourmies peuvent se perdre lors de la recherche 
                console.log("fourmie bloque dans une ville n'etant pas connecte a deux routes");
                return false;
            } 
               
        }


///////////////////////////////////////////////////////////////////////////////////
        //Cette fontion permet de mettre a jour la pheromone d'une route lors qu'une fourmi la choisi
        this.dropPheromone = function () {
            this.parentThis.roadsList[this.currentRoadKey].pheromoneQte += 1/this.sumLengthCrossedRoad;
            //console.log("pheromone de la route "+this.currentRoadKey+" = "+this.parentThis.roadsList[this.currentRoadKey].pheromoneQte);
            
        };


        //Pertmet de renvoyer la liste des routes possible qu'une fourmi peut empruntée. elle est utilisé lors de l'appel a fonction selectRoad
        this.getDestinationCityKey = function(){
            var firstCityKeyOfCurrentRoad = this.parentThis.roadsList[this.currentRoadKey].firstCityKey;
            var secondCityKeyOfCurrentRoad = this.parentThis.roadsList[this.currentRoadKey].secondCityKey;
            if(firstCityKeyOfCurrentRoad==this.lastCityVisitedKey) return secondCityKeyOfCurrentRoad;
            else if(secondCityKeyOfCurrentRoad==this.lastCityVisitedKey) return firstCityKeyOfCurrentRoad;
            else console.log("error in function getDestinationCityKey");
        };

        //Permet de supprimer la liste des chemins deja parcourus
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
