import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import './TouristInfo.scss';
import homepageIcon from '../images/homepageIcon.png'
import favIcon from '../images/favIcon.png'
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import DOMPurify from 'dompurify';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { EffectFade, Navigation, Pagination } from 'swiper/modules';

const details = [
    { key: 'infocenter', label: '문의 및 안내 :' },
    { key: 'parking', label: '주차 :' },
    { key: 'opendate', label: '오픈일 :' },
    { key: 'restdate', label: '휴무일 :' },
    { key: 'usetime', label: '이용시간 :' },
    { key: 'chkcreditcard', label: '신용카드 :' },
    { key: 'chkbabycarriage', label: '아기 동반 :' },
    { key: 'chkpet', label: '펫 동반 :' },
    { key: 'expguide', label: '체험코스 :' },
];

const TouristInfo = () => {
    const location = useLocation();
    const contentId = new URLSearchParams(location.search).get('contentId');
    const [detail, setDetail] = useState({});
    const [detailInfo, setDetailInfo] = useState('');
    const [detailIntro, setDetailIntro] = useState('');
    const [photoUrls, setPhotoUrls] = useState([]);
    const mapContainer = useRef(null);

    const openMapDetail = (lat, lng) => {
        const kakaoMapUrl = `https://map.kakao.com/link/map/${lat},${lng}`;
        window.open(kakaoMapUrl);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (contentId) {
                    // 관광지 기본 정보 가져오기
                    const response = await axios.get(`https://www.tripplannerbn.shop/tourist-info?contentId=${contentId}`);
                    setDetail(response.data.items.item[0]);

                    const detailData = response.data.items.item[0];
                    if (detailData) {
                        // 순차적으로 API 호출하여 데이터를 가져오기
                        const [detailInfoResponse, detailIntroResponse, googleResponse] = await Promise.all([
                            axios.post(`https://www.tripplannerbn.shop/tourist-detailInfo`, { contentId: detailData.contentid }),
                            axios.post('https://www.tripplannerbn.shop/tourist-detailIntro', { contentId: detailData.contentid }),
                            axios.post('https://www.tripplannerbn.shop/google-search-places', { keyword: encodeURIComponent(detailData.title) })
                        ]);

                        setDetailInfo(detailInfoResponse.data.items);
                        setDetailIntro(detailIntroResponse.data.items.item[0]);
                        setPhotoUrls(googleResponse.data.photoUrls);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (contentId) {
            fetchData();
        }
    }, [contentId]);

    useEffect(() => {
        if (detail.mapy && detail.mapx) {
            const mapOption = {
                center: new window.kakao.maps.LatLng(detail.mapy, detail.mapx),
                level: 3,
                draggable: false,
                disableDoubleClickZoom: false,
            };

            const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
            const markerPosition = new window.kakao.maps.LatLng(detail.mapy, detail.mapx);
            const marker = new window.kakao.maps.Marker({ position: markerPosition });
            marker.setMap(map);
        }
    }, [detail]);

    return (
        <div className="touristInfo-wrapper">
            {/* content 부분 */}
            {detail.title && (
                <div className="desc-content">
                    <span className="travelcourse-aBtn">
                        <a href="/tourist">
                            <span className="ico"></span>
                            관광지
                        </a>
                    </span>
                    <h2 className="desc__title">{detail.title}</h2>
                    <div className="desc__address-container">
                        <span>{detail.addr1}</span>
                    </div>
                    <div className="desc__homepage">
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip" className="custom-tooltip">즐겨찾기</Tooltip>}
                        >
                            <img className="favIcon" src={favIcon} />
                        </OverlayTrigger>
                        {detail.homepage && (
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id="tooltip" className="custom-tooltip">홈페이지</Tooltip>}
                            >
                                <a className="tohomepage-btn" href={detail.homepage.match(/href="(.*?)"/)?.[1]} target="_blank" rel="noopener noreferrer">
                                    <img className="homepageIcon" src={homepageIcon} />
                                </a>
                            </OverlayTrigger>
                        )}
                    </div>
                </div>
            )}

            {/* 이미지 블록 */}
            <div className="image-block">
                <Swiper
                    spaceBetween={30}
                    effect={'fade'}
                    navigation={true}
                    pagination={{ clickable: true }}
                    modules={[EffectFade, Navigation, Pagination]}
                    className="mySwiper"
                >
                    <SwiperSlide>
                        <img src={detail.firstimage} alt="First Image" />
                    </SwiperSlide>
                    {photoUrls.length > 0 && photoUrls.map((url, index) => (
                        <SwiperSlide key={index}>
                            <img src={url} alt={`Tourist Image ${index}`} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="overview-content">
                <h2 className="overview__title">상세정보</h2>
                <p className="overview-detail">{detail.overview}</p>
            </div>

            <div ref={mapContainer} style={{ width: '100%', height: '400px', margin: '20px 0', position: 'relative' }}>
                <button
                    className="map-detail-btn"
                    onClick={() => openMapDetail(detail.mapy, detail.mapx)}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: '20',
                    }}
                >
                    자세히 보기
                </button>
            </div>

            <div className="detail-content">
                <ul className="detailInfo-ul">
                    {detailInfo?.item?.map((subItem, index) => (
                        <li key={index} className="detail_items">
                            <strong className="detail_items-title">{subItem.infoname} : </strong>
                            <span className="detail_items-text"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(subItem.infotext),
                                }}
                            ></span>
                        </li>
                    ))}
                </ul>

                <ul className="detailInfo-ul">
                    {details.map(({ key, label }) => {
                        const value = detailIntro[key];
                        return (
                            value && value !== '없음' && (
                                <li className="detail_items" key={key}>
                                    <strong className="detail_items-title">{label}</strong>
                                    <span
                                        className="detail_items-text"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(value),
                                        }}
                                    ></span>
                                </li>
                            )
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default TouristInfo;
