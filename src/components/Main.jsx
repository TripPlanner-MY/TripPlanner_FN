
import { Link } from 'react-router-dom';
import './Main.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Main = () => {
    const [totalPlans,setTotalPlans] = useState(0); //여행 계획 수 상태

    useEffect(()=>{
        axios.get('https://www.tripplannerbn.shop/planner/plans/total')
        .then((response)=>{
            setTotalPlans(response.data); //서버에서 받은 총 개수 설정
        })
        .catch((error)=>{
            console.error("여행 계획 조회 실패",error);
        });
    },[]);

    return (
        <div className="main-wrapper">

            <h2 className="main-title">
                여행계획 고민중이세요?  <br />
                <br />

                다른 사람에게 추천받아보세요!

            </h2>

            <Link to="/makePlanner">
                <button className="main-makeplanner-btn">여행 계획 만들기</button>
            </Link>
            <Link to="/planner/board">
                <button className="main-board-btn">다른 여행계획 보러 가기</button>
            </Link>

            {/* 여행 계획 수 표시 */}
            <div className='total-plans-display'>
                총 생성된 여행 계획 수: <strong>{totalPlans}</strong>
            </div>

        </div>
    )

}

export default Main