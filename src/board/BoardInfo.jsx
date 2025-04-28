import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import DestinationDetails from './DestinationDetails.jsx';
// import Comments from './Comments';
import './Destination.scss';
import Destination from './Destination.jsx';
import LogoImage from '../images/logoImage.png';
import LogoTitle from '../images/logotitle.png';


const Destination1 = () => {
    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");
    const { plannerItem } = location.state || {}; // state에서 데이터 가져오기 (Planner의 정보)
    const [destinations, setDestinations] = useState([]);
    const [loginStatus, setLoginStatus] = useState([]);
    const [activeTab, setActiveTab] = useState("summary");  // 현재 활성화된 탭을 관리

    useEffect(() => {
        // 데이터를 가져오는 로직
        axios.get(`https://www.tripplannerbn.shop/planner/board/destination?plannerID=${plannerID}`)
            .then((response) => {

                setDestinations(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });

        // 로그인 상태 확인
        axios.post('https://www.tripplannerbn.shop/api/cookie/validate', {}, { withCredentials: true })
            .then(response => setLoginStatus(response.data))
            .catch(error => setLoginStatus(error));
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="destination-wrapper">
            {/* 탭 버튼 */}

            <ul className="destinaion-depth">
                <li>
                    <Link className="header-logo" to="/">
                        <img className="logoImage" src={LogoImage} alt="logo"></img>
                        <img className="logoTitle" src={LogoTitle} alt="logo"></img>
                    </Link>
                </li>

                {/* 전체정보 누를 시 Destination 페이지 표시 (Default) */}
                <li
                    onClick={() => handleTabChange("summary")}
                    className={activeTab === "summary" ? "ACTIVE" : ""}
                >
                    전체정보
                </li>

                {/* 세부정보 누를 시 DestinatinoDetails 페이지 표시 */}
                <li
                    onClick={() => handleTabChange("details")}
                    className={activeTab === "details" ? "ACTIVE" : ""}
                >
                    세부정보
                </li>

            </ul>

            {/* 탭에 따라 컴포넌트 렌더링 */}
            {activeTab === "summary" && <Destination plannerItem={plannerItem} />}
            {activeTab === "details" && <DestinationDetails plannerItem={plannerItem} destinations={destinations} />}

        </div>
    );

}

export default Destination1;
