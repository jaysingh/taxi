console.log("settingsjs...");

var that = this;
var myInfo;

$(document).ready(function() {
	initAjaxLoading();
	
	document.addEventListener("deviceready", onDeviceReady, false);
	
//	로그인 하면 강제적으로 기본 셋팅값 설정 출발지 1000m 도착지 1000m를 변경
	$("#seach").click(function() {
		startRangeChk();
		endRangeChk();
		 $("#startRange").find("input[type='radio']").bind("change", function(){
      });
	});
	$("#rangeSave").click(function() {
		addRange();
	});
	$.getJSON( rootPath + "/settings/getRange.do", function(result){
		if(result.status == "success") {
			var setting = result.data;
			$("#startRange1").val(setting.startRange);
			$("#endRange1").val(setting.endRange);
		}else{
			Toast.shortshow("실행중 오류발생!");
			console.log(result.data);
		}
	});
	
	$("#btnLogoutAccept").click(function(){ 
		logout(); 
	}); 
	$("#btnLogoutCancel").click(function() {
		$("#popupLogout").popup("close");
	});

	$("#frndRefresh").click(function() {
		frndRefresh();
	});
	
	$("#btnLeave").click(function(){
		leaveMember(); 
	}); 
	$("#btnCancel").click(function(){ 
		console.log("close");
		$("#popupLeaveMember").popup("close");
	}); 
	$("#btnDeleteLocCancel").click(function() {
		$("#popupFvrtLoc").popup("close");
	});
	
	$("#btnChange").click(function(){
	   fvrtLocLists();
	});
	
	$("#btnDeleteLoc").click(function() {
		deleteFvrtLoc();
	});
	
	$("#btnList").click(function(){
		listFvrtLoc();
	});
	$("#btnFvrtLocUpdate").click(function(){
    	fvrtLocUpdate();
	});
	$("#save").click(function(){
		rankUpdate();
	});
	
	/*$(document).bind('pageinit', function() {
	    $( "#sortable" ).sortable();
	    $( "#sortable" ).disableSelection();
	    $( "#sortable" ).bind( "sortstop", function(event, ui) {
	    $( "#sortable").listview('refresh');
	    });
	  });*/
	
	$(".content").hide();
	$("#btnList").show();
	$("#btnList").click(function () {
	$(".content").toggle("slide");
	});
	
	$(".contents").hide();
	$("#btnChange").show();
	$("#btnChange").click(function () {
	$(".contents").toggle("slide");
	});
	$.mobile.loadPage( "settings.html", { showLoadMsg: false } );
	
	if ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined')) 
		Toast.shortshow('Cordova variable does not exist. Check that you have included cordova.js correctly');
    if (typeof CDV == 'undefined') 
    	Toast.shortshow('CDV variable does not exist. Check that you have included cdv-plugin-fb-connect.js correctly');
    if (typeof FB == 'undefined') 
    	Toast.shortshow('FB variable does not exist. Check that you have included the Facebook JS SDK file.');
    
    FB.Event.subscribe('auth.login', function(response) {
                       });
    
    FB.Event.subscribe('auth.logout', function(response) {
							changeHref("../auth/auth.html");
                       	});
    
    FB.Event.subscribe('auth.sessionChange', function(response) {
                       		getLoginStatus();
                       });
    
    FB.Event.subscribe('auth.statusChange', function(response) {
    						getLoginStatus();
    					});
});//ready()

/*친구목록갱신 버튼*/
$( document ).on( "click", ".show-page-loading-msg", function() {
    var $this = $( this ),
        theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
        msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
        textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
        textonly = !!$this.jqmData( "textonly" );
        html = $this.jqmData( "html" ) || "";
    $.mobile.loading( "show", {
            text: msgText,
            textVisible: textVisible,
            theme: theme,
            textonly: textonly,
            html: html
    });
})
.on( "click", ".hide-page-loading-msg", function() {
    $.mobile.loading( "hide" );
});

/**
 * deviceready 이벤트
 */
function onDeviceReady() {
	console.log("onDeviceReady()");
	
	push.initialise();
	
	document.addEventListener("backbutton", touchBackBtnCallbackFunc, false);

	try {
	    FB.init({ appId: "536450846448669", nativeInterface: CDV.FB, useCachedDialogs: false });
	    
	    getLoginStatus();
	    
    } catch (e) {
    	Toast.shortshow(e);
    }
}

/**
 * Facebook 로그인 상태 가져오기
 */
var getLoginStatus = function() {
	console.log("getLoginStatus()");

	FB.getLoginStatus(function(response) {
		if (response.status == 'connected') {
        	
		} else {
			changeHref("../auth/auth.html");
		}
    });
};

/**
 * Facebook 로그인
 */
var facebookLogin = function() {
	console.log("facebookLogin()");
	
    FB.login(
             function(response) {
            	 console.log(response.session);
	             if (response.session) {
	            	 console.log('logged in');
	            	 
	             } else {
	            	 console.log('not logged in');
	            	 
	             }
             }, 
             { scope: "email" }
             );
};

/**
 * Facebook 로그아웃
 */
var facebookLogout = function() {
	console.log("facebookLogout()");
    FB.logout(function(response) {
		    	changeHref("../auth/auth.html");
		    });
};

/**
 * Facebook 회원 정보 가져오기
 */
var getFacebookMyInfo = function( callback, args ) {
	console.log("getFacebookMyInfo(callback, args)");
//	console.log(callback, args);
	
	FB.api(
			'me', 
			{
				fields: 'id,name,gender,picture.height(100).width(100),'
					+'friends.fields(id,name,gender,picture.height(100).width(100))' 
			},  
			function(user) {
               if (user.error) {
            	   Toast.shortshow(JSON.stringify(user.error));
            	   
               } else {
				   var myInfo = null;
				   myInfo = {
		        			mbrId: 			user.id,
		        			mbrName: 		user.name,
		        			mbrGender:		user.gender,
		        			mbrPhotoUrl: 	user.picture.data.url,
		        			friendList:		[]
		        	};
				
		            if ( user.friends && user.friends.data ) {
		            	myInfo.friendList = [user.friends.data.length];
		            	for ( var i = 0; i < user.friends.data.length; i++ ) {
		            		myInfo.friendList[i] = {
		                			frndId: 		user.friends.data[i].id,
		                			mbrId:			myInfo.mbrId,
		                			frndName: 		user.friends.data[i].name,
		                			frndGender:		user.friends.data[i].gender,
		                			frndPhotoUrl: 	user.friends.data[i].picture.data.url
		                	};
		            	}
		            }
		            
		            if (args) {
		            	callback(myInfo, args);
		            } else {
		            	callback(myInfo);
		            }
               }
               
			});  
	
};


function startRangeChk() {
	
	$.getJSON(rootPath + "/settings/getRange.do", function(result){
		if(result.status == "success") {
		var setting = result.data;
			if(setting.startRange == "500"){
				$("#radio-choice-h-2a").prop("checked", true).checkboxradio("refresh");
			}else if(setting.startRange =="1000"){
				$("#radio-choice-h-2b").prop("checked", true).checkboxradio("refresh");
			}else if(setting.startRange =="2000"){
				$("#radio-choice-h-2c").prop("checked", true).checkboxradio("refresh");
			}else if(setting.startRange =="3000"){
				$("#radio-choice-h-2d").prop("checked", true).checkboxradio("refresh"); 
			}
		/*$("#startRange1").val(setting.startRange);
		$("#endRange1").val(setting.endRange);*/
		}else{
			Toast.shortshow("실행중 오류발생!");
			console.log(result.data);
		}
	});
 }

function endRangeChk() {
	
	$.getJSON(rootPath + "/settings/getRange.do", function(result){
		if(result.status == "success") {
		var setting = result.data;
			if(setting.endRange == "500"){
				$("#radio-choice-h-3a").prop("checked", true).checkboxradio("refresh");
			}else if(setting.endRange =="1000"){
				$("#radio-choice-h-3b").prop("checked", true).checkboxradio("refresh");
			}else if(setting.endRange =="2000"){
				$("#radio-choice-h-3c").prop("checked", true).checkboxradio("refresh");
			}else if(setting.endRange =="3000"){
				$("#radio-choice-h-3d").prop("checked", true).checkboxradio("refresh"); 
			}
		/*$("#startRange1").val(setting.startRange);
		$("#endRange1").val(setting.endRange);*/
		}else{
			Toast.shortshow("실행중 오류발생!");
			console.log(result.data);
		}
	});
 }

//로그아웃
function logout() { 
	console.log("logout()");
//	event.preventDefault();
	$.getJSON(rootPath + "/settings/logout.do", function(result) { 
		if(result.status == "success") {
			Toast.shortshow("로그아웃이 성공적으로 되었습니다.");
			facebookLogout();
		} 
	}); 
};
function frndRefresh() {
	console.log("frndRefresh()");
	getFacebookMyInfo(function(myInfo) {
		console.log(myInfo);
		$.ajax(rootPath + "/member/frndRefresh.do", {
    		type: "POST",
    		data: JSON.stringify( myInfo ),
    		dataType: "json",
    		contentType: "application/json",
    		success: function(result) {
    			if(result.status == "success") {
    				Toast.shortshow("친구목록이 갱신 되었습니다.");
    				location.href = "../settings/settings.html";
    				/*$( "#stop" ).listview('refresh');*/
    			} else {
    				Toast.shortshow("친구목록 갱신 실패");
    			}
    		}
    	});
	});
};	

//회원탈퇴
function leaveMember() { 
	$.getJSON(rootPath + "/auth/loginInfo.do", function(result) { 
		if(result.status == "success") { 
			var loginInfo=result.data; 
			$.post(rootPath + "/member/leaveMember.do",  
					{mbrId: loginInfo.mbrId}, 
					function(result) { 
						if(result.status == "success") { 
							Toast.shortshow("탈퇴가 성공적으로 되었습니다.");
							facebookLogout();
						} else { 
							Toast.shortshow("실행중 오류발생!"); 
							console.log(loginInfo); 
						} 
					}, 
			"json"); 
		} else { 
			console.log(result.data); 
		} 
	}); 
}

function deleteFvrtLoc() {
	console.log("!!!@");
	
	$.getJSON(rootPath + "/member/deleteFavoritePlace.do?fvrtLocNo=" + $("#fvrtLocNo").attr("fvrtlocno"), function(result) {
		if(result.status == "success") {
			console.log(result.data);
			console.log(result);
			$("#popupFvrtLoc").popup("close");
			fvrtLocLists();
		} else {
			Toast.shortshow("실행중 오류발생!");
			console.log(result.data);
		}
	});
}
/*반경설정 변경*/
function addRange(){
	
	$.post(rootPath + "/settings/updateRange.do", 
			{
		startRange: $('input[name=radio-choice-h-2]:checked', '#updateRange').val(),
		endRange: $('input[name=radio-choice-h-2]:checked', '#updateRange1').val(),
		
			},
			function(result) {
				if(result.status == "success") {
					Toast.shortshow("반경설정이 변경되었습니다.");
					location.href = "../settings/settings.html";
				} else {
					Toast.shortshow("실행중 오류발생!");
					console.log(result.data);
				}
			},
	"json");
	$.getJSON(rootPath + "/settings/getRange.do", function(result){
		if(result.status == "success") {
		var setting = result.data;
		$("#startRange1").val(setting.startRange);
		$("#endRange1").val(setting.endRange);
		}else{
			Toast.shortshow("실행중 오류발생!");
			console.log(result.data);
		}
	});
}
function selected(obj) {
	// HTML로 부터 변경된 값 가져오는 함수
}
/* 라디오버튼 벨류값 가져오기 */
function getRadioValue(radioObj){
	 if(radioObj != null){
	  for(var i=0; i<radioObj.length; i++){
	   if(radioObj[i].checked){
	    return radioObj[i].value;
//	    alert(radioObj[radioObj.checkedIndex].value);
	   }
	  }
	 }
	 return null;
	}
/*즐겨찾기 우선순위 변경*/
$(document).bind('pageinit', function() {
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
    $( "#sortable" ).bind( "sortstop", function(event, ui) {
    /*$('#sortable').listview('refresh');*/
    });
  });
/*웹에서는 아래것을 사용해야 drag and drop이 가능*/
/*$(function() {
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
    $( "#sortable" ).listview('refresh');
  });*/
function fvrtLocLists(){
	$.getJSON(rootPath + "/member/getFavoritePlaces.do", function(result) {
		if(result.status == "success") {
			var FvrtLoc = result.data;
			var ol = $("#sortable");
			$("#sortable li").remove();
			$('#fvrtLocNo').find('span').show();
			for(var i=0; i<FvrtLoc.length; i++){
				
				     $("<li>")
				     	.attr("id","fvrtLocNo")
				     	.attr("fvrtLocNo", FvrtLoc[i].fvrtLocNo)
				     	.attr("data-rank", FvrtLoc[i].fvrtLocRank)
				     	.append($("<a>")
				     					/*.css("text-decoration","none")*/
								     	.attr("data-icon", "delete")
								     	.attr("data-rel","popup")
										.attr("href","#popupFvrtLoc")
								     	.append($("<div>")		
								     	.text(FvrtLoc[i].fvrtLocName))
				     	)
				        .appendTo(ol);
			}
		}else { 
			Toast.shortshow("실행중 오류발생!"); 
			console.log(getFavoritePlaces); 
		}
		
	},"json");
};

/*즐겨찾기 우선순위 변경 저장클릭시 이동*/
function fvrtLocUpdate(){
	var fvrtArr = [];
	for(var index = 0; index < $("#sortable>li").size(); index++ ) {
		fvrtArr[index] = {
				fvrtLocNo : $($("#sortable>li").get(index)).attr("fvrtLocNo"),
				fvrtLocName : $($("#sortable>li").get(index)).text(),
				fvrtLocRank : index + 1
		};
	};
	console.log(fvrtArr);
	rankUpdate(fvrtArr);
};
function rankUpdate() {
	var fvrtArr = [];
	for(var index = 0; index < $("#sortable>li").size(); index++ ) {
		fvrtArr[index] = {
				fvrtLocNo : $($("#sortable>li").get(index)).attr("fvrtLocNo"),
				fvrtLocName : $($("#sortable>li").get(index)).text(),
				fvrtLocRank : index + 1
		};
	};
	
	$.ajax( rootPath + "/member/changeFavoritePlaces.do", {
		type: "POST",
		data: JSON.stringify( { "fvrtArr" : fvrtArr} ) ,
		dataType: "json",
		contentType: "application/json",
		success: function(result) {
			console.log(fvrtArr);
			if(result.status == "success") {
    			console.log(result.data);
    			fvrtLocLists();
    			Toast.shortshow("우선순위가 변경되었습니다.")
    			/*$("#sortable").listview('refresh');*/
            	location.href = "../settings/settings.html";
			} else {
				Toast.shortshow("실행중 오류발생!");
			}
		},
	});
};

/**
 * 뒤로가기 버튼 처리
 */
var touchBackBtnCallbackFunc = function() {
	console.log("touchBackBtnCallbackFunc()");
	
	var pageId = $.mobile.activePage.attr('id');
	if ( pageId && ( pageId == 'pageFvrtSetting' || pageId == 'pageRangeSetting' )) {
		changeHref("../settings/settings.html");
	} else {
		changeHref("../home/home.html");
	}
};
