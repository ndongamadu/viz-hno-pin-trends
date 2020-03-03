$(document).ready(function(){
    let hnosLink = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMmlKxX6PV391tanxo6aKltrtYcF4VTbXtsRtn66Fr4CY_VEjbEpJ9AlZzyIVapdKaOKZwTjyUL8IZ/pub?gid=0&single=true&output=csv';
    let world = 'data/coordinates.csv';
    let hnoData, hnoCountries, yearArr = '';

    function getLatLon(d){
        return [d.latitude, d.longitude]

    }

    var pinNumber = function formatPiN (d) {
        return d3.format(',.0f')(d);
         
    }

    function popUp (d) {
        let popup = '';
        popup += '<h3>'+pinNumber(d.pin)+' PiN</h3>';
        popup += '<h4><a href="'+d.dataset+'" target="blank">'+d.name+" "+d.year+' HNO dataset</a></h4>';

        return popup;
    }

    function createDropdown (arr) {
        //sort arr
        var drpdwn = '<label>Year </label><select class="dropdown" id="year">';
        for (var i = 0; i < arr.length; i++) {
             i==0 ? drpdwn += '<option value="'+i+'" selected >'+arr[i]+'</option>':
             drpdwn += '<option value="'+i+'">'+arr[i]+'</option>';
         } 
        drpdwn += '</select>';
        $('.yearSelections').append(drpdwn);
    }

    function createMarker (d) {
        return L.marker([d.latitude, d.longitude], {
            icon: L.divIcon({
                className: 'circle',
                iconSize: null//[15,15]
            })
        }) 
    }

    function createMap (hno) {

        var map = L.map('map',
        {
            maxZoom: 20,
            // minZoom: 2
        });

        map.setView([9.58, 10.37], 3); 

        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hZG91MTciLCJhIjoib3NhRnROQSJ9.lW0PVXVIS-j8dGaULTyupg', {
            attribution: '<a href="http://mapbox.com">Mapbox</a>'
        }).addTo(map); 

        for (var i = 0; i < hno.length; i++) {
            createMarker(hno[i]).addTo(map).bindPopup(popUp(hno[i]));
        }



    } // createMap()

    function getData () {
        Promise.all([
            d3.csv(hnosLink),
            d3.csv(world)
        ]).then(function(data){
            hnoData = [];
            yearArr = [];
            data[0].forEach(function(d, i){
                var lat, lon;
                for (k in data[1]){
                    if(data[1][k]['ISO3']==d['Country ISO3']){
                        lat = data[1][k]['Latitude'];
                        lon = data[1][k]['Longitude'];
                    }

                }
                var obj = {
                    year: d['Year'],
                    country_code: d['Country ISO3'],
                    name: d['Country'],
                    pin: d.PiN,
                    dataset: d['HNO dataset'],
                    latitude: lat,
                    longitude: lon
                }
                hnoData.push(obj);
                yearArr.includes(obj.year) ? '': yearArr.push(obj.year);
            });
            createDropdown(yearArr);
            createMap(hnoData);
            

        });
    }

    getData();

});

