
$(document).ready(function (e) {
    var counter = 0; //permet de compter le nombre de villes cree
    var firstClickedCityId = null; //permet de savoir la premiere ville choisi lors de la creation d'une route entre deux villes
    var civilisation = new Civilisation("Une civilisation"); //On cree une nouvelle civilisation
    var nbAnts = 0; //le nombre de fourmi a creer pour la civilisation
    var nbIter = 0; //le nombre d'iteration a faire avant de finir la recherche
    var radioActionValue = "creatGraph"; //permet de savoirl l'action que l'utilisateur a choisi (creation d'un graphe ou choix de la premier ville ou choix de la ville de ville de destination )
    var lastNbBestRoadUpdeted = 0; //permet de savoir si on trouvé un nouvau chemin plus court ou pas en la comparant avec civilisation.nbBestRoadUpdeted)
    var createCivilisationClicked = false; //savoir si l'utilisateur a deja creer la civilisation ou pas
    var iterGeneChecked = false; //permet de savoir si l'utilisateur a choisi de faire tourner l'algo gnenetique ou pas
    var nbIterBeforeGene = null; //le nombre d'iteration avant de lancer l'algo genetique
    $('#iterGeneNumberDiv').hide(); //Par defaut on cache l'input lié a l'interval d'iteration de l'algo genetique car celle-ci est desactivé par defaut
    $('#infos').hide(); //On cache aussi la div ou on affiche le resumé du resultat

    //Quand l'utilisateur cliquee sur le bouton de selection activeGeneAlgoCheckbox pour activer l'algo genetique
    $("#activeGeneAlgoCheckbox").change(function(){
        if ($('#activeGeneAlgoCheckbox').is(":checked")){
            $('#iterGeneNumberDiv').show(); //si apres l'algo genetique est active alors on montre l'input pour la saisi de l'interval d'iteration
            iterGeneChecked = true; //et on modifie la variable qui permet de savoir si l'algo génétique est active
        } else {
            $('#iterGeneNumberDiv').hide(); //sinon on cache l'input 
            iterGeneChecked = false; //et on dit que l'algo genetique est desactive
        }
    });


    //qunand l'utilisateur clique sur le champs ou on afficher le graph : ce block permet de construire le graphe dans sont integralité (villes, routes...)
    $('#field').click(function (e) { 
        if(createCivilisationClicked == false){ //si l'utilisateur n'a pas encore creer la civilisation alors on peut modifier le graph
            if(radioActionValue == "creatGraph"){//l'utilisateur a choisi le bouton d'option construire le graph
                //On get les coordonnées ou l'utilisateur a clique par rappor au champs de graph
            var posX = $(this).position().left,
                posY = $(this).position().top;

                //On calcule les vrais coordonnées (le -10 viens du fait que les villes on un diametre de 20px et ceci permet donc de centrer le ville)
                x = (e.pageX - posX-10); 
                y = (e.pageY - posY-10);
                $('#field').append( "<div class='city' id = '"+counter+"'>"+counter+"</div>" ); //On cree graphiquement la ville et on l'ajout au graph     
                $("#"+counter).css({"top": y+"px", "left": x+"px"}); //On position la ville sur les coordonnées appropriées

                //Ici on crée la ville pour l'ajouter dans la civilisation car tout a l'heure elle n'etait crée que graphiquement
                civilisation.addCity(counter, x, y);

                //On creer un evenement associé a la ville graphique crée : cela nous permet de creer les routes
                $('#'+counter).click(function (e) {
                    e.stopPropagation();//permet de ne pas propages l'effet sur le noeud html parent de la ville donc la zone de graph
                    if(createCivilisationClicked){ //Pour chaque ville crée on fait en sorte qu'on ne puisse rien faire avec si la civilisation est deja créee
                        alert("Vous avez déjà créé la civilisation, vous ne pouvez plus la modifier !");
                        return;
                    }

                    //Si on clique sur cette ville et qu'il savere que l'option choisi est la construction de graph 
                    //alors cela veux dire qu'on veut lier cette ville a une autre ville pour creer une route
                    if(radioActionValue == "creatGraph"){
                        if(firstClickedCityId == null){//si c'est la premiere ville qu'on a cliquer
                            firstClickedCityId = $(this).attr('id'); //alors on se contente juste d'enregistrer sont id et attendre qu'une deuxieme ville soit cliqué pour contruire la route
                            $("#"+firstClickedCityId).css({"background":" rgba(175, 175, 175)"}); //on change la couleur de la ville pour dire qu'elle a ete choisi pour etre associé a une autre ville pour construire une route
                        } 
                        else if($(this).attr('id') == firstClickedCityId){//Par contre si la ville cliquée est celle qui a ete deja clique avant (ça veut dire qu'on annule sa sélection)          
                            if(firstClickedCityId == civilisation.firstCityKey) $("#"+firstClickedCityId).css({"background":" rgb(0, 134, 18)"}); //S'il s'agissait de la ville de départ alors on lui remet la couleur de la ville de départ
                            else if(firstClickedCityId == civilisation.lastCityKey) $("#"+firstClickedCityId).css({"background":" rgb(255, 0, 0)"});//S'il s'agissait de la ville de d'arrivee alors on lui remet la couleur de la ville de d'arrivé
                            else $("#"+firstClickedCityId).css({"background":" rgb(0, 0, 0)"});//sinon on la redonne sa couleur d'origine        
                            firstClickedCityId = null;//on dit qu'aucune ville n'a ete precedement selectionnée
                        } 
                        else{
                            newClickedCityId = $(this).attr('id');
                            if(checkIfRoadExist(firstClickedCityId, newClickedCityId) == true){//On verifie s'il n'y a pas une route qui connecte déja ces deux villes
                                alert("Ces deux villes sont déja connectées !");
                                return;
                            }
                            //On get les coordonnées des deux villes sélectionnées pour la creation de la route
                            x1 = civilisation.citiesList[firstClickedCityId].x;
                            y1 = civilisation.citiesList[firstClickedCityId].y;
                            x2 = civilisation.citiesList[newClickedCityId].x;
                            y2 = civilisation.citiesList[newClickedCityId].y;

                            lineId = firstClickedCityId+'_'+newClickedCityId;//On cree l'identifiant de la route a partir de l'identifiant des deux villes

                            line(x1, y1, x2, y2, 'field', lineId);//On cree graphiquement la route 
                            roadlength = Math.ceil(normeVect(x1-x2, y1-y2));//on calcule la longueur de la route
                            
                            roadKey = civilisation.addRoad(lineId, roadlength, firstClickedCityId, newClickedCityId);//On ajoute la route crée dans la liste des routes de la civilisation
                            civilisation.citiesList[firstClickedCityId].addRoad(roadKey);//On ajoute l'indice de la route dans la liste des routes de la ville de départ(permet d'avoir toutes les routes liees a la ville)
                            civilisation.citiesList[newClickedCityId].addRoad(roadKey);//On ajoute l'indice de la route dans la liste des routes de la ville de d'arrivée(permet d'avoir toutes les routes liees a la ville)

                            if(firstClickedCityId == civilisation.firstCityKey) $("#"+firstClickedCityId).css({"background":" rgb(0, 134, 18)"});//S'il s'agissait de la ville de départ alors on lui remet la couleur de la ville de départ
                            else if(firstClickedCityId == civilisation.lastCityKey) $("#"+firstClickedCityId).css({"background":" rgb(255, 0, 0)"});//S'il s'agissait de la ville de d'arrivee alors on lui remet la couleur de la ville de d'arrivé
                            else $("#"+firstClickedCityId).css({"background":" rgb(0, 0, 0)"});//sinon on la redonne sa couleur d'origine
                            
                            firstClickedCityId = null;//on dit qu'aucune ville n'a ete precedement selectionnée
                        }
                    }
                    else if(radioActionValue == "chooseStartCity"){//Si on a choisi l'option choisir le point de depart(l'alternatiif de l'option construre le graphe)
                        if($(this).attr('id') == civilisation.lastCityKey){ //On interdit le fait que la ville de départ coincide avec la ville d'arrivee
                            alert("la ville de départ doit etre differente de la ville d'arrivée !");
                            return;
                        }

                        if(civilisation.firstCityKey == null){//Si il savere qu'on avait pas deja choisi la ville de depart
                            civilisation.firstCityKey = $(this).attr('id'); //alors on dit que la ville selectionnée est la ville de départ
                            $("#"+civilisation.firstCityKey).css({"background":" rgb(0, 134, 18)"});//Puis on change sa couleur en vert
                        }else{//Par contre si on avait deja choisi la ville de depart (dans ce cas on a choisi de la changer)
                            $("#"+civilisation.firstCityKey).css({"background":" rgb(0, 0, 0)"});//On s'assure de remettre la couleur noir sur l'ancienne ville de depart pour dire qu'elle ne l'est  plus
                            civilisation.firstCityKey = $(this).attr('id');//alors on dit que la ville selectionnée est la ville de départ maintenent
                            $("#"+civilisation.firstCityKey).css({"background":" rgb(0, 134, 18)"});//Puis on change sa couleur en vert
                        }
                    }
                    else if(radioActionValue == "chooseLastCity"){//Si on a choisi l'option choisir le point de d'arrivé(l'alternatiif de l'option construre le graphe, et choisir le point de départ)
                        if($(this).attr('id') == civilisation.firstCityKey){//On interdit le fait que la ville d'arrivee coincide avec la ville de départ
                            alert("la ville d'arrivée doit etre differente de la ville de départ !");
                            return;
                        }

                        if(civilisation.lastCityKey == null){//Si il savere qu'on avait pas deja choisi la ville de d'arrivee
                            civilisation.lastCityKey = $(this).attr('id');//alors on dit que la ville selectionnée est la ville de d'arrivée
                            $("#"+civilisation.lastCityKey).css({"background":" rgb(255, 0, 0)"});//Puis on change sa couleur en rouge
                        }else{//Par contre si on avait deja choisi la ville de d'arrivée (dans ce cas on a choisi de la changer)
                            $("#"+civilisation.lastCityKey).css({"background":" rgb(0, 0, 0)"});//On s'assure de remettre la couleur noir sur l'ancienne ville de d'arrive pour dire qu'elle ne l'est  plus
                            civilisation.lastCityKey = $(this).attr('id');//alors on dit que la ville selectionnée est la ville de d'arrivée maintenent
                            $("#"+civilisation.lastCityKey).css({"background":" rgb(255, 0, 0)"});//Puis on change sa couleur en rouge
                        }
                    }
                });

                counter++;
            }else{//Si l'utilisateur veux modifier le graphe sans avoir au préalable choisi l'option contruire le graphe
                alert("vous devez choisir l'option 'Construire le graphe' pour pouvoir construire votre graph !");
            }
        }else{//On interdit toute modification apres creation de la civilisation
            alert("Vous avez déjà créé la civilisation, vous ne pouvez plus la modifier !");
        }
    });

    //quand  on clique sur le bouton de d'option pour shoisir construire le graphe, choisir le point de départ ou choisir le point d'arrivee 
    $("input[name='radioAction']").click(function(){
        radioActionValue = $("input[name='radioAction']:checked").val();
    });


    //permet de d'obtenir la position de la souri et de l'afficher à tout instant
    $("#field").mousemove(function(e){
        var posX = $(this).position().left,
            posY = $(this).position().top;

        x = (e.pageX - posX-10);
        y = (e.pageY - posY-10);
    $("#diplayCordinateDiv").html("<b>X = "+x+"<br/>Y = "+y+"</b>");
    });



    //quant l'utilisateur clique sur le bouton creer civilisation apres avoir fini la creation du graphe
    $("#initBt").click(function(e){
        nbAnts = parseInt($("#antNumberInput").val(), 10);
        nbIter = parseInt($("#iterNumberInput").val(),10);

        //////Ici on fait tous les tests pour savoir si tout a été bien remplie et que toutes les conditions sont respectées
        if(civilisation.roadsList.length<3 || civilisation.citiesList.length<3){//Le graphe doit avoir 3 routes et 3 villes
            alert("Vous devez creer au moins 3 villes et 3 routes !");
            return;
        }

        if(!(Number.isInteger(nbAnts) && nbAnts>0)){//le nombre de fourmi doit etre entier positif
            alert("Veuillez entrer un nombre de fourmies valide !");
            return;
        }
        if(!(Number.isInteger(nbIter) && nbIter>0)){//le nombre d'iteration doit etre entier positif
            alert("Veuillez entrer un nombre d'itération valide !");
            return;
        }
        if(iterGeneChecked){//si on a choisi de faire tourner l'algorithme génétique
            nbIterBeforeGene = parseInt($("#iterGeneNumberInput").val(),10); 
            if(!(Number.isInteger(nbIterBeforeGene) && (nbIterBeforeGene>0))){//alors le l'interval d'iteration de l'algorithme doit etre un entier positif
                alert("Veuillez entrer un interval d'iteration valide pour l'algorithme génétique !");
                return;
            }
        }

        if(civilisation.firstCityKey == null){//On s'assure que l'utilisateur à choisi la ville de départ 
            alert("Veuillez choisir la ville de début !");
            return;
        }
        if(civilisation.lastCityKey == null){//On s'assure que l'utilisateur à choisi la ville d'arrivé
            alert("Veuillez choisir la ville d'arrivée !");
            return;
        }
        if(civilisation.firstCityKey == civilisation.lastCityKey){//On interdit que la ville départ soit en meme temps la ville d'arrivée
            alert("la ville de départ doit etre differente de la ville d'arrivée !");
            return;
        }
        
        /////////Une fois que toutes ces conditions sont réspectées on passe /////////
        ///////maintenant à l'initialisation des fourmis, des phéromones des routes////////

        civilisation.initAnts(nbAnts); //creationd des fourmis
        civilisation.initPheromones(nbAnts); //initialisation des pheromones
        
        //initiation des variables liées a l'algo genetique
        if(iterGeneChecked){
            civilisation.runAlgoGene = true;
            civilisation.nbIterForAlgoGene = nbIterBeforeGene;
        }
        else civilisation.runAlgoGene = false;

        $("#activeGeneAlgoCheckbox").attr("disabled", true);
        

        civilisation.go();//! //on donne le coup d'envoi

        //nombre de fois que le meilleur chemin a ete mis a jour pour savoir quand notifier l'utilisateur 
        //qu'une meilleur chemin a ete trouve s'il a choisi d'etre notifié
        lastNbBestRoadUpdeted = civilisation.nbBestRoadUpdeted;

        $("#initBt").prop("disabled",true);
        $("#launchBt").prop("disabled",false);
        $("#field").css({"cursor":"not-allowed", "background-color":"rgba(71, 197, 255, 0.701)"});

        createCivilisationClicked = true;//Si tout est ok on met a jour la variable qui permet d'indiquer que ce bouton est cliqué

    });

    
    //quand on clique sur le bouton de lancement de la recherche : c'est la boucle qui permet de chercher le plus court chemin 
    //jusqu'a ce que le nombre d'iteration soit atteint ou que tous les fourmis se perdent
    $("#launchBt").click(function(e){
        while((civilisation.nbNestReached<nbIter) && (civilisation.antsList.length>0)){//tant qu'on a pas encore atteint le nombre d'iteration et que tous les fourmis ne se sont pas perdus
            civilisation.takeOneStep(); //On fait un pas (pour tout les formis)
            if($('#notifyerCheckbox').is(":checked") && lastNbBestRoadUpdeted<civilisation.nbBestRoadUpdeted){//Si l'utilisateur a choisi d'etre notifie et qu'un plus court chemin est trouvé alors on on le lui notifie
                lastNbBestRoadUpdeted = civilisation.nbBestRoadUpdeted;
                alert("Un nouveau chemin plus court a étè trouvé");
                $("#launchBt").html("Continuer la recherche");
                var infoContent = "Longueur du chemin trouvé : "+civilisation.bestPathLength+"<br/><br/>"+
                              "Nombre de fourmies perdues lors de la recherche : "+(nbAnts-civilisation.antsList.length);
                $('#infos').show();
                $('#infos').html(infoContent);
                break;
            }
        }

        if(civilisation.antsList.length<=0){//Si toutes les fourmis se sont perdus alors on le lui notifie
            console.log("Il n'y a plus de fourmie !");
            alert("Toutes les fourmies se sont pérdues en cours de route... !");
            
        }

        //Enfin, si tous les foumis se sont perdues ou que le nombre d'iteration est atteint alors on arrete la recherche et on lui affiche le resultat
        if((civilisation.antsList.length<=0) || (civilisation.nbNestReached>=nbIter)){
            $("#launchBt").prop("disabled",true);
            $("#initBt").prop("disabled",true);
            var infoContent = "Longueur du chemin trouvé : "+civilisation.bestPathLength+"<br/><br/>"+
                              "Nombre de fourmies perdues lors de la recherche : "+(nbAnts-civilisation.antsList.length);
            $('#infos').show();
            $('#infos').html(infoContent);
            return;
        }


    });
    

    //Il s'agit de la fonction qui permet de verifier si une route existe ou pas (i.e. si deux villes sont déja relié par une route)
    function checkIfRoadExist(firstCityKey, secondCityKey){
        for(i=0; i<civilisation.roadsList.length; i++){
            if((civilisation.roadsList[i].firstCityKey == firstCityKey && civilisation.roadsList[i].secondCityKey == secondCityKey)
            || (civilisation.roadsList[i].firstCityKey == secondCityKey && civilisation.roadsList[i].secondCityKey == firstCityKey)){
                return true; //On retourne true si la route existe déja
            }
        }
        return false; //false sinon
    }
});//Fin du document.ready



//permet de creer une ligne (une route)
function line(x, y, x1, y1, parentId, lineId) {
    var l = $("<div id = '"+lineId+"' class='line'>");
    var w = 10;
    l.css({
        top: y+w,
        left: x+w,
        width: Math.sqrt((x1-x)*(x1-x) + (y1 - y)*(y1 - y)),
        transform: 'rotate('+Math.atan2((y1-y),(x1-x))+'rad)'
    });
    $('#'+parentId).append(l);
}

//permet de claculer la longueure de la route
function normeVect(x, y){
    return Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
}


