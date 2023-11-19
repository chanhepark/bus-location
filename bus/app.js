var request = require('request');
var convert = require('xml-js');
var fs = require('fs');
var template = require('./module/template.js'); // html 중복되는 부분 리팩토링
var module_id = require('./module/busID.js'); // 노선명을 파라미터로 보낼 시 노선 id 반환
var module_key = require('./module/AuthenticationKey.js'); // 공공데이터포털 인증키
const serviceKey = module_key.phOQePK35DWPiUWWdG4wnA7cTIt9A4660QodIMOnZo3KTq7uV4TFLtwUHtExVardBLhYewPBnksso2jCdGk1%2Fg%3D%3D; // 공공데이터 API 인증키

var express = require('express');
var app = express();

// express에서 body라는 요소를 사용할 수 있도록 만들어줌
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))

 


// 이미지 페이지 라우팅
app.get('/img', function(req, res){
    fs.readFile('./img/image1.JPG', function (error, data){
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(data);
    })
})

// 페이지들
app.get('/', function(req, res) {
    var html = template.html(`
    <footer>
        <h3> 버스 : UNIBUS</h3>
        <p>copyright by Cocoon</p>
    </footer>`);
    res.send(html);
});
app.get('/index.html', function(req, res) {
    var html = template.html(`
    <footer>
        <h3> 버스 : UNIBUS</h3>
        <p>copyright by Cocoon</p>
    </footer>`);
    res.send(html);
});
app.get('/1.html', function(req, res) {
    var html = template.html(`
    <section>
        <h2>버스노선 검색</h2>
        <form method="get" action="searchRoute">
            <input type="text" name='busNum' placeholder="버스 번호를 입력하세요.">
            <input type="submit" value="검색">
        </form>
    </section>`);
    res.send(html);
});
app.get('/2.html', function(req, res) {
    var html = template.html(`
    <section>
        <h2>정류소 버스도착예정정보</h2>
        <form method="get" action="searchArrival">
            <input type="text" name='station' placeholder="버스 번호를 입력하세요.">
            <input type="submit" value="검색">
        </form>
    </section>`);
    res.send(html);
});
app.get('/3.html', function(req, res) {
    var html = template.html(`
    <section>
        <h2>실시간 버스위치</h2>
        <form method="get" action="searchPos">
            <input type="text" name='busNum' placeholder="버스 번호를 입력하세요.">
            <input type="submit" value="검색">
        </form>
    </section>`);
    res.send(html);
});

// 버스노선 검색
app.get('/searchRoute', function(req, res) {
    var busNum = req.query.busNum;
    var busId = module_id.findBusID(busNum) // '721번 버스' => '100100112'
    
    if(busId == -1){ // 해당 버스가 존재하지 않을 때
        res.redirect('/1.html');
    }
    else{
        var APIurl = 'http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute';
    
        var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + serviceKey;
        queryParams += '&' + encodeURIComponent('busRouteId') + '=' + encodeURIComponent(busId);

        request({
            url: APIurl + queryParams,
            method: 'GET'
        }, function (error, response, body) {
            var xmlToJson = convert.xml2json(body, { compact: true, spaces: 4 });
            var jsonObj = JSON.parse(xmlToJson);
            var item = jsonObj.ServiceResult.msgBody.itemList;

            var stationList = "";
            for(var i = 0; i < item.length; i++){
                stationList += item[i].stationNm._text + `<br>`;
            }
            res.send(stationList)
        });
    }
});

// 정류소 버스도착예정정보
app.get('/searchArrival', function(req, res) {
    var station = req.query.station;
    res.send(`정류소명은 ${station}`);
});
// 실시간 버스위치
app.get('/searchPos', function(req, res) {
    var busNum = req.query.busNum;
    res.send(`버스명은 ${busNum}`);
});


