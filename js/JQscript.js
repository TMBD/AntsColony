//const city = require('./City');
//import {City} from "./City"
$(document).ready(function (e) {
    var counter = 0;
    var firstClickedCityId = null;
    var civilisation = new Civilisation("Une civilisation");
    var nbAnts = 100;
    var nbIter = 10*nbAnts;

    $('#field').click(function (e) { 
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
        civilisation.addCity(counter, x, y);

        $('#'+counter).click(function (e) {
            e.stopPropagation();
            
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
        });


        counter++;
    });

    


    $("#launchBt").click(function(e){
        civilisation.initAnts(nbAnts);
        civilisation.initPheromones(nbAnts);
        civilisation.firstCityKey = 0; //!
        civilisation.lastCityKey = counter-1; //!

        civilisation.go();//!
        
        while((civilisation.nbNestReached<nbIter) && (civilisation.antsList.length>0))
            civilisation.takeOneStep();

        if(civilisation.antsList.length<=0)
            console.log("Il n'y a plus de fourmie !");

        //highlightBestRoads(civilisation);
        console.log(civilisation.bestRoadsListKey);
        console.log('nombre de fourmie finale '+civilisation.antsList.length);

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


