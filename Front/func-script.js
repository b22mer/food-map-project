// 0. sevral Fucntion
function searchRestaurants() { 
	if (window.event.keyCode == 13) { 

    const searchInfo=document.getElementById("search-input");
    searchHandler(searchInfo);
    } 
}

function searchRestaurantsByclick() { 
    const searchInfo=document.getElementById("search-input");
    searchHandler(searchInfo);
    
}

//01. 검색 처리
async function searchHandler(searchinfo) {
  const title =searchinfo.value;
  try {
    // 데이터 분류
    let searchrizedDataSet = await getDataSetForSearch(title);
    // 기존 마커 삭제
    closeMarker();
    // 기존 인포윈도우 닫기
    closeInfoWindow();
    setList(searchrizedDataSet);
    setMap(searchrizedDataSet);
  } catch (error) {
    console.error(error);
  }
}

async function getDataSetForSearch(title) {
  let qs = title;
  if (!qs) { // 타이틀 데이터를 받았을때 비어있다? => 식당 전체를 나타냄
    qs = "";
  }
  
  const dataSet = await axios({ // 데이터 서버 연결
    method: "patch", 
    url: `http://localhost:3000/restaurants?title=${qs}`,
    headers: {}, 
    data: {}, 
  });
 
  return dataSet.data.result;
}


getDataSetForSearch();
var container = document.getElementById("map"); 
var options = {
  //지도를 생성할 때 필요한 기본 옵션
  center: new kakao.maps.LatLng(37.45119, 126.656338), //지도 시작을 인하대 후문으로
  level: 1, //지도 확대수준
};

var map = new kakao.maps.Map(container, options); //지도 객체 

// 지도 줌 컨트롤
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);


//데이터 set (가게명, 주소, url, 카테고리)

async function getDataSet(category) {
  let qs = category;
  console.log("결과:"+qs);
  if (!qs) { // 카테고리 데이터를 받았을때 비어있으면 그냥 전체를 보여주도록 설정
    qs = "";
  }

  const dataSet = await axios({ // 데이터 서버 연결
    method: "get", // http method
    url: `http://localhost:3000/restaurants?category=${qs}`,
    headers: {}, // packet header
    data: {}, // packet body
  });
  //  console.log(dataSet)
  return dataSet.data.result;
}

getDataSet();


// 주소 좌표 변환 객체
var geocoder = new kakao.maps.services.Geocoder();

// 주소 좌표 변환 func
function getCoordsByAddress(address) {
  return new Promise((resolve, reject) => {
    // 주소 -> 좌표 서치
    geocoder.addressSearch(address, function (result, status) {
      // 검색이 정상적으로 완료되었으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        resolve(coords);
        return;
      }
      reject(new Error("getCoordsByAddress Error: not Vaild Address"));
    });
  });
}






//마커에 인포윈도우 붙이기
function getContent(data) {
  let imgurl=""
  if (data.review==null){
    data.review=0;
  }

  if (data.category=="분식") {
    imgurl="/img/busick"
  }else if(data.category=="한식") {
    imgurl="/img/korea"
  }else if(data.category=="중식") {
    imgurl="/img/china"
  }else if(data.category=="양식") {
    imgurl="/img/america"
  }else if(data.category=="일식") {
    imgurl="/img/japan"
  }

  if (data.title=="미로곱창"){
    pageurl="/project_onwer/client_view.html";
  } else {
    pageurl="/project_onwer/empty_store.html";
  }

  return `
  <div class="infowindow">
      <div class="infowindow-img-container">
        <img heigt="350px" width="350px"src="${imgurl}.png"
          class="infowindow-img"
        />
      </div>
      <div class="infowindow-body">
        <h5 class="infowindow-title"> ${data.title}</h5>
        <p style="color:lightskyblue; font-weight:bold;"class="infowindow-category">${data.category}</p>
        <p class="infowindow-address">${data.address}</p>
        <p class="infowindow-address">${data.phone}</p>
        <p class="infowindow-review">후기 ${data.review}개</p>
        <div style="margin-left:5px; margin-top:5px">
        <a href="${pageurl}" class="infowindow-btn" target="_blank">좌석현황</a>
        <a href="${data.infoUrl}" class="infowindow-btn" target="_blank">식당정보</a>
        </div>
        <div> 
         </div>
      </div>
    </div>
  `;
}


// 거리를 구하는 함수
async function getDistance(address){

  var c1 = map.getCenter();
  console.log("센터 좌표"+ c1);
  var c2 = "(37.45119, 126.656338)";
  console.log("들어온 좌표"+ "(37.45119, 126.656338)");
  var poly = new kakao.maps.Polyline({
    // map: map, 을 하지 않아도 거리는 구할 수 있다.
    path: [c1, c2]
  });

  console.log( poly.getLength());
  return poly.getLength(); // m 단위로 리턴
}



// 하단부 리스트 형태로 식당 뽑아냄
async function setList(dataSet){

  let text="<ul class='listbox'>";
  let textLength=dataSet.length;
  let distance=0
  for (let i =0; i< textLength; i++){
    if (dataSet[i].phone==null){
      dataSet[i].phone="-";
    } 

    if (dataSet[i].review==null){
      dataSet[i].review=0;
    } 

    distance=getDistance("인천 미추홀구 경인남길30번길 35-1")

    text+="<li id='list-box'>"+"<span id='list-count'>"+i+" |</span><span id='list-title'>"+ dataSet[i].title + "</span>  "+ "<span id='list-category'>"
    +dataSet[i].category+"</span>  "+"<span id='list-address'>"+ dataSet[i].address +"</span>" + "  <span id='list-phone'>" + dataSet[i].phone
    +"</span>"+" <span id='list-review'>후기: " + dataSet[i].review+"</span> " +"<span id='list-menu'>"+
    "<button id='list-menu-btn' onclick='location.href="+dataSet[i].infoUrl+"'>상세정보</button>"+"<button id='list-menu-btn'>좌석현황</button>"+"</span></li>";
  }

  text+="</ul>"
  document.getElementById("test").innerHTML=text;
}

// 맵 비동기 설정
async function setMap(dataSet) {
  markerArray = [];
  infowindowArray = [];

  for (var i = 0; i < dataSet.length; i++) {
    // 마커를 생성
    let coords = await getCoordsByAddress(dataSet[i].address);
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: coords, // 마커를 표시할 위치
    });

    markerArray.push(marker);

    // 마커에 표시할 인포윈도우를 생성
    var infowindow = new kakao.maps.InfoWindow({
      content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
    });

    infowindowArray.push(infowindow);

    kakao.maps.event.addListener(
      marker,
      "click",
      makeOverListener(map, marker, infowindow, coords)
    );
    kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
  }
}


// 클릭시 다른 info box 닫기
// 클릭한곳을 기준으로 중심이 옮겨짐

function makeOverListener(map, marker, infowindow, coords) {
  return function () {
    // 클릭시 다른 infobox 닫기
    closeInfoWindow();
    infowindow.open(map, marker);
    // 클릭한 곳으로 지도 중심 이동
    map.panTo(coords);
  };
}

let infowindowArray = [];
function closeInfoWindow() {
  for (let infowindow of infowindowArray) {
    infowindow.close();
  }
}

// info box를 닫는 클로저를 만드는 함수
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}


// 카테고리 분류
const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
  const categoryId = event.target.id;
  console.log("카테고리아이디체크:"+categoryId)
  const category = categoryMap[categoryId];
  console.log("카테고리체크:"+category)
  try {
    // 데이터 분류
    let categorizedDataSet = await getDataSet(category);

    // 기존 마커 삭제
    closeMarker();

    // 기존 info box 닫기
    closeInfoWindow();
    setList(categorizedDataSet);
    setMap(categorizedDataSet);
  } catch (error) {
    console.error(error);
  }
}
const categoryMap = {
  korea: "한식",
  china: "중식",
  japan: "일식",
  america: "양식",
  bunsick: "분식",
};


let markerArray = [];
function closeMarker() {
  for (marker of markerArray) {
    marker.setMap(null);
  }
}

async function setting() {
  try {
    const dataSet = await getDataSet();
    setMap(dataSet);
   setList(dataSet);
 
  } catch (error) {
    console.error(error);
  }
}

setting();
