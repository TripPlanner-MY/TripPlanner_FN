import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import findwayIcon from '../images/findway.png';
import './DestinationDetails.scss';
import axios from 'axios';

const Details = ({ plannerItem, destinations, activeTab }) => {  // activeTab 받기
    const navigate = useNavigate();
    const [shownDays, setShownDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);  // 선택된 Day를 관리하는 상태 추가
    const mapRef = useRef(null);
    const dayColors = [
        "#FF5733", "#33FF57", "#3357FF", "#F0E68C", "#FF1493", "#8A2BE2", "#FFD700", "#FF6347", "#00FA9A", "#ADFF2F"
    ];


    // 거리 계산 함수
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구 반경 (단위: km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 길찾기 링크 생성 함수
    const getDirections = (start, end) => {
        const url = `https://map.kakao.com/?sName=${start.address}&eName=${end.address}`;
        return url;
    };


    const handleDayClick = (day) => {
        if (selectedDay === day) {
            return; // 이미 선택된 Day는 다시 클릭할 수 없도록 함
        }
        setSelectedDay(day); // 새로 선택된 Day
    };

    // 장소 이름 클릭 시 관광지에 있는 정보이면 우리 페이지로 표시하고 없으면 카카오로 검색
    const desInfoClick = (item) => {

        axios.post(`https://www.tripplannerbn.shop/destination-to-tourist`, {
            mapX: item.x,
            mapY: item.y
        }).then((response) => {

            if (response.data.items.item[0].contentid) {
                const contentId = response.data.items.item[0].contentid;
                axios.get(`https://www.tripplannerbn.shop/tourist-info?id=${contentId}`)
                    .then((response) => {

                        const detailCommon = response.data;

                        navigate('/tourist-info', { state: { detailCommon } }); // 데이터와 함께 이동

                    })
                    .catch((error) => {
                        console.error('Error fetching course info:', error);

                    });

            }

            console.log(response.data.items.item[0]);
        }).catch(() => {
            // 데이터가 없으면 카카오지도에 장소 이름으로 검색
            const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.name)}`;
            window.open(kakaoMapUrl, '_blank'); // 새 탭으로 카카오 지도 열기

        })

    }

    // 주소 클릭 시 카카오 지도로 표시 (주소로 검색)
    const addressClick = (item) => {
        const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.address)}`;
        window.open(kakaoMapUrl, '_blank');
    }

    useEffect(() => {
        if (destinations.length > 0 && window.kakao && window.kakao.maps) {
            const container = document.getElementById('sub-map');
            const options = {
                center: new window.kakao.maps.LatLng(destinations[0].y, destinations[0].x),
                level: activeTab === 'details' ? 8 : 5  // activeTab에 따라 줌 레벨 조정
            };

            // 카카오 지도 객체 생성
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;  // map 객체를 ref에 저장

            const bounds = new window.kakao.maps.LatLngBounds();
            let dayMarkers = {};
            let dayPolylines = {};
            let dayCounters = {};

            destinations.forEach((destination) => {
                if (selectedDay !== null && destination.day !== selectedDay) return; // 선택된 Day만 표시

                const position = new window.kakao.maps.LatLng(destination.y, destination.x);
                bounds.extend(position);

                const currentDay = destination.day;
                const color = dayColors[(currentDay - 1) % dayColors.length];

                if (!dayCounters[currentDay]) dayCounters[currentDay] = 1;
                else dayCounters[currentDay] += 1;

                const customOverlayContent = `
                    <div style="font-size: 16px; font-weight: bold; background-color: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 100; color: white;">
                        ${dayCounters[currentDay]}
                    </div>
                `;
                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position, content: customOverlayContent, clickable: true
                });
                customOverlay.setMap(map);

                if (!dayMarkers[currentDay]) dayMarkers[currentDay] = [];
                dayMarkers[currentDay].push(position);

                if (dayMarkers[currentDay].length > 1) {
                    if (!dayPolylines[currentDay]) {
                        dayPolylines[currentDay] = new window.kakao.maps.Polyline({
                            path: dayMarkers[currentDay],
                            strokeWeight: 5,
                            strokeColor: color,
                            strokeOpacity: 0.7,
                            strokeStyle: 'solid',
                        });
                        dayPolylines[currentDay].setMap(map);
                    } else {
                        dayPolylines[currentDay].setPath(dayMarkers[currentDay]);
                    }
                }
            });

            map.setBounds(bounds); // 지도 경계를 설정
        }
    }, [destinations, activeTab, selectedDay]); // selectedDay 추가

    useEffect(() => {
        const uniqueDays = destinations.reduce((acc, destination) => {
            if (!acc.includes(destination.day)) acc.push(destination.day);
            return acc;
        }, []);
        setShownDays(uniqueDays);
    }, [destinations]);

    if (!plannerItem || destinations.length === 0) return <div>로딩중...</div>;

    return (
        <>
            <div className="destinationDetails-depth">
                <ul>
                    <li
                        onClick={() => handleDayClick(null)}
                        className={`day-button ${selectedDay === null ? 'ACTIVE' : ''}`} // 전체일정 버튼 스타일 적용
                    >
                        전체일정
                    </li>
                    {destinations.map((destination, index) => {
                        const isNewDay = index === 0 || destination.day !== destinations[index - 1]?.day;
                        return (
                            isNewDay && (
                                <li
                                    key={index}
                                    onClick={() => handleDayClick(destination.day)} // Day 클릭 시 해당 Day만 표시
                                    className={`day-button ${selectedDay === destination.day ? 'ACTIVE' : ''} ${selectedDay === destination.day ? 'disabled' : ''}`} // 선택된 Day에 active 및 disabled 클래스 적용
                                >
                                    Day {destination.day}
                                </li>
                            )
                        );
                    })}
                </ul>
            </div>

            <div className="destination-content" style={{ 'padding-top': '20px' }}>
                {destinations.length > 0 ? (
                    destinations.map((destination, index) => {
                        const isNewDay = index === 0 || destination.day !== destinations[index - 1]?.day;
                        const prevDestination = destinations[index - 1];
                        const distance = prevDestination
                            ? calculateDistance(prevDestination.y, prevDestination.x, destination.y, destination.x)
                            : 0;

                        if (selectedDay !== null && destination.day !== selectedDay) return null; // 선택된 Day만 표시

                        return (
                            <div key={index} className="destination-card">
                                <ul className="destination-card-ul">
                                    {isNewDay && (
                                        <div>
                                            <p className="destination-day" style={{ color: dayColors[(destination.day - 1) % dayColors.length] }}>
                                                Day {destination.day}
                                            </p>
                                        </div>
                                    )}
                                    {!isNewDay && prevDestination && (
                                        <div className="destination-distance">
                                            <span className="destination-distance-span">총 {distance.toFixed(2)} km</span>
                                            <button
                                                className="destination-distance-button"
                                                onClick={() => window.open(getDirections(prevDestination, destination), '_blank')}
                                            >
                                                <img className="icon" src={findwayIcon} alt="findway" />
                                            </button>
                                        </div>
                                    )}
                                    <li className="destination-info">
                                        <p className="destination-dayOrder">{destination.dayOrder}</p>
                                        {!isNewDay && <div className="line"></div>}
                                        <span className="destination-image">
                                            <img src={destination.image} alt="destination" />
                                        </span>
                                        <div className="destination-desc">
                                            <p className="destination-category">{destination.category}</p>
                                            <p className="destination-title" onClick={() => desInfoClick(destination, index)}>{destination.name}</p>
                                            
                                            <p className="destination-address" onClick={() => addressClick(destination, index)}>{destination.address}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        );
                    })
                ) : (
                    <p>등록된 여행지가 없습니다.</p>
                )}
            </div>
            <div id="sub-map" className="destination-map"></div>
        </>
    );
};

export default Details;
