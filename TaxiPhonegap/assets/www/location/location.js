console.log("locationjs..."); 
  
var map; 
var myScroll; 
  
var query; 
var page = 0; 
var locations = []; 
var markers = []; 
var zIdx = 0; 
  
var contentWidth; 
var contentHeight; 
  
var defaultMarkerImg = "../images/common/marker/location_marker_off.png"; 
var selectedMarkerImg = "../images/common/marker/location_marker_on.png"; 
  
  
$(document).ready(function() { 
	initAjaxLoading();
	
	document.addEventListener("deviceready", onDeviceReady, false);
	
    contentWidth = $("#contentLocation").outerWidth(); 
      
    $("#divSearchInput").css("width", contentWidth + "px"); 
    var glassWidth = $("#magnifyingGlass").outerHeight();  
    var searchInputWidth = contentWidth - 30 - 30 - 12; 
    $("#searchInput").css("width", searchInputWidth + "px"); 
      
      
    var params = getHrefParams(); 
    query = params.query; 
    
    initMap(function() {
        searchLocation(query, page); 
    }); 
      
    $("#searchInput").val(query); 
      
    $("#searchInput").bind("keypress", function(e) { 
        if (e.keyCode == 13) { 
            searchAgain(this); 
        } 
    }); 
    $("#searchInput").on("input", function(e) { 
        if ( $("#searchInput").val() == "" ) { 
            $("#aSearchClear").css("visibility", "hidden"); 
        } else { 
            $("#aSearchClear").css("visibility", "visible"); 
        } 
    }); 
    $("#searchInput").click(function(event) { 
        event.stopPropagation(); 
        this.select(); 
        
        return false;
    }); 
      
    $("#aSearchClear").click(function(event) { 
        event.stopPropagation(); 
        $("#searchInput").val(""); 
        $("#aSearchClear").css("visibility", "hidden");
        
        return false;
    }); 
      
      
}); 

/**
 * deviceready 이벤트
 */
var onDeviceReady = function() {
	console.log("onDeviceReady()");

	push.initialise();
	
	document.addEventListener("backbutton", touchBackBtnCallbackFunc, false);	
};

function loaded() {
    console.log("loaded()"); 
    myScroll = new iScroll('wrapper', { 
        snap: "li", 
        momentum: false,             
        hScrollbar: false, 
        onRefresh: function () { 
        }, 
        onScrollMove: function () { 
        }, 
        onScrollEnd: function () { 
        },  
        onTouchEnd: function () { 
//          console.log("onTouchEnd..."); 
            if ( page < 5 && this.maxScrollX > this.x ) { 
                searchLocation(query, ++page); 
                  
            } else { 
                var currPageX = this.currPageX; 
                  
                hideMarkers(markers); 
                markers[currPageX].setZIndex(++zIdx); 
                markers[currPageX].getIcon().url = selectedMarkerImg; 
                showMarkers(markers); 
  
                map.moveTo(markers[currPageX].position, 10); 
            } 
        } 
    }); 
}
  
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false); 
  
document.addEventListener('DOMContentLoaded', loaded, false); 
  
document.addEventListener("deviceready", function() {
	document.addEventListener("backbutton", yourCallbackFunction, false);	
}, false);


var yourCallbackFunction = function() {
	changeHref("../home/home.html");
};

var searchAgain = function( target ) { 
    var tmpQuery = $.trim( $(target).val() ); 
    if ( tmpQuery && tmpQuery != "" ) { 
        query  = tmpQuery; 
        changeHref( "location.html", { query : query }); 
    } 
}; 
  
var searchLocation = function(query, page) { 
    console.log("searchLocation(query, page)"); 
    console.log(query, page);
    
    var params = { 
            query : encodeURI(query), 
            places : 8, 
            addrs : 8, 
            sr : "RANK",   //DIS:거리순, RANK:정확도순, MATCH:일치 
            p : page, 
            timestamp : 1317949634794 
        }; 
      
    $.getJSON( rootPath + "/map/ollehMapApi.do",  
            {
                url : "http://openapi.kt.com/maps/search/localSearch", 
                params : JSON.stringify( params ) 
            },  
            function(result) {
            	console.log("======success :: " + JSON.stringify(result));
                if ( result.status == "success" ) {
                    var resultData =  JSON.parse(result.data); 
                    var tmpLocations = [];           
                    tmpLocations = resultData.payload.RESULTDATA.place.Data; 
                    if (tmpLocations && tmpLocations.length > 0) { 
                        var locationLen = locations.length; 
                        for( var i = 0 ; i < tmpLocations.length; i++ ) { 
                            locations[locationLen + i] = tmpLocations[i]; 
                        } 
                          
                        var tmpMarkers = setMarkers(tmpLocations); 
                        var markerLen = markers.length; 
                        for( var i = 0 ; i < tmpMarkers.length; i++ ) { 
                            markers[markerLen + i] = tmpMarkers[i]; 
                        } 
                    } 
                      
                    createLocationList(locations, page); 
                } 
            }); 
}; 
  
var createLocationList = function(locations, page) { 
    console.log("createLocationList()"); 
      
    if ( !myScroll ) { 
        loaded(); 
    } 
      
    $("#ulLocationList").children().remove(); 
    $("#scroller").css("width", 0+"px"); 
      
    if ( locations && locations.length > 0 ) { 
        for(var i in locations) { 
            $("<li>") 
                .addClass("liLocationList") 
                .attr("id","liLocationList" + i).css("left",(contentWidth * i) + "px") 
                .css("width", contentWidth) 
                .append( 
                        $("<a>") 
                            .addClass("divFavoriteIcon") 
                            .attr("data-idx",i) 
                            .append(  
                                    $("<img>") 
                                        .attr("src", "../images/common/favorite-non-icon.png") 
                                        .attr("href","#") 
                                        .attr("data-status","false") ) 
//                            .click(function(event) {
                            .on("touchend", function(event) {
                                event.stopPropagation(); 
                                var liIdx = $(this).attr("data-idx"); 
                                addAndDelFavoriteLocation(liIdx, locations);
                            }) ) 
                .append( 
                        $("<div>") 
                            .addClass("locationNameAndAddress") 
                            .append( 
                                    $("<legend>") 
                                        .addClass("locationName") 
                                        .text( locations[i].NAME )) 
                                        .append(
                                                $("<p>") 
                                                    .addClass("locationAddress") 
                                                    .text(locations[i].ADDR) ) )
                .append( 
                        $("<div>") 
                            .addClass("locationStartAndEnd") 
                            .attr("data-idx",i) 
                            .append( 
                                    $("<a>") 
                                        .addClass("locationStart") 
                                        .attr("href","#") 
                                        .append( $("<span>").text("출발") ) 
                                        .click(function(event) { 
                                            event.stopPropagation(); 
                                            var liIdx =  $(this).parents(".locationStartAndEnd").attr("data-idx"); 
                                            setStartSession( 
                                                    locations[liIdx].X,  
                                                    locations[liIdx].Y,  
                                                    locations[liIdx].NAME,  
                                                    "", 
                                                    function() { 
                                                        changeHref("../home/home.html"); 
                                                    } );
                                            
                                            return false;
                                        }) )  
                            .append( 
                                    $("<a>") 
                                        .addClass("locationEnd") 
                                        .attr("href","#") 
                                        .append( $("<span>").text("도착") ) 
                                        .click(function(event) { 
                                            event.stopPropagation(); 
                                            var liIdx =  $(this).parents(".locationStartAndEnd").attr("data-idx"); 
                                            setEndSession( 
                                                    locations[liIdx].X,  
                                                    locations[liIdx].Y,  
                                                    locations[liIdx].NAME,  
                                                    "", 
                                                    function() { 
                                                        changeHref("../home/home.html"); 
                                                    } );
                                            
                                            return false;
                                        }) ) ) 
            .appendTo($("#ulLocationList")); 
              
            $("#scroller").css("width", parseInt($("#scroller").css("width")) + contentWidth + "px"); 
        } 
          
        myScroll.refresh(); 
          
        var currPageX = myScroll.currPageX; 
        if ( currPageX != 0) { 
            myScroll.scrollToPage( ++currPageX, 1, 1000); 
        } 
          
        if ( currPageX % 8 == 0 ) { 
            markers[currPageX].setZIndex(++zIdx); 
            hideMarkers(markers); 
            markers[currPageX].getIcon().url = selectedMarkerImg; 
            showMarkers(markers); 
            map.moveTo(markers[currPageX].position, 10); 
        } 
          
        // 즐겨찾기 초기설정 
        getFavoriteLocation(function(favoriteLocationList) { 
            for(var i in favoriteLocationList) { 
                for(var j in locations ) { 
                    if (favoriteLocationList[i].fvrtLocLat == locations[j].Y &  
                            favoriteLocationList[i].fvrtLocLng == locations[j].X &  
                            favoriteLocationList[i].fvrtLocName == locations[j].NAME) { 
                        $(".divFavoriteIcon[data-idx=" + j + "] img") 
                            .attr( 'src', '../images/common/favorite-icon.png') 
                            .attr("data-status","true"); 
                    } 
                      
                } 
            } 
        }); 
          
    } else { 
    	$("<li>")
			.width(contentWidth +"px")
			.append(
					$("<div>")
					.addClass("divMsgArea")
					.append(
							$("<h1>")
								.text( "검색 결과가 없습니다." ) ) )
			.appendTo( $("#ulLocationList") );
	
		$("#scroller").css("width", parseInt($("#scroller").css("width")) + contentWidth + "px");
		myScroll.disable(); 
          
    } 
  
}; 
  
var getFavoriteLocation = function(execute) { 
    console.log("getFavoriteLocation()"); 
      
    var url =  rootPath + "/member/getFavoritePlaces.do"; 
    $.getJSON(url 
            , function(result) { 
                if (result.status == "success") { 
                    var favoriteLocationList = result.data; 
                    execute(favoriteLocationList); 
                } else { 
                    alert(result.data); 
                } 
    }); 
}; 
  
var addAndDelFavoriteLocation = function(idx, locations) { 
    console.log("favoriteLocation(idx, locations)"); 
//    console.log(idx, location); 
      
    getFavoriteLocation(function(favoriteLocationList) {
          
        if($(".divFavoriteIcon[data-idx=" + idx + "] img").attr("data-status") =="false") {
            $(".divFavoriteIcon[data-idx=" + idx + "] img").attr("data-status","true"); 
            $(".divFavoriteIcon[data-idx=" + idx + "] img").attr('src', '../images/common/favorite-icon.png'); 
            var isFavoriteLocation = false; 
            for ( var i in favoriteLocationList) { 
                if ((favoriteLocationList[i].fvrtLocLat == locations[idx].Y &  
                        favoriteLocationList[i].fvrtLocLng == locations[idx].X &  
                        favoriteLocationList[i].fvrtLocName == locations[idx].NAME)) { 
                    isFavoriteLocation = true; 
                } else { 
                      
                }  
            } 
              
            if (isFavoriteLocation == false) { 
                $.post( rootPath + "/member/addFavoritePlace.do"
                        ,{
                            fvrtLocName : locations[idx].NAME, 
                            fvrtLocLng  : locations[idx].X, 
                            fvrtLocLat  : locations[idx].Y, 
                        }, function(result) {
                            if (result.status == "success") { 
                                console.log("addFvrtLoc 성공"); 
                            } else { 
                                alert(result.data); 
                            } 
                        }, "json"); 
            } 
              
        } else { 
            $(".divFavoriteIcon[data-idx=" + idx + "] img").attr("data-status","false"); 
            $(".divFavoriteIcon[data-idx=" + idx + "] img").attr('src', '../images/common/favorite-non-icon.png');
            
            for (var i in favoriteLocationList){ 
                if (favoriteLocationList[i].fvrtLocLat == locations[idx].Y &  
                        favoriteLocationList[i].fvrtLocLng == locations[idx].X &  
                        favoriteLocationList[i].fvrtLocName == locations[idx].NAME) { 
                    var url = rootPath + "/member/deleteFavoritePlace.do"; 
                    $.post(url 
                            ,{ 
                                fvrtLocNo : favoriteLocationList[i].fvrtLocNo 
                            }, function(result) { 
                                if (result.status == "success") { 
                                    console.log("deleteFvrtLoc 성공"); 
                                } else { 
                                    alert(result.data); 
                                } 
                            }, "json"); 
                } 
            } 
        } 
    }); 
}; 
  
var initMap = function(callbackFunc) { 
    console.log("initMap()"); 
    // 현재위치 가져오기 
    navigator.geolocation.getCurrentPosition(function(position) { 
        var curPoint = new olleh.maps.Point( position.coords.longitude, position.coords.latitude ); 
        var srcproj = new olleh.maps.Projection('WGS84'); 
        var destproj = new olleh.maps.Projection('UTM_K'); 
        olleh.maps.Projection.transform(curPoint, srcproj, destproj); 
          
        loadMap( new olleh.maps.Coord(curPoint.getX(), curPoint.getY()), 10 ); 
        callbackFunc(); 
          
          
        contentHeight = $(window).height(); 
        $("#contentLocation").css("height", contentHeight+"px"); 
        $("#divMapWrap").css("height", (contentHeight - 129)+"px"); 
          
        $('#searchInput').removeAttr("readonly"); 
    }); 
  
}; 
  
var loadMap = function (coord, zoom) { 
    console.log("loadMap(coord, zoom)"); 
      
    var mapOptions = {       
        center : coord, 
        zoom : zoom, 
        mapTypeId : olleh.maps.MapTypeId.BASEMAP, 
        mapTypeControl: false, 
        zIndex: 0 
    };  
      
    map = new olleh.maps.Map(document.getElementById("canvas_map"), mapOptions); 
}; 
  
var setMarkers = function(locations) { 
    console.log("setMarkers()"); 
    var tmpMarkers = []; 
    for (var i in locations) { 
        tmpMarkers[i] = new olleh.maps.Marker({ 
                position : new olleh.maps.Coord(locations[i].X, locations[i].Y), 
                map : map,   
                icon : new olleh.maps.MarkerImage( 
                        defaultMarkerImg,  
                        new olleh.maps.Size(24, 45), 
                        new olleh.maps.Pixel(0, 0), 
                        new olleh.maps.Pixel(12, 40) 
                ), 
                title : locations[i].NAME, 
        }); 
        tmpMarkers[i].setZIndex(0); 
    } 
    return tmpMarkers; 
}; 
  
var hideMarkers = function(markers) { 
    console.log("hideMarkers(markers)"); 
    for (var i = 0; i < markers.length; i++) { 
        markers[i].getIcon().url = defaultMarkerImg; 
        markers[i].setMap(null); 
    } 
}; 
  
var showMarkers = function(markers) { 
    console.log("showMarkers(markers)"); 
    for (var i = 0; i < markers.length; i++) { 
        markers[i].setMap(map); 
    } 
}; 

/**
 * 뒤로가기 버튼 처리
 */
var touchBackBtnCallbackFunc = function() {
	console.log("touchBackBtnCallbackFunc()");
	changeHref("../home/home.html");
};