var map;
var curCoord;
var geocoder;
var directionsService;
var curMarker;
var curCircle;
var startMarker;
var startCircle;
var endMarker;
var endCircle;

var directionsRenderer;
var directionMarkers;


$(document).ready(function() {
	console.log("homejs...");
	init();
	
	drawRelationMap();
	
	
	$("#btnSettings").click(function() {
		window.location.href = "../settings/settings.html";
	});
	
	$("#btnCurrentLoc").click(function() {
    	map.moveTo(curCoord);
    	setStartSession(
    			curCoord.getX(), 
    			curCoord.getY(), 
    			null, 
    			"내위치: ", 
    			function () {
		    		checkStartLocation();
		    	});
    });
	
	 $("#btnFavoriteLoc").click(function(){ 
		favoriteList(); 
		$("#divFavoriteLoc_popup").popup("open"); 
		$('#divRoomList').attr("data-flag", "close").animate({right: "-150px"},300);
	}); 
	$("#favorite_Header").click(function(){ 
	    $("#divFavoriteLoc_popup").popup("close"); 
	});
	
	
	$(".divLocationInput input[type=text]").bind("keypress", function(e) {
		if (e.keyCode == 13) {
			searchLocation(this);
		}
	});
	
	$("#btnAddViewRoom").click(function() {
		if ($("#btnAddViewRoom").text() == "+") {
			isRoomMbr( function() { // isRoomMbrTrue
		    	alert("이미 방에 참여 중입니다.");
		    },
		    function() { // isRoomMbrFalse
				$("#divAddRoomCondition_popup").popup("open");
				$("#setTimeBox").parent().css("display","none");
		    } );
			
		} else {
			alert("참여중인 방 화면으로 이동");
			$.getJSON("../room/getMyRoom.do", function(result) {
				console.log(result);
				if (result.status === "success") {
					var room = result.data;
					if ( room && room != null && 
							room.roomNo && room.roomNo != null && room.roomNo != 0) {
						window.location.href = setParams("../room/room.html", { roomNo : room.roomNo });
					}
				}
			});
			
		}
	});
	$("#divAddRoomCondition_popup a[data-icon=delete]").click(function() {
		$("#divAddRoomCondition_popup").popup("close");
	});
	$("#btnAddRoomSubmit").click(function() { 
        addRoom(); 
    }); 
	
	$(".btnJoin").click(function() { 
        var roomNo = $("#divRoomControl_popup").attr("data-no"); 
        joinRoom(roomNo); 
    }); 
    $("#btnRoomInfo_popup").click(function() {
        $('#divRoomList').attr("data-flag", "close").animate({right: "-150px"},300);   
    }); 
    $("#btnCloseRoomInfo").click(function() { 
        $('#divRoomList').attr("data-flag", "open").animate({right:"0px"},500); 
    }); 

}); //ready()


var init = function() {
	console.log("init()");
	// 현재위치 조회
	navigator.geolocation.getCurrentPosition(function(position) {
		var curPoint = new olleh.maps.Point( position.coords.longitude, position.coords.latitude );
//		curPoint = new olleh.maps.Point( 127.027699, 37.498321 );		//강남역					37.498321, 127.027699	==>	1944444.7947507137, 958252.2212954559
//		curPoint = new olleh.maps.Point( 127.028085, 37.494831 );		//비트교육센터			37.494831, 127.028085	==>	1944057.4305749675, 958284.3996343074
//		curPoint = new olleh.maps.Point( 127.001928, 37.582456 );		//혜화역					37.582456, 127.001928	==>	1953790.8525704339, 956023.6917773776
//		curPoint = new olleh.maps.Point( 127.000641, 37.586027 );		//혜화로터리				37.586027, 127.000641	==>	1954187.641569722, 955912.1639432621
//		curPoint = new olleh.maps.Point( 126.998958, 37.579863 );		//서울대학병원			37.579863, 126.998958	==>	1953504.56599458, 955759.9252819163
//		curPoint = new olleh.maps.Point( 127.00237 , 37.577236 );		//방송통신대학교		37.577236, 127.00237	==>	1953211.5116532317, 956059.6498991799
//		curPoint = new olleh.maps.Point( 126.929723, 37.484207 );		//신림역					37.484207, 126.929723	==>	1942926.8986323199, 949582.3412903354
//		curPoint = new olleh.maps.Point( 126.928092, 37.484224 );		//이철헤어커커 신림	37.484224, 126.928092	==>	1942929.6593462331, 949438.156302435
//		curPoint = new olleh.maps.Point( 126.934465, 37.484547 );		//은천교회				37.484547, 126.934465	==>	1942962.09067221, 950001.807260273
//		curPoint = new olleh.maps.Point( 126.927191, 37.485296 );		//대현오피스텔			37.485296, 126.927191	==>	1943049.075365723, 949359.22264851

		
//		console.log(position.coords.longitude +","+ position.coords.latitude);
		var srcproj = new olleh.maps.Projection('WGS84');
		var destproj = new olleh.maps.Projection('UTM_K');
		olleh.maps.Projection.transform(curPoint, srcproj, destproj);
		console.log(curPoint.getY() + ", " + curPoint.getX());
		curCoord = new olleh.maps.Coord(curPoint.getX(), curPoint.getY());
		
		geocoder = new olleh.maps.Geocoder("KEY");
		directionsService = new olleh.maps.DirectionsService('frKMcOKXS*l9iO5g');
		
//		loadMap( curCoord, 10);
		console.log("loadMap()");
	  	var mapOptions = {  	
	     	center : curCoord,
	     	zoom : 10,
	     	mapTypeId : olleh.maps.MapTypeId.BASEMAP
	  	}; 
	  	map = new olleh.maps.Map(document.getElementById("canvas_map"), mapOptions);
	  	
//		curMarker = setMarker( curCoord, getSessionItem("loginInfo").mbrPhotoUrl );
		console.log("setMarker()");
		var myIcon = new olleh.maps.MarkerImage(
				getSessionItem("loginInfo").mbrPhotoUrl,
				new olleh.maps.Size(40, 40),
				new olleh.maps.Pixel(0,0),
				new olleh.maps.Pixel(20, 20) );
		curMarker = new olleh.maps.Marker({ 
			position: curCoord,  
			map: map,  
//			shadow: shadow,
			icon: myIcon,			
			title : '내위치',
			zIndex : 1		
	  	});
		
		checkLocations();
		
	});
};


var checkLocations = function() {
	console.log("checkLocations()");
	checkStartLocation();
};


var checkStartLocation = function() {
	console.log("checkStartLocation()");
	$.getJSON("../room/getLocationSession.do", function(result) {
		var locationSession = result.data;

		if ( locationSession && locationSession != null &&
				locationSession.startName && locationSession.startName != null && locationSession.startName != "" &&
				locationSession.startX && locationSession.startX != null && locationSession.startX != "" &&
				locationSession.startY && locationSession.startY != null && locationSession.startY != "" ) {
			setStartLocation(locationSession.startX, locationSession.startY, locationSession.startName, locationSession.startPrefix);
			
			checkEndLocation();
			
		} else {
			setStartSession(
					curCoord.getX(), 
					curCoord.getY(), 
					null, 
					"내위치: ", 
					function () {
			    		checkStartLocation();
			    	} );
			
		}
	});
};


var setStartLocation = function (x, y, locName, prefix) {
	console.log("setStartLocation()");
	
	if ( !prefix || prefix == null ) {
		prefix = "";
	}
	
	$("#textStartLocation").val(prefix + locName)
									.attr("placeholder", prefix + locName );
	
	var coord = new olleh.maps.Coord( x, y );
	if (startMarker) {
		startMarker.setMap(null);
	}
	if (startCircle) {
		startCircle.setMap(null);
	}
	
	var icon = new olleh.maps.MarkerImage(
			"../images/common/marker/Map-Marker-Ball-Azure-icon.png",
			new olleh.maps.Size(40, 40),
			new olleh.maps.Pixel(0,0),
			new olleh.maps.Pixel(20, 40)
		);
	startMarker= new olleh.maps.Marker({ 
			position: coord,  
			map: map,  
//			shadow: shadow,
			icon: icon,			
			title : '출발지',
			zIndex : 1		
	  	});
	startCircle = setCircle( coord, "#00ffff", getSessionItem("loginInfo").startRange );

//	// 958873	1942817
//	console.log(startMarker);
//	console.log(startMarker.position.x, curMarker.position.x, startMarker.position.y, curMarker.position.y);
//	var markerDistance = Math.sqrt( Math.pow( startMarker.position.x - curMarker.position.x, 2 ) + Math.pow( startMarker.position.y - curMarker.position.y, 2 ) );
//	console.log(markerDistance);
//	if ( markerDistance < 100.0 ) {
//		console.log("0000000000000000000000000");
//		startMarker.setMap(null);
//		startCircle.setCenter(curCoord);
//		startCircle.setCenter(map);
//	}
};


var checkEndLocation = function() {
	console.log("checkEndLocation()");
	$.getJSON("../room/getLocationSession.do", function(result) {
		var locationSession = result.data;
		
		if ( locationSession && locationSession != null &&
				locationSession.endName && locationSession.endName != null && locationSession.endName != "" &&
				locationSession.endX && locationSession.endX != null && locationSession.endX != "" &&
				locationSession.endY && locationSession.endY != null && locationSession.endY != "" ) {
			setEndLocation(
					locationSession.endX, 
					locationSession.endY, 
					locationSession.endName, 
					locationSession.endPrefix );
			
			setSessionItem("locationSession", locationSession);
			searchRooms();
			
		} else {
			$.getJSON("../member/getRecentDestination.do", function(result) {
				if (result.status === "success") {
					var recentDestinationList = result.data;
					if ( recentDestinationList.length > 0 ) {
//						console.log(recentDestinationList);
						setEndSession(
								recentDestinationList[0].fvrtLocLng, 
								recentDestinationList[0].fvrtLocLat, 
								recentDestinationList[0].fvrtLocName, 
								"최근목적지: ", 
								function() {
									checkEndLocation();
								} );
					}
				}
			});
			
		}
	});
};


var setEndLocation = function (x, y, locName, prefix) {
	console.log("setEndLocation()");
	
	if ( !prefix || prefix == null ) {
		prefix = "";
	}
	
	$("#textEndLocation").val(prefix + locName)
									.attr("placeholder", prefix + locName );
	
	var coord = new olleh.maps.Coord( x, y );
	if (endMarker) {
		endMarker.setMap(null);
	}
	if (endCircle) {
		endCircle.setMap(null);
	}
	
	var icon = new olleh.maps.MarkerImage(
			"../images/common/marker/Map-Marker-Ball-Pink-icon.png",
			new olleh.maps.Size(40, 40),
			new olleh.maps.Pixel(0,0),
			new olleh.maps.Pixel(20, 40)
		);
		endMarker= new olleh.maps.Marker({ 
			position: coord,  
			map: map,  
//			shadow: shadow,
			icon: icon,			
			title : '출발지',
			zIndex : 1		
	  	});
	endCircle = setCircle( coord, "#00ffff", getSessionItem("loginInfo").endRange );
};


var setCircle = function( coord, color, radius ) {
	var circle = new olleh.maps.Circle({
		center: coord,
		radius: radius,
		map: map,
		fillColor: color, 
		fillOpacity: 0.07,
		strokeColor: color,
		strokeOpacity: 0.4,
		strokeWeight: 1
	});
	
	return circle;
};


var searchLocation = function( target ) {
    console.log("searchLocation()");
    var query = $.trim($(target).val());
    if ( target && query != "" ) {
            if ( query.indexOf("내위치: ") == 0 || query.indexOf("최근목적지: ") == 0 ) {
                    query = query.split(": ")[1];
            } 

            var params = null;
            if ( $(target).get(0) == $("#textStartLocation").get(0) ) {
                    params = { "query" : query };
            } else if ( $(target).get(0) == $("#textEndLocation").get(0) ) {
                    params = { "query" : query };
            }
            
            window.location.href = setParams("../location/location.html", params);
    }

};


var searchRooms = function() {
	console.log("searchRooms()");
	
	isRoomMbr( function() {
		$("#btnAddViewRoom").text("방");
		$(".btnJoin").addClass("ui-disabled");
	}, function() {
		$("#btnAddViewRoom").text("+");
		$(".btnJoin").removeClass("ui-disabled");
	} );
	
	var locationSession = getSessionItem("locationSession");
	var loginInfo = getSessionItem("loginInfo");
	$.post("../room/searchRooms.do"
			, {
				startLat 		: locationSession.startY,
				startLng 	: locationSession.startX,
				startRange 	: loginInfo.startRange,
				endLat 		: locationSession.endY,
				endLng 		: locationSession.endX,
				endRange 	: loginInfo.endRange
			}, function(result) {
				if (result.status == "success") {
//					console.log(result.data);
					var searchRoomList = result.data;
					initRoute();
					$("#ulRoomList > .roomlst_l").remove();
					$("#ulRoomList > .roomlst_l_menu").remove(); 
					if (searchRoomList.length > 0) {
						$("<li>").addClass("roomlst_l_menu")
									.attr("data-role", "list-divider")
									.attr("data-theme", "no-theme")
									.attr("data-icon", "false")
									.text("리스트")
						.appendTo( $("#ulRoomList") );
					}
					var roomPathList = null;
					for( var i = 0; i < searchRoomList.length; i++ ) {
						roomPathList = searchRoomList[i].roomPathList;
						var startInfo = null;
						var endInfo = null;
						var waypoints = [];
						for ( var j in roomPathList) {
							if ( roomPathList[j].pathRank == 0 ) {
								startInfo = roomPathList[j];
							} else if ( roomPathList[j].pathRank == 99 ) {
								endInfo = roomPathList[j];
							} else {
								waypoints[waypoints.length] = roomPathList[j];
							}
						}
						var startTime = new Date(searchRoomList[i].roomStartTime);
						$("#divRoomList").css("opacity", "1.0");
						$("<li>").addClass("roomlst_l")
									.attr("data-theme", "no-theme")
									.attr("data-icon", "false")
									.append(
								$("<a>").attr("href", "#")
											.addClass("roomItem")
											.attr("data-no", searchRoomList[i].roomNo)
											.attr("data-start_x", startInfo.pathLng)
											.attr("data-start_y", startInfo.pathLat)
											.attr("data-end_x", endInfo.pathLng)
											.attr("data-end_y", endInfo.pathLat)
											.attr("data-room_mbr_count", searchRoomList[i].roomMbrCount)
											.text( startTime.getHours() + ":" + startTime.getMinutes() ) 
											.on("click", function(e) {
												initRoute();
												searchRoute( 
														parseFloat($(this).attr("data-start_x")), 
														parseFloat($(this).attr("data-start_y")),
														parseFloat($(this).attr("data-end_x")),
														parseFloat($(this).attr("data-end_y")),
														"directionsService_callback",
														waypoints );
												$("#divRoomList").css("opacity", "0.6");
												$("#divRoomList a").css("color", "white");
												$("#divRoomControl_popup").popup("open", {
													transition: "slideup"
												});
												$("#divRoomControl_popup").attr("data-no",$(this).attr("data-no"));
											}) )
						.appendTo( $("#ulRoomList") );
						$("#ulRoomList").listview("refresh");
					}
					
					if ( $('#divRoomList').attr("data-flag") == "close" ) {
						$('#divRoomList').attr("data-flag", "open")
												.animate({right:"0px"},500);
//					} else {
//						$('#divRoomList').attr("data-flag", "close")
//												.animate({right: "-150px"},500);  
					}
					
				} else {
					console.log("fail");
					
				}
			}, "json");
};

var initRoute = function() {
	if (directionsRenderer) {
		directionsRenderer.setMap(null);
	}
	
	if (directionMarkers) {
		for( var i in directionMarkers ) {
			directionMarkers[i].setMap(null);
		}
	}
};


var isRoomMbr = function( isRoomMbrTrue, isRoomMbrFalse ) {	
	console.log("isRoomMbr()");
	$.getJSON("../room/isRoomMbr.do", function(result) {
		if (result.status == "success") {
//			console.log(result.data);
			setSessionItem("isRoomMbr", result.data);
			
			if (result.data === true) {
				isRoomMbrTrue();
        	} else {
        		isRoomMbrFalse();
        	}
			
		} else {
			alert("요청 처리중 오류 발생");
		}
	});
};


var addRoom = function() {  
	console.log("addRoom()");
	
	var locationSession = getSessionItem("locationSession");
    var startTime = new Date(); 
    startTime.setHours($("#setTimeBox").datebox('getTheDate').getHours()); 
    startTime.setMinutes($("#setTimeBox").datebox('getTheDate').getMinutes()); 
    if($(".selectTodayTomorrow option:selected").val() == "tomorrow") { 
        startTime.setDate(startTime.getDate() + 1); 
    } 
//	distance, fare는 추후 수정필요   
    var distance = 21600;
    var fare = 20000; 
      
	$.post("../room/addRoom.do",  {
	    roomStartTime : startTime,
	    roomDistance : distance,
        roomFare : fare,
        startLocName : locationSession.startName,
	    startLocLat : locationSession.startX,  
	    startLocLng : locationSession.startY,
	    startLocRank : 0,
        endLocName : locationSession.endName,  
        endLocLat : locationSession.endX,  
        endLocLng : locationSession.endY,
        endLocRank : 99
    }, function(result) { 
//    	console.log(result); 
        if (result.status == "success") { 
        	alert("방을 생성 완료!");
        	window.location.href = setParams("../room/room.html", { roomNo : result.data}); 
        } else { 
        	console.log(result.data); 
        } 
    }, "json");  
};  

//var checkSettedLocations = function () {
//console.log("checkSettedLocations()");
//var loginInfo = getSessionItem("loginInfo");
//var locationSession = getSessionItem("locationSession");
//
//if ( locationSession && locationSession != null &&
//		locationSession.startX && !locationSession.startX != null &&
//		locationSession.startY && !locationSession.startY != null &&
//		locationSession.endX && !locationSession.endX != null &&
//		locationSession.endY && !locationSession.endY != null &&
//		loginInfo && loginInfo != null &&
//		loginInfo.startRange && !loginInfo.startRange != null &&
//		loginInfo.endRange && !loginInfo.endRange != null ) {
//	searchRoute( 
//			parseFloat( locationSession.startX ), 
//			parseFloat( locationSession.startY ),
//			parseFloat( locationSession.startX ),
//			parseFloat( locationSession.startY ),
//			"distance_callback");
//}
//};
//var distance_callback = function (data) {
//console.log("distance_callback()");
//var directionsResult  = directionsService.parseRoute(data);
//var distance = directionsResult.result.total_distance.value;
//setSessionItem("distance", distance);
//
//searchRooms();
//};


var searchRoute = function ( startX, startY, endX, endY, callbackFunc, waypoints ) {
	console.log("searchRoute()");
	var DirectionsRequest = {
		origin 		: new olleh.maps.Coord( startX, startY ),
		destination : new olleh.maps.Coord( endX, endY ),
		waypoints 	: waypoints,
		projection 	: olleh.maps.DirectionsProjection.UTM_K,
		travelMode	: olleh.maps.DirectionsTravelMode.DRIVING,
		priority  		: olleh.maps.DirectionsDrivePriority.PRIORITY_0
	};
	directionsService.route(DirectionsRequest, callbackFunc);

};
var directionsService_callback = function (data) {
	console.log("directionsService_callback()");
	var DirectionsResult  = directionsService.parseRoute(data);
//	var distance = DirectionsResult.result.total_distance.value;
//	setSessionItem("distance", distance);
	
	directionMarkers = [];
	var routes = DirectionsResult.result.routes;
	for( var i in routes) {
		if ( routes[i].type == "999" ) {
			directionMarkers[directionMarkers.length] = setWaypointMarker( 
					new olleh.maps.Coord( routes[i].point.x, routes[i].point.y ), 
					"../images/common/marker/MapMarker_Flag3_Right_Azure.png" );   
		} 
		
		if ( routes[i].type == "1000" ) {
			directionMarkers[directionMarkers.length] = setWaypointMarker( 
					new olleh.maps.Coord( routes[i].point.x, routes[i].point.y ), 
					"../images/common/marker/MapMarker_Flag1_Right_Chartreuse.png" ); 
		}
		
		if ( routes[i].type == "1001" ) {
			directionMarkers[directionMarkers.length] = setWaypointMarker( 
					new olleh.maps.Coord( routes[i].point.x, routes[i].point.y ), 
					"../images/common/marker/MapMarker_ChequeredFlag_Right_Pink.png" ); 
		}
	}
	
	var DirectionsRendererOptions = {	
		directions : DirectionsResult,
		map : map,
		keepView : true,
		offMarkers : true,
		offPolylines : false
	};
	
	directionsRenderer = new olleh.maps.DirectionsRenderer(DirectionsRendererOptions);
	directionsRenderer.setMap(map);
};


var setWaypointMarker = function( coord, imageUrl ) {
	console.log("setWaypointMarker()");
	var icon = new olleh.maps.MarkerImage(
		imageUrl,
		new olleh.maps.Size(40, 40),
		new olleh.maps.Pixel(0,0),
		new olleh.maps.Pixel(5, 40)
	);
	var marker = new olleh.maps.Marker({ 
		position: coord,  
		map: map,  
//		shadow: shadow,
		icon: icon,			
		title : 'Current Location',
		zIndex : 1		
  	});

	return marker;
};


var joinRoom = function(roomNo) { 
	console.log("joinRoom()");
	
    isRoomMbr(function() { //isRoomMbrTrue
    	alert("이미 방에 참여 중입니다.");
    }, 
    
    function() { //isRoomMbrFalse
    	var locationSession = getSessionItem("locationSession");
    	$.post("../room/joinRoom.do", { 
					roomNo : roomNo,
					endLocName : locationSession.endName,
					endLocLat : locationSession.endY,
					endLocLng : locationSession.endX
				}, 
				function(result) { 
					console.log(result); 
					if (result.status =="success") { 
						alert("방에 참여합니다!");
						window.location.href = setParams("../room/room.html", { roomNo : roomNo}); 
					} else { 
						console.log(result.data); 
					} 
				}, "json");
    });
};


var favoriteList = function() {
    console.log("favoriteList()");
    
    $.getJSON("../member/getFavoritePlaces.do", function(result) {
        if(result.status == "success") {
            var fvrtLoc = result.data; 
            var ul = $("#favoriteUl"); 
              
            $("#favoriteUl #favoriteList").remove(); 
            for (var i in fvrtLoc) {
                $("<li>") 
                    .attr("id", "favoriteList") 
                    .attr("data-theme","f") 
                    .attr("data-icon", "false") 
                    .attr("data-end_x", fvrtLoc[i].fvrtLocLng) 
                    .attr("data-end_y", fvrtLoc[i].fvrtLocLat)
                    .attr("data-locName", fvrtLoc[i].fvrtLocName)
                    .click( function(event){
//                        console.log($(this).attr("data-end_x"), $(this).attr("data-end_y")); 
                        setEndLocation($(this).attr("data-end_x"), $(this).attr("data-end_y"), $(this).attr("data-locName"), "");
                        map.moveTo( new olleh.maps.Coord($(this).attr("data-end_x"), $(this).attr("data-end_y")) );
                        $("#divFavoriteLoc_popup").popup("close"); 
                    })
                    .append(
                    		$("<a>") 
                            	.attr("id", "favoriteLink") 
                                .attr("href","#") 
                                .append(
                                		$("<img>") 
	                                    	.attr("id", "favoriteIco") 
	                                        .attr("style", "width:35px;") 
	                                        .attr("src", "../images/common/taxi.png")  ) 
                                .append($("<div>") 
                                    .attr("id", "favoriteText") 
                                    .text(fvrtLoc[i].fvrtLocName) ) )  
                    .appendTo(ul);
                $("#favoriteUl").listview("refresh"); 
            } 
        } else { 
	        // 즐겨찾기 없을경우 + 버튼 추가     
	              
        } 
    }); 
};

			
			




			






			

			
			
var drawRelationMap = function() {
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	//가로1,2
	ctx.moveTo(0,123);
	ctx.lineTo(369,123);
	ctx.lineWidth=1;
	
	ctx.moveTo(0,246);
	ctx.lineTo(369,246);
	ctx.lineWidth=1;
	//세로1,2
	ctx.moveTo(123,0);
	ctx.lineTo(123,370);
	ctx.lineWidth=1;
	
	ctx.moveTo(246,0);
	ctx.lineTo(246,385);
	ctx.lineWidth=1;
	
	ctx.moveTo(0,123);
	ctx.lineTo(369,123);
	ctx.strokeStyle="#fde58b";
	ctx.lineWidth=1;
	
	ctx.stroke();
	
	
	ctx.beginPath();
	//내부 선
	ctx.moveTo(61,61);
	ctx.lineTo(308,61);
	ctx.lineWidth=4;
	
	ctx.moveTo(61,61);
	ctx.lineTo(61,308);
	ctx.lineWidth=4;
	
	ctx.moveTo(61,308);
	ctx.lineTo(308,308);
	ctx.lineWidth=4;
	
	ctx.moveTo(308,61);
	ctx.lineTo(308,308);
	ctx.lineWidth=4;
	
	ctx.moveTo(61,184);
	ctx.lineTo(308,184);
	
	ctx.lineWidth=4;
	
	ctx.moveTo(184,61);
	ctx.lineTo(184,308);
	ctx.strokeStyle="#B0C4DE";
	ctx.lineWidth=4;
	
	ctx.stroke();
	
	
	ctx.beginPath();
	//각 점
	ctx.arc(61,61,5,0,2*Math.PI);
	ctx.arc(61,308,5,0,2*Math.PI);
	ctx.arc(308,61,5,0,2*Math.PI);
	ctx.arc(308,308,5,0,2*Math.PI);
	ctx.arc(184,184,5,0,2*Math.PI);
	ctx.fillStyle="#bf9000";
	ctx.fill();
	
	
	ctx.beginPath();
	ctx.fillStyle="black";
	
	var img=document.getElementById("member01");
	ctx.drawImage(img,280,160);
	ctx.font="20px Arial";
	ctx.fillText("이지우",280,250);
	
	var img=document.getElementById("member02");
	ctx.drawImage(img,160,40);
	ctx.font="20px Arial";
	ctx.fillText("유지민",160,30);
	
	
	var img=document.getElementById("member03");
	ctx.drawImage(img,160,280);
	ctx.font="20px Arial";
	ctx.fillText("송미영",160,360);
	
	var img=document.getElementById("member04");
	ctx.drawImage(img,40,160);
	ctx.font="20px Arial";
	ctx.fillText("김상헌",40,250);
	
	
	ctx.font="12px Arial";
	ctx.fillText("이영균",280,330);
	
	ctx.font="12px Arial";
	ctx.fillText("안성헌",40,330);
	
	ctx.font="12px Arial";
	ctx.fillText("공경식",40,50);
};
			
			

