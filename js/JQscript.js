
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
    $('#iterGeneNumberDiv').hide();
    $('#infos').hide();

    //Quand l'utilisateur cliquee sur le bouton de selection activeGeneAlgoCheckbox
    $("#activeGeneAlgoCheckbox").change(function(){
        if ($('#activeGeneAlgoCheckbox').is(":checked")){
            $('#iterGeneNumberDiv').show();
            iterGeneChecked = true;
        } else {
            $('#iterGeneNumberDiv').hide();
            iterGeneChecked = false;
        }
    });


    //qunand l'utilisateur clique sur le champs ou on afficher le graph
    $('#field').click(function (e) { 
        if(createCivilisationClicked == false){
            if(radioActionValue == "creatGraph" && createCivilisationClicked == false){
                var posX = $(this).position().left,
                    posY = $(this).position().top;

                x = (e.pageX - posX-10);
                y = (e.pageY - posY-10);
                $('#field').append( "<div class='city' id = '"+counter+"'>"+counter+"</div>" );
                
                $("#"+counter).css({"top": y+"px", "left": x+"px"});

                civilisation.addCity(counter, x, y);

                //On creer un evenement associé a la ville creer 
                $('#'+counter).click(function (e) {
                    e.stopPropagation();
                    if(createCivilisationClicked){
                        alert("Vous avez déjà créé la civilisation, vous ne pouvez plus la modifier !");
                        return;
                    }
                    if(radioActionValue == "creatGraph"){
                        
                        if(firstClickedCityId == null){
                            firstClickedCityId = $(this).attr('id');
                            $("#"+firstClickedCityId).css({"background":" rgba(175, 175, 175)"});
                        } 
                        else if($(this).attr('id') == firstClickedCityId){
                            $("#"+firstClickedCityId).css({"background":" rgb(0, 0, 0)"});
                            firstClickedCityId = null;

                        } 
                        else{
                            
                            newClickedCityId = $(this).attr('id');
                            if(checkIfRoadExist(firstClickedCityId, newClickedCityId) == true){
                                alert("Ces deux villes sont déja connectées !");
                                return;
                            }
                            x1 = civilisation.citiesList[firstClickedCityId].x;
                            y1 = civilisation.citiesList[firstClickedCityId].y;
                            x2 = civilisation.citiesList[newClickedCityId].x;
                            y2 = civilisation.citiesList[newClickedCityId].y;

                            lineId = firstClickedCityId+'_'+newClickedCityId;

                            line(x1, y1, x2, y2, 'field', lineId);
                            roadlength = Math.ceil(normeVect(x1-x2, y1-y2));
                            
                            roadKey = civilisation.addRoad(lineId, roadlength, firstClickedCityId, newClickedCityId);
                            civilisation.citiesList[firstClickedCityId].addRoad(roadKey);
                            civilisation.citiesList[newClickedCityId].addRoad(roadKey);

                            if(firstClickedCityId == civilisation.firstCityKey) $("#"+firstClickedCityId).css({"background":" rgb(0, 134, 18)"});
                            else if(firstClickedCityId == civilisation.lastCityKey) $("#"+firstClickedCityId).css({"background":" rgb(255, 0, 0)"});
                            else $("#"+firstClickedCityId).css({"background":" rgb(0, 0, 0)"});
                            
                            firstClickedCityId = null;
                        }
                    }
                    else if(radioActionValue == "chooseStartCity"){
                        if($(this).attr('id') == civilisation.lastCityKey){
                            alert("la ville de départ doit etre differente de la ville d'arrivée !");
                            return;
                        }

                        if(civilisation.firstCityKey == null){
                            civilisation.firstCityKey = $(this).attr('id');
                            $("#"+civilisation.firstCityKey).css({"background":" rgb(0, 134, 18)"});
                        }else{
                            $("#"+civilisation.firstCityKey).css({"background":" rgb(0, 0, 0)"});
                            civilisation.firstCityKey = $(this).attr('id');
                            $("#"+civilisation.firstCityKey).css({"background":" rgb(0, 134, 18)"});
                        }
                    }
                    else if(radioActionValue == "chooseLastCity"){
                        if($(this).attr('id') == civilisation.firstCityKey){
                            alert("la ville d'arrivée doit etre differente de la ville de départ !");
                            return;
                        }

                        if(civilisation.lastCityKey == null){
                            civilisation.lastCityKey = $(this).attr('id');
                            $("#"+civilisation.lastCityKey).css({"background":" rgb(255, 0, 0)"});
                        }else{
                            $("#"+civilisation.lastCityKey).css({"background":" rgb(0, 0, 0)"});
                            civilisation.lastCityKey = $(this).attr('id');
                            $("#"+civilisation.lastCityKey).css({"background":" rgb(255, 0, 0)"});
                        }
                    }
                });

                counter++;
            }else{
                alert("vous devez choisir l'option 'Construire le graphe' pour pouvoir construire votre graph !");
            }
        }else{
            alert("Vous avez déjà créé la civilisation, vous ne pouvez plus la modifier !");
        }
    });

    //quand  on clique sur le bouton de choix 
    $("input[name='radioAction']").click(function(){
        radioActionValue = $("input[name='radioAction']:checked").val();
    });


    //permet de d'obtenir la position de la souri et de l'afficher
    $("#field").mousemove(function(e){
        var posX = $(this).position().left,
            posY = $(this).position().top;

        x = (e.pageX - posX-10);
        y = (e.pageY - posY-10);
    $("#diplayCordinateDiv").html("<b>X = "+x+"<br/>Y = "+y+"</b>");
    });



    //quant l'utilisateur clique sur le bouton creer civilisation
    $("#initBt").click(function(e){
        createCivilisationClicked = true;
        nbAnts = parseInt($("#antNumberInput").val(), 10);
        nbIter = parseInt($("#iterNumberInput").val(),10);

        if(civilisation.roadsList.length<3 || civilisation.citiesList.length<3){
            alert("Vous devez creer au moins 3 villes et 3 routes !");
            return;
        }

        if(!(Number.isInteger(nbAnts) && nbAnts>0)){
            alert("Veuillez entrer un nombre de fourmies valide !");
            return;
        }
        if(!(Number.isInteger(nbIter) && nbIter>0)){
            alert("Veuillez entrer un nombre d'itération valide !");
            return;
        }
        if(iterGeneChecked){
            nbIterBeforeGene = parseInt($("#iterGeneNumberInput").val(),10); 
            if(!(Number.isInteger(nbIterBeforeGene) && (nbIterBeforeGene>0))){
                alert("Veuillez entrer un interval d'iteration valide pour l'algorithme génétique !");
                return;
            }
        }

        if(civilisation.firstCityKey == null){
            alert("Veuillez choisir la ville de début !");
            return;
        }
        if(civilisation.lastCityKey == null){
            alert("Veuillez choisir la ville d'arrivée !");
            return;
        }
        if(civilisation.firstCityKey == civilisation.lastCityKey){
            alert("la ville de départ doit etre differente de la ville d'arrivée !");
            return;
        }
        

        civilisation.initAnts(nbAnts); //creationd des fourmis
        civilisation.initPheromones(nbAnts); //initialisation des pheromones
        //initiation des variables lié des a l'algo genetique
        if(iterGeneChecked){
            civilisation.runAlgoGene = true;
            civilisation.nbIterForAlgoGene = nbIterBeforeGene;
        }
        else civilisation.runAlgoGene = false;
        $("#activeGeneAlgoCheckbox").attr("disabled", true);
        

        civilisation.go();//! //on donne le coup d'envoi
        lastNbBestRoadUpdeted = civilisation.nbBestRoadUpdeted;
        $("#initBt").prop("disabled",true);
        $("#launchBt").prop("disabled",false);
        $("#field").css({"cursor":"not-allowed", "background-color":"rgba(71, 197, 255, 0.701)"});


    });

    
    //quand on clique sur le bouton de lancement de la recherche
    $("#launchBt").click(function(e){
        while((civilisation.nbNestReached<nbIter) && (civilisation.antsList.length>0)){
            civilisation.takeOneStep();
            if($('#notifyerCheckbox').is(":checked") && lastNbBestRoadUpdeted<civilisation.nbBestRoadUpdeted){
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

        if(civilisation.antsList.length<=0){
            console.log("Il n'y a plus de fourmie !");
            alert("Toutes les fourmies se sont pérdues en cours de route... !");
            
        }
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
    

    function checkIfRoadExist(firstCityKey, secondCityKey){
        for(i=0; i<civilisation.roadsList.length; i++){
            if((civilisation.roadsList[i].firstCityKey == firstCityKey && civilisation.roadsList[i].secondCityKey == secondCityKey)
            || (civilisation.roadsList[i].firstCityKey == secondCityKey && civilisation.roadsList[i].secondCityKey == firstCityKey)){
                return true;
            }
        }
        return false;
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


