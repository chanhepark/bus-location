@Component("busStopParser")
public class BusStopParser {
    public final static String KEY = "phOQePK35DWPiUWWdG4wnA7cTIt9A4660QodIMOnZo3KTq7uV4TFLtwUHtExVardBLhYewPBnksso2jCdGk1%2Fg%3D%3D";
     
    public List<Map<String,Object>> apiParserNodeRealTime(Map<String,Object> map) throws Exception {
     String apiUrl = "http://openapi.tago.go.kr/openapi/service/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList";
        URL url = new URL(apiUrl+"?ServiceKey="+KEY+"&nodeId="+map.get("NODEID")+"&cityCode=37030");
  
        XmlPullParserFactory factory = XmlPullParserFactory.newInstance();
        factory.setNamespaceAware(true);
        XmlPullParser xpp = factory.newPullParser();
        BufferedInputStream bis = new BufferedInputStream(url.openStream());
        xpp.setInput(bis, "utf-8");
         
        String tag = null;
        int event_type = xpp.getEventType();
         
        List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
        Map<String,Object> tempMap = null;
        while (event_type != XmlPullParser.END_DOCUMENT) {
            if (event_type == XmlPullParser.START_TAG) {
                tag = xpp.getName();
                if(tag.equals("item")) {
                 tempMap=new HashMap<String,Object>();
                }
            } else if (event_type == XmlPullParser.TEXT) {
                if(tag.equals("nodeid")){
                    tempMap.put("NODEID", xpp.getText());
                }
                else if(tag.equals("routeid")){
                 tempMap.put("ROUTEID", xpp.getText());
                }
                else if(tag.equals("routeno")) {
                 tempMap.put("ROUTENO", xpp.getText());
                }
                else if(tag.equals("vehicletp")) {
                 tempMap.put("VEHICLETP", xpp.getText());
                }
                else if(tag.equals("arrprevstationcnt")) {
                 tempMap.put("ARRPREV", xpp.getText());
                }
                else if(tag.equals("arrtime")) {
                 tempMap.put("ARRTIME", xpp.getText());
                }
            } else if (event_type == XmlPullParser.END_TAG) {
                tag = xpp.getName();
                if (tag.equals("item")) {
                    list.add(tempMap);
                }
            }
  
            event_type = xpp.next();
        }
        bis.close();
        return list;
    }
}
@RequestMapping(value="/nodeRealTime.do")
public @ResponseBody ModelAndView nodeRealTime(@RequestBody Map<String,Object> map) throws Exception{
 map.put("list", busStopParser.apiParserNodeRealTime(map));
  
 return new ModelAndView("jsonView", map);
}
function fn_clickNode(obj){
    setMarkers(null);
    //if(customOverlay!=null){
    // customOverlay.setMap(null);
    //}
     
    if($("a[name^='node']").hasClass("selected")){
     $("a[name^='node']").removeClass("selected");
     fn_clickSearchButton();
      
    }else{
     $("a[name^='node']").addClass("selected");
      
     fn_nodeRealTime(obj);
    }
   }
  
   function fn_nodeRealTime(obj){
    //버스 노선 페이지에서 검색된 경로의 정류장의 정보보기의 기능 활성화의 경우를 위한 변수들 초기화
    if($("#nodeidVal").val()!=null&&!($("#nodeidVal").hasClass("used"))){
     var str = "<a href='#this' nodeid='"+$("#nodeidVal").val()+"' lat='"+$("#latVal").val()+"' lng='"+$("#lngVal").val()+"' name='node1' id='node1' class='result sc_node_result'>"+$("#nodenameVal").val()+"</a>";
     $("#resultBox").append(str);
     obj=$("#node1");    $(obj).addClass("selected");
     $("#nodeidVal").addClass("used");
    }
    //지도 중심을 변경합니다.
    map.setCenter(new daum.maps.LatLng(obj.attr("lat"),obj.attr("lng")));
    //선택한 정류장의 오버레이를 활성화합니다.
    //fn_setOverlay(obj);
    var divStr="<div id='routeBox' class='result'><div id='pageDiv'></div></div>";
    obj.siblings().remove(); 
    obj.parent().append(divStr);
    //선택한 정류장의 위치에 마커를 표시한다.
    fn_nodeMarkerMaker(obj);   /*
    이 부분에서 정류장 ID를 서버로 보내주고 서버에서는 OPEN API를 통해 정류장 실시간 도착 노선 정보를 가져와 ajax로 리턴해준다.
    보내는 데이터 : nodeID
    받는 데이터 : 정류장 실시간 도착 정보 
    */
    $.ajax({
     dataType:"json",
     type:"POST",
     contentType:"application/json",
     url:"/gcbus/nodeRealTime.do",
     data:JSON.stringify({NODEID:obj.attr("nodeid")}),
     success:function(result){
       for(var i=0;i<result["list"].length;i++){
        var map=result["list"][i];
        var arrtime= Math.floor(map["ARRTIME"]/60);
        var str = "<a href='#this' routeno='"+map["ROUTENO"]+"' routeid='"+map["ROUTEID"]+"' name='route"+i+"' id='route"+i+"' class='result sc_real_route_result'>"+map["ROUTENO"]
        +"("+map["VEHICLETP"]+")<p>"+map["ARRPREV"]+"정류장 전("+arrtime+"분)</p></a>";       $("#routeBox").append(str);
       }      $("#routeBox").css("height", 52*result["list"].length);
       $("#routeBox").append("<a href='#this' id='busList_Btn' class='btn' >모든 버스 노선 보기</a>");
       $("a[name^=route]").on("click",function(e){
        e.preventDefault();
        //fn_routeInfo($(this));
       });      
        
       $("#busList_Btn").on("click",function(e){
        e.preventDefault();
        //fn_nodeToRoute(obj);
       });
       },
     error:function(){
      alert("error");
     }
    })
        
   }