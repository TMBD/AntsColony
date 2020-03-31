//const city = require('./City');
//import {City} from "./City"
$(document).ready(function (e) {
    var counter = 0;
    var firstClickedCityId = null;
    var civilisation = new Civilisation("Une civilisation");
    var nbAnts = 0;
    var nbIter = 0;
    var radioActionValue = "creatGraph";
    var lastNbBestRoadUpdeted = 0;
    var createCivilisationClicked = false;
    var iterGeneChecked = false;
    var nbIterBeforeGene = null;
    $('#iterGeneNumberDiv').hide();

    $("#activeGeneAlgoCheckbox").change(function(){
        if ($('#activeGeneAlgoCheckbox').is(":checked")){
            $('#iterGeneNumberDiv').show();
            iterGeneChecked = true;
        } else {
            $('#iterGeneNumberDiv').hide();
            iterGeneChecked = false;
        }
    });



    $('#field').click(function (e) { 
        if(createCivilisationClicked == false){
            if(radioActionValue == "creatGraph" && createCivilisationClicked == false){
                var posX = $(this).position().left,
                    posY = $(this).position().top;

                x = (e.pageX - posX-10);
                y = (e.pageY - posY-10);
                //console.log('X = '+e.pageX+' Y = '+e.pageY)
                $('#field').append( "<div class='city' id = '"+counter+"'>"+counter+"</div>" );
                
                //$('#'+counter).css({"background": "blue"});
                $("#"+counter).css({"top": y+"px", "left": x+"px"});
                // dots[counter] = {
                //     x : (e.pageX - posX-10),
                //     y : (e.pageY - posY-10)
                // };
                //var currentCityKey = civilisation.addCity(counter, x, y);
                civilisation.addCity(counter, x, y);

                $('#'+counter).click(function (e) {
                    e.stopPropagation();
                    if(createCivilisationClicked){
                        alert("Vous avez déjà créé la civilisation, vous ne pouvez plus la modifier !");
                        return;
                    }
                    if(radioActionValue == "creatGraph"){
                        
                        if(firstClickedCityId == null) firstClickedCityId = $(this).attr('id');
                        else if($(this).attr('id') == firstClickedCityId) firstClickedCityId = null;
                        else{
                            newClickedCityId = $(this).attr('id');
                            //console.log("counter : "+newClickedCityId);
                            //console.log("firs : "+firstClickedCityId);
                            x1 = civilisation.citiesList[firstClickedCityId].x;
                            y1 = civilisation.citiesList[firstClickedCityId].y;
                            x2 = civilisation.citiesList[newClickedCityId].x;
                            y2 = civilisation.citiesList[newClickedCityId].y;

                            // x1 = dots[firstClickedCityId].x;
                            // y1 = dots[firstClickedCityId].y;
                            // x2 = dots[newClickedCityId].x;
                            // y2 = dots[newClickedCityId].y;
                            lineId = firstClickedCityId+'_'+newClickedCityId;

                            line(x1, y1, x2, y2, 'field', lineId);
                            roadlength = Math.ceil(normeVect(x1-x2, y1-y2));
                            //console.log(roadlength);
                            roadKey = civilisation.addRoad(lineId, roadlength, firstClickedCityId, newClickedCityId);
                            civilisation.citiesList[firstClickedCityId].addRoad(roadKey);
                            civilisation.citiesList[newClickedCityId].addRoad(roadKey);

                            // ListOfCities[firstClickedCityId].addRoad(newClickedCityId);
                            // ListOfCities[newClickedCityId].addRoad(firstClickedCityId);
                            //ListOfRoads.push(new Road(lineId, normeVect(x1-x2, y1-y2), firstClickedCityId, newClickedCityId));
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

    
    $("input[name='radioAction']").click(function(){
        radioActionValue = $("input[name='radioAction']:checked").val();
    });



    
    $("#field").mousemove(function(e){
        var posX = $(this).position().left,
            posY = $(this).position().top;

        x = (e.pageX - posX-10);
        y = (e.pageY - posY-10);
    $("#diplayCordinateDiv").html("<b>X = "+x+"<br/>Y = "+y+"</b>");
    });




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
        

        civilisation.initAnts(nbAnts);
        civilisation.initPheromones(nbAnts);
        if(iterGeneChecked){
            civilisation.runAlgoGene = true;
            civilisation.nbIterForAlgoGene = nbIterBeforeGene;
        }
        else civilisation.runAlgoGene = false;
        $("#activeGeneAlgoCheckbox").attr("disabled", true);
        // civilisation.firstCityKey = 0; //!
        // civilisation.lastCityKey = counter-1; //!
        

        civilisation.go();//!
        lastNbBestRoadUpdeted = civilisation.nbBestRoadUpdeted;
        $("#initBt").prop("disabled",true);
        $("#launchBt").prop("disabled",false);
        $("#field").css({"cursor":"not-allowed", "background-color":"rgba(71, 197, 255, 0.701)"});


        // while((civilisation.nbNestReached<nbIter) && (civilisation.antsList.length>0)){
        //     civilisation.takeOneStep();
        //     if($('#notifyerCheckbox').is(":checked") && lastNbBestRoadUpdeted<civilisation.nbBestRoadUpdeted){

        //     }
        // }
            

        // if(civilisation.antsList.length<=0){
        //     console.log("Il n'y a plus de fourmie !");
        //     alert("Toutes les fourmies se sont pérdues en cours de route... !");
        //     return;
        // }
        // //highlightBestRoads(civilisation);
        // console.log(civilisation.bestRoadsListKey);
        // console.log('nombre de fourmie finale '+civilisation.antsList.length);

    });

    



    $("#launchBt").click(function(e){
        while((civilisation.nbNestReached<nbIter) && (civilisation.antsList.length>0)){
            civilisation.takeOneStep();
            if($('#notifyerCheckbox').is(":checked") && lastNbBestRoadUpdeted<civilisation.nbBestRoadUpdeted){
                lastNbBestRoadUpdeted = civilisation.nbBestRoadUpdeted;
                alert("Un nouveau chemin plus court a étè trouvé");
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
            $('#settingContainer').append( "<div id = 'infos'>"+infoContent+"</div>" );
            return;
        }
        //highlightBestRoads(civilisation);
        //console.log(civilisation.bestRoadsListKey);
        //console.log('nombre de fourmie finale '+civilisation.antsList.length);


    });
    





});


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

function normeVect(x, y){
    return Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
}


