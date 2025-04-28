
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Destination.scss';
import findwayIcon from '../images/findway.png';
import likeIcon from '../images/likeIcon.png';
import moment from 'moment';

const Destination = () => {
    const navigate = useNavigate();
    const dayColors = [
        "#FF5733", "#33FF57", "#3357FF", "#F0E68C", "#FF1493", "#8A2BE2", "#FFD700", "#FF6347", "#00FA9A", "#ADFF2F"
    ];

    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");

    const [destinations, setDestinations] = useState([]);
    const [username, setUsername] = useState('');
    const { plannerItem } = location.state || {}; // state에서 데이터 가져오기 (Planner의 정보)
    const [shownDays, setShownDays] = useState([]);
    const [loginStatus, setLoginStatus] = useState([]);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);




    // 거리 계산 함수: 두 좌표 간의 거리 계산 (단위: km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // km 단위 반환
    };

    // 카카오 지도로 길찾기 (새 페이지)
    const getDirections = (start, end) => {
        const endAddress = start.address; // 출발지 좌표
        const startAddress = end.address; // 도착지 좌표

        // 카카오 지도 경로 요청 URL 
        const url = `https://map.kakao.com/?sName=${endAddress}&eName=${startAddress}`
        return url;
    };

    // destination 데이터를 서버에서 가져오는 API 호출
    useEffect(() => {
        if (plannerID) {
            axios.get(`https://www.tripplannerbn.shop/planner/board/destination?plannerID=${plannerID}`)
                .then((response) => {
                    setUsername(response.data[0].username);
                    setDestinations(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching destinations:", error);
                });

            // 쿠키요청
            axios.post('https://www.tripplannerbn.shop/api/cookie/validate', {}, {
                withCredentials: true, // 쿠키 포함
            })
                .then(response => {
                    console.log(response)
                    setLoginStatus(response.data);
                })
                .catch(error => {
                    setLoginStatus(error);
                    console.log('로그인 정보 없음')
                })
        }

        // 좋아요

        if (plannerID) {
            axios.get(`https://www.tripplannerbn.shop/planner/board/likeStatus?plannerID=${plannerID}`, {
                withCredentials: true, // 쿠키 포함
            })
                .then((response) => {
                    setLikeCount(response.data.likeCount);
                    setIsLiked(response.data.isLiked); // 사용자가 좋아요를 눌렀는지 여부
                })
                .catch((error) => {
                    console.error("Error fetching like status:", error);
                });
        }


    }, [plannerID]);

    useEffect(() => {

        const uniqueDays = destinations.reduce((acc, destination) => {
            if (!acc.includes(destination.day)) acc.push(destination.day);
            return acc;
        }, []);

        setShownDays(uniqueDays);

        if (destinations.length > 0) {
            const container = document.getElementById('main-map');

            // 이미 지도 객체가 초기화 되어 있는지 체크
            if (window.kakao && window.kakao.maps && !window.kakao.maps.Map) {
                return;  // 카카오 맵 객체가 로드되지 않았다면 초기화하지 않음
            }

            const options = {
                center: new window.kakao.maps.LatLng(destinations[0].y, destinations[0].x),
                level: 5
            };

            // 맵 객체를 한 번만 초기화하고, 이미 초기화된 맵이 있다면 재사용
            const map = new window.kakao.maps.Map(container, options);
            const bounds = new window.kakao.maps.LatLngBounds();
            let dayMarkers = {};
            let dayPolylines = {};
            let dayCounters = {};

            destinations.forEach((destination, index) => {
                const position = new window.kakao.maps.LatLng(destination.y, destination.x);
                bounds.extend(position);

                const currentDay = destination.day;
                const color = dayColors[(currentDay - 1) % dayColors.length];

                if (!dayCounters[currentDay]) {
                    dayCounters[currentDay] = 1;
                } else {
                    dayCounters[currentDay] += 1;
                }

                const customOverlayContent = `
                    <div style="font-size: 16px; font-weight: bold; background-color: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 100; color: white;">
                        ${dayCounters[currentDay]}
                    </div>
                `;

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position, content: customOverlayContent, clickable: true
                });
                customOverlay.setMap(map);

                if (!dayMarkers[currentDay]) {
                    dayMarkers[currentDay] = [];
                }
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

            map.setBounds(bounds);
        }
        console.log('destinations : ', destinations);
    }, [destinations]);






    const handleLike = (plannerID) => {
        if (!loginStatus) {
            alert('로그인이 필요한 서비스입니다');
        }
        axios.post('http://www.tripplannerbn.shop/planner/board/toggleLike',
            { plannerID },
            { withCredentials: true }) // 쿠키 포함
            .then((response) => {
                console.log('response', response);
                setLikeCount(response.data.likeCount); // 서버에서 업데이트된 좋아요 개수
                setIsLiked(response.data.isLiked); // 서버에서 반환된 좋아요 상태
            })
            .catch((error) => {
                console.error("Error toggling like:", error);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            });

    };

    // 내 코스로 담기 버튼
    const handleAddToMyCourse = () => {

        axios.post('https://www.tripplannerbn.shop/api/cookie/validate', {}, {
            withCredentials: true, // 쿠키 포함
        })
            .then(response => {
                const bringData = {
                    plannerid: 0,
                    title: plannerItem.plannerTitle,
                    areaName: plannerItem.area,
                    description: plannerItem.description,
                    isPublic: plannerItem.public,
                    day: plannerItem.day,
                    userid: plannerItem.userId,
                    destinations: destinations,
                }
                navigate('/makePlanner', { state: { bringData } });
            })

            .catch(error => {
                alert('로그인이 필요한 서비스입니다!');
                window.location.href = "/user/login";
            });

        // axios.post('http://localhost:9000/planner/bringPlanner',
        //     {
        //         day: plannerItem.day,
        //         area: plannerItem.area,
        //         plannerid: plannerItem.plannerID,
        //     },
        //     { 'Content-Type': 'application/json' },
        // )
        //     .then((response) => {
        //         alert(response.data); // 서버에서 보낸 응답 메시지 출력
                
        //     })
        //     .catch((error) => {
        //         console.error("Error adding to my course:", error);
        //         alert("내 코스로 저장에 실패했습니다. 다시 시도해주세요.");
        //     });
    }

    const handleDeletePlanner = () => {
        axios.post('https://localhost:9000/api/cookie/validate', {}, {
            withCredentials: true, // 쿠키 포함
        })
            .then(response => {
                console.log("Planner ITEM:", plannerItem);
            })

            .catch(error => {
                alert('로그인이 필요한 서비스입니다!');
                window.location.href = "/user/login";
            });

        axios.post('https://localhost:9000/planner/deletePlanner',
            { plannerid: plannerID },
            { 'Content-Type': 'application/json' }
        )
            .then(resp => {
                window.location.href = "/planner/board";
            })
            .catch(err => {
                console.error("Error Deleting to my course:", err);
                alert("플래너 삭제에 실패했습니다. 다시 시도해주세요.");
            })

    }

    // const handleUpdatePlanner = () => {
    //     console.log(plannerItem);
    //     axios.post('http://localhost:9000/planner/updatePlanner',
    //         {
    //             plannerid: plannerItem.plannerID,
    //             title: plannerItem.title,
    //             areaName: plannerItem.area,
    //             description: plannerItem.description,
    //             isPublic: plannerItem.public,
    //             day: plannerItem.day,
    //             userid: plannerItem.userId,
    //             destinations: destinations,
    //         },
    //         {'Content-Type': 'application/json'},
    //     )
    //     .then(resp=> {
    //         console.log(resp)
    //     })
    //     .catch(err=>{
    //         console.log(resp)
    //     })
    // }

    const handleUpdatePlanner = () => {
        const updateData = {
            plannerid: plannerItem.plannerID,
            title: plannerItem.plannerTitle,
            areaName: plannerItem.area,
            description: plannerItem.description,
            isPublic: plannerItem.public,
            day: plannerItem.day,
            userid: plannerItem.userId,
            destinations: destinations,
        }
        navigate('/makePlanner', { state: { updateData } });
    }

    return (
        // 페이지 전체
        <>

            {/* 페이지 설명 컨탠트 */}
            < div className="destination-content" >

                {/* 설명 부분 */}
                < div className="destination-topcard" >

                    {/* 설명의 헤더 */}
                    < div className="topcard-header" >
                        {/* 플래너 타이틀 */}
                        <div div className="topcard-title" > {plannerItem.plannerTitle}</div>

                        {/* 타이틀 바로 밑 서브헤더 */}
                        < div className="topcard-subheader" >
                            <span>{plannerItem.area}</span>

                            {/* 기간 : */}
                            <span className="topcard-day">
                                {plannerItem.day === 1
                                    ? "당일"
                                    : `${plannerItem.day - 1}박 ${plannerItem.day}일`}
                            </span>

                            {/* 공개 여부 */}
                            {
                                plannerItem ? (
                                    <span className="topcard-isPublic">공개</span>
                                ) :
                                    <span className="topcard-isPublic">비공개</span>
                            }


                        </div>
                    </div >

                    {/* 코스에대한 설명이 담긴 부분 */}
                    < div className="topcard-main" >
                        <div className="topcard-main-desc">{plannerItem.description}</div>
                    </div >

                    {/* 좋아요와 작성일이 담긴 부분 */}
                    < div className="topcard-footer" >

                        {/* 좋아요 */}
                        <div className="like-section">
                            <img
                                src={likeIcon}
                                alt="Like Icon"
                                className={`like-icon ${isLiked ? 'liked' : ''}`}
                                onClick={() => handleLike(plannerID)} // plannerID 전달
                            />
                            <span className="like-number">{likeCount}</span>
                        </div>

                        {/* 작성일 */}
                        < h2 className="topcard-footer-createAt" > {moment(plannerItem.createAt).format('YYYY년 MM월 DD일')} 생성</h2 >
                    </div >

                </div >

                {/* 유저의 정보에 따라 표시할 내용 */}
                < div className="destination-user" >
                    <div className="destinaion-user-info">
                        <img className="topcard-userProfileImg" src={plannerItem.thumbnailImage} ></img>
                        <span className="destination-username">{username}님의 코스 정보</span>
                    </div>

                    {/* 로그인 돼 있는 유저의 pk와 planner의 유저가 일치 할 시 수정 삭제 버튼 */}
                    <div className="destination-plannerControl">
                        {loginStatus && loginStatus.userid && loginStatus.userid === plannerItem.userId ? (
                            <>

                                <button className="destination-plannerControl-button" onClick={() => { handleUpdatePlanner() }} >수정</button>
                                <button className="destination-plannerControl-button" onClick={() => { handleDeletePlanner() }} >삭제</button>

                            </>

                        ) : (
                            <button className="destination-plannerControl-button" onClick={() => { handleAddToMyCourse() }}>내 코스로 담기</button>
                        )
                        }
                    </div >

                </div >

                {
                    destinations.length > 0 ? (
                        destinations.map((destination, index) => {
                            const isNewDay = index === 0 || destination.day !== destinations[index - 1].day;
                            const prevDestination = destinations[index - 1];
                            const distance = prevDestination ? calculateDistance(prevDestination.y, prevDestination.x, destination.y, destination.x) : 0;



                            return (
                                // 플래너의 코스 상세
                                <div key={index} className="destination-card">

                                    <ul className="destination-card-ul">
                                        {isNewDay && (
                                            <div>
                                                <p className="destination-day" style={{ color: `${dayColors[(destination.day - 1) % dayColors.length]}` }}>
                                                    Day {destination.day}

                                                </p>

                                            </div>
                                        )}
                                        {/* 경로 보기 버튼을 Day가 넘어갔을 때 제외하고 생성 */}
                                        {!isNewDay && (
                                            <div className="destination-distance">
                                                <span className="destination-distance-span">총 {distance.toFixed(2)} km</span>

                                                <button className="destination-distance-button" onClick={() => window.open(getDirections(prevDestination, destination), '_blank')}> <img className="icon" src={findwayIcon}></img></button>

                                            </div>
                                        )}

                                        <li className="destination-info">
                                            <p className="destination-dayOrder">{destination.dayOrder}</p>
                                            {!isNewDay && (
                                                <div className="line"></div>
                                            )}
                                            <span className="destination-image">
                                                <img src={destination.image} alt="destination" />
                                            </span>
                                            <div className="destination-desc">
                                                <p className="destination-category">{destination.category}</p>
                                                <p className="destination-title">{destination.name}</p>
                                                <p className="destination-address">{destination.address}</p>
                                            </div>
                                        </li>

                                    </ul>
                                </div>
                            );

                        })
                    ) : (
                        <p>등록된 여행지가 없습니다.</p>
                    )
                }
            </div >
            <div id="main-map" className="destination-map"></div>
        </>
    );
};

export default Destination;
