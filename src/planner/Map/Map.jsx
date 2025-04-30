import React, { useState, useEffect, useRef } from 'react';
import "proj4"
import "proj4leaflet"
import L, { marker } from 'leaflet';
import axios from 'axios';
import NoImage from '../../images/noImage.png';

const Map = (props) => {

    // map을 상태로 설정
    const [map, setMap] = useState(null);
    const [center , setCenter] = useState({ lat: 35.1795543, lng: 129.0756416 })
    const [layerGroup, setLayerGroup] = useState(L.layerGroup());
    const [destinationGroup, setDestinationGroup] = useState(L.layerGroup());

    const isMounted = useRef(false);
    const isClicked = useRef(false);
    const isSearchClicked = useRef(false);

    var accomIcon = L.icon({
        iconUrl:'',
        
    });

    var foodIcon = L.icon({
        iconUrl:'/images/food_icon.png',
        iconSize:[25,50],
    })

  
    const handleClickMarker = async (data) => {
        const lat = data.y; const lng = data.x;
        map.setView([lat,lng], 13);
        var image;
        layerGroup.clearLayers();

        await axios.post('https://www.tripplannerbn.shop/planner/getImages',
            { 'businessName':data.name },
        )
        .then(resp=>{ image=resp.data.image })
        .catch(err=>{console.log(err)});

        const marker = L.marker([lat,lng]).addTo(layerGroup);
        marker.on('click', () => {
            marker.unbindPopup();
            marker.bindPopup(
                `
<div class="custom-popup">
  <div style="width: 100%; height: 100%; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; font-family: Arial, sans-serif; display: flex; flex-direction: column;">
    
    <div style="display: flex; flex-direction: row; margin-bottom: 20px;">
      
      <div style="display: flex; flex-direction: row; margin-bottom: 15px; width: 100%;">
        <div style="width: 100px; height: 100px; margin-right: 15px; flex-shrink: 0;">
          <img src="${image}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
        </div>

        <div style="display: flex; flex-direction: column; justify-content: center; text-align: left; flex-grow: 1;">
          <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0; padding: 0;">${data.name}</h3>
          <p style="font-size: 12px; color: #888; margin: 1px 0; padding: 0;">${data.category}</p>
          <p style="font-size: 12px; color: #555; margin: 1px 0; padding: 0;"> ${data.address}</p>
        </div>
      </div>

      <div style="position: absolute; bottom: 20px; right: 20px;">
        <button class="planner-btn ${data.name}" style="display: block; width: fit-content; padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; text-align: center; text-decoration: none; transition: background-color 0.3s ease, transform 0.2s ease;">
          플래너에 추가
        </button>
      </div>
    </div>
  </div>
</div>


              `
              ).openPopup();
        })
        marker.on('popupopen',function(e){
        const nodeList = e.target._popup._contentNode.childNodes[1].childNodes[1].childNodes[1].childNodes[3].childNodes;
        nodeList[1].addEventListener('click', async () => {
            await  axios.post('https://www.tripplannerbn.shop/planner/findDestination',
                    {"businessName":data.name, "businessCategory":data.category,"streetFullAddress":data.address,"coordinate_x":data.x,"coordinate_y":data.y},
                    {"Content-Type":"application/json"},
            )
            .then(resp=>{
                props.AddDestination({"day":props.DayData,"data":resp.data})
            })
            .catch(err=>{console.log(err)})
        });
        })
        layerGroup.addTo(map);
    }

    // 지역이 변경될 때 마다 Map Rendering
    useEffect(()=>{
        if(map && props.AreaData) {
            var lat = Number(props.AreaData[1])
            var lng = Number(props.AreaData[0])

            map.setView([lat,lng], 7);
        }
    },[props.AreaData])

    useEffect(()=>{
        if(isClicked) {
            if(props.ClickDestination) {
                const data = props.ClickDestination.data;
                handleClickMarker(data)
            }
        } else {
            isClicked(true);
        }
    },[props.ClickDestination])

    useEffect(()=>{
        if(isClicked) {
            if(props.ClickSearchDestination) {
                const data = props.ClickSearchDestination;
                handleClickMarker(data)
            }
        } else {
            isClicked(true);
        }
    },[props.ClickSearchDestination])


    // map 최초 로딩시
    useEffect(() => {
        // 좌표계 정의
        const EPSG5181 = new L.Proj.CRS(
            'EPSG:5181',
            // 'EPSG:4326',
            // '+proj=longlat +datum=WGS84 +no_defs',
            '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            {
            resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
            origin: [-30000, -60000],
            bounds: L.bounds([-30000-Math.pow(2,19)*4, -60000], [-30000+Math.pow(2,19)*5, -60000+Math.pow(2,19)*5])
            }          
        );
        
        // map 설정
        const mapInstance = L.map('map', {
            center: [center.lat, center.lng],
            crs: EPSG5181,
            zoom:9,
        });

        // map의 베이스
        const tileLayer =L.tileLayer('http://map{s}.daumcdn.net/map_2d/1807hsm/L{z}/{y}/{x}.png', {
            minZoom:7,
            maxZoom:13,
            zoomReverse:true,
            zoomOffset:1,
            subdomains:'0123',
            continuousWorld:true,
            tms:true,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Map 객체를 상태로 저장
        setMap(mapInstance);

        // 지도 이동 시 이벤트
        mapInstance.on('moveend', async () => {
            const center = mapInstance.getCenter();
            setCenter({ lat: center.lat, lng: center.lng });
        });

        return () => {
            mapInstance.remove(); // 컴포넌트 언마운트 시 지도 제거
        };
    }, []);

    return (
        <>              
            <div id="map" style={{ width: '900px', height: '100vh' }}></div>
        </>
    );
}

export default Map;