
angular.module("myApp", ["firebase", "geolocation", "ui.bootstrap.modal"])
.controller("myAppCtrl", ["$scope", "$http", "$firebase", "geolocation",
	function($scope, $http, $firebase, geolocation) {
		$scope.Spin = false;
		var lat = '', lon = '';
		// Initialize map and centered
		function initMap() {

			navigator.geolocation.getCurrentPosition(function(pos) {

	        	// current location coordinates
	        	var currentCoordinates = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);	        
	        	
	        	// map options object
		        var mapOptions = {
		          center: currentCoordinates,
		          zoom: 16,
		          mapTypeId: google.maps.MapTypeId.ROADMAP
		        };

		        // request object for nearby restaurants
		        var request = {
					location: currentCoordinates,
				    radius: '100',
				    types: ['restaurant']
				};
		        
		        // local map object
		        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

		        // center map with current location
		        lat = pos.coords.latitude;
		        lon = pos.coords.longitude;
		        console.log('current location:  '+ lat + '______' + lon);
		        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		        
	        }, function(error) {
	          	console.log('Unable to get location: ' + error.message);
	        });
			$scope.Spin = true;
	    }


		//$scope.loc = {lat: 23, lon: 79};
		$scope.gotoCurrentLocation = function() {
			if("geolocation" in navigator){
				navigator.geolocation.getCurrentPosition(function (position){
					var c = position.coords;
					lat = c.latitude;
					lon = c.longitude;
					console.log('lat::  '+lat+'   lon::  '+lon);
					$scope.map.setCenter(new google.maps.LatLng(c.latitude, c.longitude));
					$scope.gotoLocation(c.latitude, c.longitude);
					console.log('in call back');
				});
				return true;
			}
			return false;
		};
		
		$scope.gotoLocation = function(lat, lon){
			if($scope.lat != lat || $scope.lon != lon){
				$scope.loc = {lat: lat, lon: lon};
				if(!$scope.$$phase) $scope.$apply("loc");
			}
		};
		$scope.search = "";
		$scope.geoCode = function() {
			if($scope.search && $scope.search.length > 0){
				if(!this.geocoder) this.geocoder = new google.maps.Geocoder();
				this.geocoder.geocode({'address': $scope.search}, function (results, status){
					if(status == google.maps.GeocoderStatus.OK){
						var loc = results[0].geometry.location;
						$scope.search = results[0].formatted_address;
						console.log(' location:  '+ $scope.search + '>>>'+ loc.lat() + '______' + loc.lng());
						lat = loc.lat();
						lon = loc.lng();
						console.log('lat::  '+lat+'   lon::  '+lon);
						$scope.map.setCenter(new google.maps.LatLng(loc.lat(), loc.lng()));
						$scope.gotoLocation(loc.lat(), loc.lng());
					}
					else{
						alert("sorry, this search produced no results");
					}
				});
			}
		};

		$scope.findTruck = function() {
				$http.get('https://data.sfgov.org/resource/bbb8-hzi6.json').then(function(response){
				$scope.jsonDta = response.data;
				var data = $scope.jsonDta;
				$scope.restaurants = [];
				$scope.open = [];
				var flag = false;
				var curTime = getCurDateTime();
				console.log('curTime before par:::  '+curTime);
				curTime = Date.parse(curTime);
				console.log('curTime after par:::  '+curTime);
				for (var i = 0; i < $scope.jsonDta.length; i++) {
					dataLat = data[i].location_2.coordinates[1];
					dataLon = data[i].location_2.coordinates[0];
					$scope.restaurants.push(data[i]);
					startTime = data[i].starttime;
					endTime = data[i].endtime;
					startTime = getDate() + startTime.replace(/.{2}$/, ':00 $&');
					endTime = getDate() + endTime.replace(/.{2}$/, ':00 $&');
					console.log('startTime:  '+startTime+'endTime:  '+endTime);
					startTime = Date.parse(startTime);
					endTime = Date.parse(endTime);
					
					lat = lat + "";
					lon = lon + "";
					lat = lat.substring(0, 9);
					lon = lon.substring(0, 11);
					lat = Number(lat);
					lon = Number(lon);
					lat = 37.79089;
					lon = -122.399494; 
					//console.log('dataLat :: '+dataLat+'  dataLon:: '+dataLon +'   lat::  '+lat+'  lon::'+lon);
					console.log(' :: '+ lat + ': '+'lon');
					if(dataLat == lat && dataLon == lon){
						console.log('match found');
						//console.log('curTime::  '+curTime+'   startTime::  '+startTime+'  endTime::  '+endTime);
						if(curTime > startTime && endTime > curTime ){
							flag = true;
							$scope.open.push(data[i]);
						}
					}
					//console.log('latitude'+data[i].latitude +'' +data[i].longitude);
				}
				if(flag){
					$scope.showModal = true;
				}
				else{
					console.log('No restaurants available');
					$scope.showModal = true;	
				}
				console.log('looking at :: '+ lat + ': '+'lon');
			});
		}

		$scope.open = function() {
		  $scope.showModal = true;
		};

		$scope.ok = function() {
		  $scope.showModal = false;
		};


		function getCurDateTime () {
			var date = new Date();
			var day = date.getDate();
			day = day < 10 ? "0" + day : day;
			var month = date.getMonth();
			month = month < 10 ? "0" + month : month;
	        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
	        //hours = hours < 10 ? "0" + hours : hours;
	        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	        //time = hours + ":" + minutes + ":" + seconds + " " + am_pm;
	        return time = date.getFullYear()+"/"+month+"/"+day  + " " + hours + ":00 " + am_pm;
		}

		function getDate () {
			var date = new Date();
			var day = date.getDate();
			day = day < 10 ? "0" + day : day;
			var month = date.getMonth();
			month = month < 10 ? "0" + month : month;

			return date.getFullYear()+"/"+month+"/"+day + " ";
		}

	    google.maps.event.addDomListener(window, 'load', initMap);	  	

	}]
);
