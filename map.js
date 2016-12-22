var map;
var infowindow;
var places = [];
var markers = [];
var NYC = {
    lat: 40.765001,
    lng: -73.978514
};

function viewModel() {
    var self = this;
    self.places = ko.observableArray();
    self.query = ko.observable('');
    self.search = function(value) {
        self.places.removeAll();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        for (var x in places) {
            if (places[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.places.push(places[x]);
                for (var index in markers) {
                    if (places[x].name == markers[index].title) {
                        markers[index].setMap(map)
                    }
                }
            }
        }




    };
    self.initMap = function(value) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: NYC,
            zoom: 15
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: NYC,
            radius: 1000,
            type: ['movie_theater']
        }, callback);

        google.maps.event.addDomListener(window, "resize", function() {
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        });


        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    places.push(results[i]);
                    markers.push(createMarker(results[i]));
                }
                ko.utils.arrayPushAll(self.places, places);
            } else {
                alert("Sorry, It seemes we have issue loading Google Map Place API :(");
            }
        }
    }

    self.selectPlace = function(place) {
        for (index in markers) {
            if (markers[index].title === place.name) {
                google.maps.event.trigger(markers[index], 'click');
            }
        }

    }

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            title: place.name
        });

        marker.addListener('click', function() {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.DROP);
            }
        });

        google.maps.event.addListener(marker, 'click', function() {
            //   infowindow.setContent(place.name);
            infowindow.open(map, this);
            getCoffeeShop(infowindow, place);
        });


        return marker;
    }

    function getCoffeeShop(infowindow, place) {
        var LOCATION = place.geometry.location.lat() + "," + place.geometry.location.lng()
        var BASE_URL = "https://api.foursquare.com/v2/venues/explore?"

        var searchUrl = BASE_URL + "ll=" + LOCATION + "&section=coffee&v=20161212&m=foursquare&client_id=YDXHYMQRFSNB43EDZ3WMZU4WKOWCTGJMMJQEHHE4I2HLBHLZ&client_secret=SJTXTRDBBQBQZDKZ2HSB51S5TRPI2U35EAWBIXJCJURS1OOE";
        infowindow.setContent(null);
        $.getJSON(searchUrl, function(data) {
            var venueData = data.response.groups[0].items[0].venue;
            console.log(venueData);

            infowindow.setContent("<div> <h2>Near By Coffee Shop</h2> <div>Name:<span>" + venueData.name + "</span></div> <div>Rating:<span>" + venueData.rating + "</span></div> <div>Location:<span>" + venueData.location.address + ',' + venueData.location.city + "</span></div> </div>");
        }).fail(function() {
            infowindow.setContent("<div> <h3>Sorry, We are having issue with the API provider</h3> </div>");
            alert("Error: Sorry, We are having issue with the API provider ");
        })
    }

};


function initApp() {

    $(document).ready(function() {
        console.log('test');
        var vm = new viewModel();
        ko.applyBindings(vm);
        vm.initMap();
        vm.query.subscribe(vm.search);
    });
}

function mapError() {
    alert("Sorry, It seemes we have issue loading Google Map :(")
}
