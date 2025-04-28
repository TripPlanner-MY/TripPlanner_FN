import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Tourist.scss';
import touristJson from './jsonFile/tourist.json';

const Tourist = () => {
    const [regionFilter, setRegionFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [hashtagOptions, setHashtagOptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [touristData, setTouristData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [totalCount, setTotalCount] = useState(0);  // totalCount를 숫자형으로 초기화
    const [arrange, setArrange] = useState('O');
    const navigate = useNavigate();

    // regions 객체를 사용하여 옵션을 생성
    const regionOptions = Object.entries(touristJson.regions).map(([code, label]) => ({
        value: code,
        label: label,
    }));

    // categorys 객체를 사용하여 옵션을 생성
    const categoryOptions = Object.entries(touristJson.categorys).map(([code, label]) => ({
        value: code,
        label: label,
    }));

    // 지역 이름을 가져오는 함수
    const getRegionName = (regionCode) => {
        return touristJson.regions[regionCode] || '알 수 없음'; // 해당 지역 코드가 없으면 기본값 '알 수 없음'
    };

    // 해시태그를 가져오는 함수 (cat2 값에 따라)
    const getHashtag = (cat2) => {
        return touristJson.categorys[cat2] || '기타'; // 해당 category가 없으면 기본값 '기타'
    };

    // 검색어를 URL 인코딩하는 함수
    const encodeUTF8 = () => {
        return encodeURIComponent(searchKeyword.trim());
    };

    // 관광지 검색 함수
    const handleSearch = () => {
        setLoading(true); // 검색 시작 시 로딩 상태 true로 설정

        const currentEncodedData = encodeUTF8();
        const data = {
            keyword: currentEncodedData,  // 원하는 키워드 데이터를 넣어야 합니다.
            pageNo: currentPage,
            hashtag: categoryFilter,  // 해시태그 필터가 있다면 설정
            regionCode: regionFilter,
            arrange: arrange,  // 원하는 정렬 방식
            contentTypeId: '12',  // 필요에 맞게 설정
        };

        axios.post('https://www.tripplannerbn.shop/api/getSearch', data, {

            headers: {
                'Content-Type': 'application/json', // Content-Type을 JSON으로 설정
            },
            withCredentials: true,
        })
            .then((response) => {
                console.log('response : ', response);
                setTouristData(response.data.items.item || []); // 빈 배열로 안전하게 설정
                setTotalCount(Number(response.data.totalCount));  // totalCount를 숫자로 설정
                setLoading(false); // 로딩 상태 false로 설정
            })

            .catch((error) => {
                console.error('Error fetching courses:', error);
                setLoading(false); // 에러가 나도 로딩 상태 false로 설정
            });
    };

    // 여행 코스 클릭시 상세 페이지로 데이터 전달
    const handleTouristClick = (contentId) => {
        setLoading(true); // 로딩 시작
       
        navigate(`/tourist-info?contentId=${contentId}`);
    };

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

    // 페이지 변경 함수
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        handleSearch(); // 페이지가 변경되면 다시 검색
    }, [currentPage, arrange]); // c
    // urrentPage, arrange가 변경될 때마다 호출

    const totalPages = totalCount ? Math.ceil(totalCount / 10) : 0; // 한 페이지에 10개씩 표시

    return (
        <div className="tourist-wrapper">
            <div className="tourist-content">
                <h1 className="tourist-title">관광지 정보</h1>
                <div className="tourist-header">
                    {/* 카테고리 필터 */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">카테고리 선택</option>
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* 지역 필터 */}
                    <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">지역 선택</option>
                        {regionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>


                    {/* 검색어 입력 */}
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="search-input"
                    />

                    <button onClick={handleSearch} className="search-button">검색</button>
                </div>
                <div className="total-check">
                    <p className="total-count">총 {totalCount}개 코스</p>

                    {/* 현재 페이지 / 총 페이지 표시 */}
                    {totalPages > 0 && (
                        <p className="page-info">
                            {currentPage} / {totalPages} 페이지
                        </p>
                    )}
                    {/* 정렬 방식 */}
                    <select
                        className="sort-select"
                        value={arrange}
                        onChange={(e) => setArrange(e.target.value)} // 상태만 업데이트
                    >
                        <option value="O">제목순</option>
                        <option value="Q">수정일순</option>
                        <option value="R">생성일순</option>
                    </select>
                </div>

                <div>
                    {loading ? (
                        <div className="loading-message">로딩 중...</div>
                    ) : (
                        <div className="travel-course-list-content">
                            {touristData.map((tourist) => {
                                const regionName = getRegionName(tourist.areacode); // 지역 이름 가져오기
                                const hashtag = getHashtag(tourist.cat3); // 해시태그 가져오기

                                return (
                                    <div key={tourist.contentid} className="travel-course-list" onClick={() => handleTouristClick(tourist.contentid)}>
                                        {tourist.firstimage && (
                                            <img
                                                src={tourist.firstimage}
                                                alt={tourist.title}
                                                className="travel-course-list__img"
                                            />
                                        )}
                                        <h4 className="course-title">{tourist.title}</h4>
                                        <div className="course-box">
                                            {/* 지역 */}
                                            <p className="course-region">{regionName}</p>
                                            {/* 코스 태그 */}
                                            <p className="course-hashtag">{hashtag}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* 페이지네이션 버튼들 */}
            <div className="tourist-pagination">
                {/* 페이지네이션 */}
                {totalPages > 0 && createPageButtons(totalPages)}
            </div>
        </div>
    );
};

export default Tourist;
