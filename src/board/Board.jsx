import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './Board.scss';

const Board = () => {
    const [planners, setPlanners] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const pageSize = 8; // 한 페이지에 표시할 아이템 수

    const navigate = useNavigate();

    const handlePlannerClick = (plannerID) => {
        const plannerItem = planners.find((item) => item.plannerID === plannerID);
        navigate(`destination?plannerID=${plannerID}`, { state: { plannerItem } });
    };

    const fetchPlanners = (page) => {
        axios.get(`https://www.tripplannerbn.shop/planner/board?page=${page - 1}&size=${pageSize}`)
            .then((response) => {
                setPlanners(response.data.content); // 데이터 리스트
                setTotalPages(response.data.totalPages); // 전체 페이지 수
            })
            .catch((error) => {
                console.error("Error fetching planners:", error);
            });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchPlanners(page);
    };

    useEffect(() => {
        fetchPlanners(currentPage);
    }, [currentPage]);

    // 페이지네이션 버튼 생성 함수
    const createPageButtons = (totalPages) => {
        const maxVisibleButtons = 5; // 한 번에 보이는 최대 버튼 수
        const currentBlock = Math.floor((currentPage - 1) / maxVisibleButtons); // 현재 블록 계산
        const startPage = currentBlock * maxVisibleButtons + 1; // 현재 블록의 시작 페이지
        const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages); // 현재 블록의 마지막 페이지

        const buttons = [];

        // '처음' 버튼
        if (currentPage > 1) {
            buttons.push(
                <button key="first" onClick={() => handlePageChange(1)}>처음</button>
            );
        }

        // '이전' 버튼
        if (currentBlock > 0) {
            buttons.push(
                <button key="prev" onClick={() => handlePageChange(startPage - 1)}>이전</button>
            );
        }

        // 현재 블록 기준으로 버튼 생성
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    className={i === currentPage ? 'active' : ''}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // '다음' 버튼
        if (endPage < totalPages) {
            buttons.push(
                <button key="next" onClick={() => handlePageChange(endPage + 1)}>다음</button>
            );
        }

        // '끝' 버튼
        if (currentPage < totalPages) {
            buttons.push(
                <button key="last" onClick={() => handlePageChange(totalPages)}>끝</button>
            );
        }

        return buttons;
    };

    return (
        <div className="board">
            <div className="board-wrapper">
                {/* <h1 className="board-title">다른 유저의 여행 계획을 확인해 보세요!</h1> */}

                <div className="planner-content">
                    {planners.map(planner => (
                        <div
                            key={planner.plannerID}
                            className="planner-item"
                            onClick={() => handlePlannerClick(planner.plannerID)}
                        >
                            <div className="planner-thumbnail">
                                <img src={planner.thumbnailImage} alt="플래너 썸네일" />
                            </div>
                            <div className="planner-info">
                                <h3 className="planner-title">{planner.plannerTitle}</h3>
                                <p className="planner-username">작성자 : {planner.username}</p>
                                <p className="planner-duration">
                                    {planner.day === 1
                                        ? "당일"
                                        : `${planner.day - 1}박 ${planner.day}일`}
                                </p>
                                <p className="planner-created-at">작성일 {new Date(planner.createAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 페이징 버튼 */}
                <div className="board-pagination">
                    {createPageButtons(totalPages)}
                </div>
            </div>
        </div>
    );
};

export default Board;
