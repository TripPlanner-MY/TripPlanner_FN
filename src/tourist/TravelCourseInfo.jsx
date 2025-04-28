import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './TravelCourseInfo.scss';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

const TravelCourseInfo = () => {
    const location = useLocation();
    const contentId = new URLSearchParams(location.search).get('contentId');
    const { state } = location || {};
    const { hashtag } = state || {}; // 전달받은 해시태그
    const [courseDetail, setCourseDetail] = useState({});
    const [detailCommon, setDetailCommon] = useState(null);
    const [detailIntro, setDetailIntro] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [googleResult, setGoogleResult] = useState([]); // 구글 검색 결과 상태
    const [totalDistance, setTotalDistance] = useState(0);
    const [address, setAddress] = useState([]);
    const swiperRef = useRef(null);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;

        const R = 6371e3; // 지구의 반지름 (단위: 미터)
        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // 단위: 미터
    };

    const fetchGoogleResults = async (items) => {
        const googleKeywordSearch = items.map((el, index) => {
            const currentEncodedData = encodeURIComponent(el.subname);
            return axios.post("https://www.tripplannerbn.shop/google-search-places", { keyword: currentEncodedData })
                .then((response) => {
                    const { photoUrls, latitude, longitude } = response.data;
                    return { index, photoUrls, latitude, longitude };
                })
                .catch(() => ({ index, photoUrls: null, latitude: null, longitude: null }));
        });

        try {
            const results = await Promise.all(googleKeywordSearch);
            const sortedResults = results.sort((a, b) => a.index - b.index);
            setGoogleResult(sortedResults);
        } catch (error) {
            console.error('요청 중 오류 발생: ', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (contentId) {
                    const response = await axios.get(`https://www.tripplannerbn.shop/travelcourse-info?contentId=${contentId}`);
                    setCourseDetail(response.data);

                    const response2 = await axios.post(`https://www.tripplannerbn.shop/travelcourse-info-detailCommon`, { contentId: contentId });
                    setDetailCommon(response2.data.items.item[0]);

                    const response3 = await axios.post(`https://www.tripplannerbn.shop/travelcourse-info-detailIntro`, { contentId: contentId });
                    setDetailIntro(response3.data.items.item[0].taketime);
                }
                setLoading(false);
            } catch (error) {
                setError('데이터를 불러오는 데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchData();


    }, [contentId]);

    useEffect(() => {
        if (courseDetail.items && courseDetail.items.item) {
            fetchGoogleResults(courseDetail.items.item);
        }
    }, [courseDetail]);

    useEffect(() => {
        // Google 주소를 가져오는 함수
        const getGoogleAddress = async (latitude, longitude) => {
            const apiKey = 'AIzaSyAEae5uopEekuKilPCwWMsQS-M5JG8tTIk'; // 구글 API 키
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                    params: { latlng: `${latitude},${longitude}`, key: apiKey },
                });
                const results = response.data.results;
                return results.length > 0 ? results[0].formatted_address : '주소를 찾을 수 없습니다';
            } catch (error) {
                console.error('주소 가져오기 실패:', error);
                return null;
            }
        };
    
        const fetchAddresses = async () => {
            const addresses = [];
            for (const result of googleResult) {
                if (result.latitude && result.longitude) {
                    const address = await getGoogleAddress(result.latitude, result.longitude);
                    addresses.push(address);
                } else {
                    addresses.push(null);
                }
            }
            setAddress(addresses);
        };
    
        // 구글 검색 결과가 있을 때만 주소를 가져오도록
        if (googleResult.length > 0) fetchAddresses();
    
        // 카카오 맵을 로드하기 전에 window.kakao가 준비되었는지 확인
        if (window.kakao && window.kakao.maps && googleResult.length) {
            const container = document.getElementById('main-map');
            if (!container) return;
    
            const bounds = new window.kakao.maps.LatLngBounds();
            const map = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(googleResult[0]?.latitude, googleResult[0]?.longitude || 0),
                level: 5,
            });
    
            const positions = [];
            let calculatedDistance = 0;
    
            googleResult.forEach((result, index) => {
                if (result.latitude && result.longitude) {
                    const position = new window.kakao.maps.LatLng(result.latitude, result.longitude);
                    bounds.extend(position);
                    positions.push(position);
    
                    const marker = new window.kakao.maps.Marker({ position, map });
                    const customOverlayContent = `
                        <div style="position: absolute; left: -15px; top: -40px;
                            padding: 5px; font-size: 16px; font-weight: bold;
                            background-color: white; border-radius: 50%;
                            width: 30px; height: 30px; display: flex;
                            justify-content: center; align-items: center;
                            border: 2px solid blue; cursor: pointer; z-index: 100;">
                            ${index + 1}
                        </div>
                    `;
    
                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `<div style="padding:5px; font-size:12px;">${courseDetail.items.item[index].subname}</div>`
                    });
                    infowindow.open(map, marker);
    
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position, content: customOverlayContent, clickable: true
                    });
                    customOverlay.setMap(map);
                }
            });
    
            const polyline = new window.kakao.maps.Polyline({
                path: positions, strokeWeight: 5, strokeColor: '#FF0000', strokeOpacity: 0.7, strokeStyle: 'solid',
            });
            polyline.setMap(map);
    
            for (let i = 0; i < positions.length - 1; i++) {
                const lat1 = positions[i].getLat();
                const lon1 = positions[i].getLng();
                const lat2 = positions[i + 1].getLat();
                const lon2 = positions[i + 1].getLng();
                calculatedDistance += getDistance(lat1, lon1, lat2, lon2);
            }
    
            setTotalDistance(calculatedDistance);
            map.setBounds(bounds);
        }
    
        // swiper 인스턴스가 존재하면 슬라이드 변경 이벤트 핸들러 설정
        const swiperInstance = swiperRef.current?.swiper;
        if (!swiperInstance) return;
    
        const handleSlideChange = () => {
            const activeIndex = swiperInstance.realIndex; // 현재 활성화된 슬라이드 인덱스 가져오기
            const steps = document.querySelectorAll('.bar-num'); // 모든 단계 요소 선택
    
            steps.forEach((step, index) => {
                if (index === activeIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };
    
        // Swiper 슬라이드 변경 이벤트에 핸들러 등록
        swiperInstance.on('slideChange', handleSlideChange);
    
        // 클린업 함수: swiperInstance가 변경되면 이벤트 핸들러 제거
        return () => {
            swiperInstance.off('slideChange', handleSlideChange);
        };
    
    }, [googleResult]); // googleResult가 변경될 때마다 다시 실행
    
    

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;
    if (!detailCommon) return <p>여행 코스 정보가 없습니다.</p>;

    const sanitizedOverview = detailCommon.overview.replace(/<br\s*\/?>/g, ' ');
    const goToSlide = (index) => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideTo(index); // swiper 인스턴스를 이용하여 슬라이드 이동
        }
    };




    return (
        <div className="TravelCourseInfo-wrapper">
            <span className="travelcourse-aBtn">
                <a href="/travelcourse">
                    <span className="ico"></span>
                    코스
                </a>
            </span>
            <h2>{detailCommon.title}</h2>
            <p className="total-distance">코스 총 거리 : {(totalDistance / 1000).toFixed(2)} km</p>
            <div className="schedule">
                <ul>
                    <li>
                        <span>
                            <img src="https://korean.visitkorea.or.kr/resources/images/sub/icon_cos_schedule1.gif" />
                        </span>
                        <div>
                            <p>일정</p>
                            <p>{detailIntro === "1일" ? "당일" : detailIntro}</p>
                        </div>
                    </li>
                    <li>
                        <span>
                            <img src="https://korean.visitkorea.or.kr/resources/images/sub/icon_cos_theme1.gif" />
                        </span>
                        <div>
                            <p>테마</p>
                            <p>{hashtag}</p>
                        </div>
                    </li>
                </ul>
            </div>
            <p className="travelcourse-desc">{sanitizedOverview}</p>
            <div>
                <div id="main-map" style={{ height: '400px' }}></div>
            </div>

            <ul className="progress-bar">
                {courseDetail.items.item.map((subItem, index) => (
                    <li key={index} className="step" onClick={() => goToSlide(index)}>
                        <span className={`bar-num ${index === 0 ? 'active' : ''}`}>
                            {index + 1}
                        </span>
                        {/* 구글 첫 번째 이미지 추가 */}
                        {googleResult[index]?.photoUrls && googleResult[index]?.photoUrls.length > 0 && (
                            <div className="photo-container">
                                <img
                                    src={googleResult[index].photoUrls[0]} // 첫 번째 이미지
                                    alt={`Google Image ${index}`}
                                    className="progress-photo"
                                ></img>
                                <span className="photo-subname">{subItem.subname}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <div className="course-content">
                <Swiper
                    ref={swiperRef}
                    pagination={{ type: 'progressbar' }}
                    allowTouchMove={false}
                    touchStartPreventDefault={true}
                    touchMoveStopPropagation={true}
                // modules={[Pagination, Navigation]}
                >
                    {courseDetail.items.item.map((subItem, index) => (
                        <SwiperSlide key={index}>
                            <div className="slide-content">
                                <div className="slide-title">
                                    <span className="slide-title-num">{index + 1}</span>
                                    <span className="silde-title-subname">{subItem.subname}</span>

                                </div>
                                <p className="silde-address">{address[index]}</p>
                                <div className="photo-gallery">
                                    <Swiper
                                        pagination={{ clickable: true }}

                                        modules={[Pagination, Navigation]}
                                        spaceBetween={10} /* 이미지 간 간격 */
                                        slidesPerView={1} /* 한 번에 하나씩 표시 */
                                    >
                                        {googleResult[index]?.photoUrls?.map((photo, i) => (
                                            <SwiperSlide key={i}>
                                                <img
                                                    src={photo}
                                                    alt={`Google Image ${index}-${i}`}
                                                    className="photo"
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                                <div className="details">

                                    <p dangerouslySetInnerHTML={{ __html: subItem.subdetailoverview }} />

                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default TravelCourseInfo;
