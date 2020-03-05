$(document).ready(function(){
    let hnosLink = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMmlKxX6PV391tanxo6aKltrtYcF4VTbXtsRtn66Fr4CY_VEjbEpJ9AlZzyIVapdKaOKZwTjyUL8IZ/pub?gid=0&single=true&output=csv';
    let world = 'data/coordinates.csv';
    let pinLink = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5Bnwu1obzVdL9CuwpZ5CjuirjbNuXHPCwhkdF1xDvg26U9bT7yDPNmCHqdiGbRA/pub?gid=631670798&single=true&output=csv';
    let hnoData, pinData, yearArr = '';
    let fundingReqChart, pinChart, fundingChart;

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

    function drawC3Chart (arg) {
        data =  getPinAndFunding(arg);
        console.log(data.funding[0])
        fundingReqChart = c3.generate({
            bindto: '#requirement',
            size: {height : 300},
            data: {
                x: 'x',
                columns: [data.funding[0],data.funding[1],data.req[1]],
                type: 'bar'
            },
            axis: {
                x: {
                    type: 'category',
                    tick:{
                        centered: true,
                        outer: false,
                    }
                },
                y: {
                    tick: {
                        count: 6,
                        format: d3.format('.2s')
                    }
                }
            }
        });

        fundingChart = c3.generate({
            bindto: '#funding',
            size: {height: 150},
            data: {
                x: 'x',
                columns: [data.funding[0], data.funding[1]],
                type: 'bar'
            },
            axis: {
                x: {
                    type: 'category',
                    tick:{
                        centered: true,
                        outer: false,
                    }
                },
                y: {
                    tick: {
                        count: 6,
                        format: d3.format('.2s')
                    }
                }
            }
        });

        pinChart = c3.generate({
            bindto: '#pin',
            size: {height: 150},
            data: {
                x: 'x',
                columns: [data.pin[0], data.pin[1]],
                type: 'bar'
            },
            axis: {
                x: {
                    type: 'category',
                    tick:{
                        centered: true,
                        outer: false,
                    }
                },
                y: {
                    tick: {
                        count: 6,
                        format: d3.format('.2s')
                    }
                }
            }
        });
    }

    function getPinAndFunding (data, country) {
        if (country !=undefined) {
            data = data.filter(function(d){
                return d['Crisis Country']==country;
            });
        }

        var dataByMetric = d3.nest()
        .key(function(d){ return d['Metric']; })
        .key(function(d){ return d['Year']; })
        .rollup(function(v){ return d3.sum(v, function(d){ return d['Value']; }); })
        .entries(data) ;

        var xFunding = ['x'],
            xPin     = ['x'],
            xReq     = ['x'],
            funding  = ['Funding recieved'],
            pin      = ['People in need'],
            req      = ['Funding requirements'];
        for (k in dataByMetric){
            if(dataByMetric[k].key=='Funding recieved'){
                dataByMetric[k].values.forEach( function(element, index) {
                    xFunding.push(element.key)
                    funding.push(element.value)
                });
            } else if (dataByMetric[k].key=='Funding requirements') {
                dataByMetric[k].values.forEach( function(element, index) {
                    xReq.push(element.key)
                    req.push(element.value)
                });
            } else if (dataByMetric[k].key=='People in need') {
                dataByMetric[k].values.forEach( function(element, index) {
                    xPin.push(element.key)
                    pin.push(element.value)
                });                
            }
        }
        return {
            pin: [xPin, pin],
            req: [xReq, req],
            funding: [xFunding, funding]
        }


    } //generatePinAndFunding

    function getData () {
        Promise.all([
            d3.csv(hnosLink),
            d3.csv(world),
            d3.csv(pinLink)
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

            pinData = data[2]
            drawC3Chart(pinData)
            createMap(hnoData);
            

        });
    }

    getData();

});

