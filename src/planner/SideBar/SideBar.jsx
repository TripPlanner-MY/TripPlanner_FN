import { useState, useEffect, useRef } from 'react';
import PlannerDate from '../PlannerDate/PlannerDate';
import axios from 'axios';
import './SideBar.scss';
import {useNavigate, useLocation} from 'react-router-dom';
import Logo from '../../images/logoImage.png';
import NoImage from '../../images/noImage.png';

const SideBar = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useRef(false);
  const isMountedSearch = useRef(false);
  const updateData = { ...location.state };
  const bringData = { ...location.state };
  const [plannerID,setPlannerID] = useState(0);

  const [titleState, setTitleState] = useState(true);
  const [dateState, setDateState] = useState(false);
  const [listState, setListState] = useState(false);

  const [day, setDay] = useState(0);
  const [area, setArea] = useState();
  const [selectedDay, setSelectedDay] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [word, setWord] = useState('');
  const [search, setSearch] = useState([]);
  const [typeState, setTypeState] = useState('관광지');
  const [areaName, setAreaName] = useState(null);
  const [areaCode, setAreaCode] = useState();

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [resultsPerPage] = useState(10); // 한 페이지에 표시할 결과 수
  const [pagesToShow] = useState(5); // 한 번에 표시할 페이지 번호 개수

  const [images, setImages] = useState([]);

  
  // 지역정보 저장
  const handleArea = (data) => {
    setArea(data);
  };

  // 몇박인지 저장
  const handleDate = (data) => {
    setDay(data);
  };

  const handleStateTitle = () => {
    setTitleState(true);
    setDateState(false);
    setListState(false);
  };

  // 달력 및 지역 선택 활성화
  const handleStateDate = () => {
    if (!title) {
      setTitle('My Planner');
    }
    if (!description) {
      setDescription("My Planner's Description");
    }
    setTitleState(false);
    setDateState(true);
    setListState(false);
  };

  // 플래너 리스트 활성화
  const handleStatePlanner = () => {
    setTitleState(false);
    setDateState(false);
    setListState(true);
  };

  // N일차를 눌렀을 때 부모 컴포넌트로 N을 전달, 본인 상태에도 저장
  const handleSelect = (data) => {
    setSelectedDay(data);
    props.DayState(data);
  };

  // 검색을 위한 지역명 받아오기
  const handleAreaName = (data) => {
    setAreaName(data);
  };

  // 검색
  const handleSearch = () => {
    if(typeState=='관광지') {
      axios.post('https://www.tripplannerbn.shop/planner/searchDestination',
          { type: typeState, word: encodeURIComponent(word.trim()), areaname: areaName, areacode: areaCode, pageNo: currentPage, },
          { 'Content-Type': 'application/json' }
        )
        .then((resp) => {
          const pTotal = resp.data.data.totalCount;
          const currentPageData = resp.data.data.items.item;
          const updatedSearch = new Array(pTotal).fill(null);

          const startIndex = (currentPage - 1) * resultsPerPage;
          const endIndex = startIndex + currentPageData.length;

          currentPageData.map((el,index)=>{
            if(el.areacode==areaCode) {
              const data = {
                name:el.title,
                category:'관광지',
                address:el.addr1,
                description:'',
                image:el.firstimage,
                x:el.mapx,
                y:el.mapy
              }
              updatedSearch[startIndex + index] = data;
            }
          })
          setSearch(updatedSearch || []);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
  .post(
    'http://localhost:9000/planner/searchDestination',
    { type: typeState, word: word, areaname: areaName },
    { 'Content-Type': 'application/json' }
  )
  .then((resp) => {
    var searchData = resp.data.data;
    const startIndex = (currentPage - 1) * resultsPerPage;
    const currentPageData = searchData.slice(startIndex, startIndex + resultsPerPage);

    // 비동기 작업 처리
    Promise.all(
      currentPageData.map(async (el, index) => {
        try {
          const imageResp = await axios.post('http://localhost:9000/planner/getImages', {
            businessName: el.name,
          });
          searchData[startIndex + index].image = imageResp.data.image; 
        } catch (error) {
          searchData[startIndex + index].image = null; // 실패 시 기본값
        }
      })
    ).then(() => {
      setSearch(searchData || []);
    });
  })
  .catch((err) => {
    console.error(err);
  });

    }
  };

  // 검색한 장소 플래너에 추가
  const handleSearchAdd = (event, data) => {
    event.stopPropagation();
    props.AddDestination({ day: selectedDay, data: data});
  };

  // Day버튼을 눌렀을 때 상황에 따른 이벤트
  const alertDay = () => {
    if (listState) {
      handleStateDate();
    } else if (!dateState) {
      alert('이전 단계를 완료하세요.');
    }
  };

  // Planner버튼을 눌렀을 때 상황에 따른 이벤트
  const alertList = () => {
    if (!listState) {
      alert('이전 단계를 완료하세요.');
    }
  };

  // DB에 플래너 추가
  const addPlanner = async () => {
    if (!listState) {
      alert('이전 단계를 완료하세요.');
    } else {
      if (props.DestinationData.length === 0) {
        alert('경로를 지정해주세요.');
      } else {
        if(plannerID==0) {
          await axios.post('http://localhost:9000/planner/addPlanner',
              {
                title: title,
                areaName: areaName,
                description: description,
                isPublic: isPublic,
                destination: props.DestinationData,
                day: day,
                userid: props.CookieData.userid,
              },
              { 'Content-Type': 'application/json' }
            )
            .then((resp) => {
              alert('플래너를 성공적으로 작성하였습니다!');
              navigate('/');
            })
            .catch((err) => {
              console.log(err);
              alert('플래너를 작성하지 못했습니다.');
            });
        } else {
          await axios.post('http://localhost:9000/planner/updatePlanner',
            {
              title: title,
              areaName: areaName,
              description: description,
              isPublic: isPublic,
              destination: props.DestinationData,
              day: day,
              userid: props.CookieData.userid,
              plannerid: plannerID,
            },
            { 'Content-Type': 'application/json' }
          )
          .then((resp) => {
            alert('플래너를 성공적으로 수정하였습니다!');
            navigate('/planner/board');
          })
          .catch((err) => {
            console.log(err);
            alert('플래너를 수정하지 못했습니다.');
          });
        }
      }
    }
  };

  // 몇박인지 결정되면 리스트로 넘어가게끔 설정
  useEffect(() => {
    if (isMounted.current) {
      handleStatePlanner();
    } else {
      isMounted.current = true;
    }
  }, [day]);

  // 지역이 선택되면 지역정보를 부모 컴포넌트로 전달
  useEffect(() => {
    if (isMounted.current) {
      props.AreaCoordinate(area);
    } else {
      isMounted.current = true;
    }
  }, [area]);

  useEffect(()=>{
    if(areaName) {
      if(areaName=='서울') {
        setAreaCode('1')
      } else if(areaName=='인천') {
        setAreaCode('2')
      } else if(areaName=='대전') {
        setAreaCode('3')
      } else if(areaName=='대구') {
        setAreaCode('4')
      } else if(areaName=='광주') {
        setAreaCode('5')
      } else if(areaName=='부산') {
        setAreaCode('6')
      } else if(areaName=='울산') {
        setAreaCode('7')
      } else if(areaName=='세종') {
        setAreaCode(areaName=='8')
      } else if(areaName=='경기') {
        setAreaCode('31')
      } else if(areaName=='강원도') {
        setAreaCode('32')
      } else if(areaName=='충청북도') {
        setAreaCode('33')
      } else if(areaName=='충청남도') {
        setAreaCode('34')
      } else if(areaName=='경상북도') {
        setAreaCode('35')
      } else if(areaName=='경상남도') {
        setAreaCode('36')
      } else if(areaName=='전라북도') {
        setAreaCode('37')
      } else if(areaName=='전라남도') {
        setAreaCode('38')
      } else if(areaName=='제주') {
        setAreaCode('39')
      } else {
        setAreaCode(null);
      }
    }
  },[areaName])

  useEffect(()=>{
    if (isMountedSearch.current) {
      handleSearch();
    } else {
      isMountedSearch.current = true;
    }  
  },[areaCode])

  useEffect(()=>{
    if (isMountedSearch.current) {
      handleSearch();
    } else {
      isMountedSearch.current = true;
    }  
  },[currentPage])

  
  // 페이징 로직 ---------------------------------------------------------------------------------------
  // 검색 결과를 현재 페이지에 맞게 잘라서 표시
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = search.slice(indexOfFirstResult, indexOfLastResult)


  // 총 페이지 수 계산
  const totalPages = Math.ceil(search.length / resultsPerPage);

  // 보여줄 페이지 범위 계산
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const startPage = Math.floor((currentPage - 1) / pagesToShow) * pagesToShow + 1;
  const endPage = Math.min(startPage + pagesToShow - 1, totalPages);

  // 페이지 변경 함수
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // "Previous" 버튼 클릭
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - pagesToShow);
    }
  };

  // "Next" 버튼 클릭
  const handleNext = () => {
    if (currentPage + pagesToShow <= totalPages) {
      setCurrentPage(currentPage + pagesToShow);
    }
  };

  useEffect(()=>{
      if(Object.keys(updateData).length > 0 && Object.keys(updateData)[0]=='updateData'){
        setTitle(updateData.updateData.title);
        setDescription(updateData.updateData.description)
        setIsPublic(updateData.updateData.isPublic)
        setDay(updateData.updateData.day)
        setAreaName(updateData.updateData.areaName)
        setPlannerID(updateData.updateData.plannerid);

        const transformData = (data) => {
          return data.map(item => ({
              day: item.day,
              data: {
                  name: item.name,
                  x: item.x,
                  y: item.y,
                  locationFullAddress: item.address,
                  address: item.address,
                  category: item.category,
                  image: item.image,
              },
              image: item.image
          }));
      };
      props.UpdatePlanner(transformData(updateData.updateData.destinations));
    }
    if(Object.keys(bringData).length > 0 && Object.keys(bringData)[0]=='bringData'){

      setTitle(bringData.bringData.title);
      setDescription(bringData.bringData.description)
      setIsPublic(bringData.bringData.isPublic)
      setDay(bringData.bringData.day)
      setAreaName(bringData.bringData.areaName)
      setPlannerID(0);

      const transformData = (data) => {
        return data.map(item => ({
            day: item.day,
            data: {
                name: item.name,
                x: item.x,
                y: item.y,
                locationFullAddress: item.address,
                address: item.address,
                category: item.category,
                image: item.image,
            },
            image: item.image
        }));
    };
    props.UpdatePlanner(transformData(bringData.bringData.destinations));
  }
  },[])

  return (
    <>
      <div className="sidebar">
        <div className="option">
          <div 
            className="optionButton"
            onClick={()=>navigate('/')}
          >
            <img className='sidebar-logo' src={Logo} alt="" />
          </div>
          <div 
            className="optionButton"
            onClick={handleStateTitle}>
            <span>Title</span>
          </div>

          <div className="optionButton" onClick={alertDay}>
            <span>Day & Area</span>
          </div>

          <div className="optionButton" onClick={alertList}>
            <span>Planner</span>
          </div>

          <div className="optionButton" onClick={addPlanner}>
            <span>Complete!</span>
          </div>
        </div>
        {(
          <div className="question">
            <p>SEARCH</p>
            <div className='question-search'>
              <input type="text" value={word} onChange={(e) => { setWord(e.target.value); }} />
              <button onClick={handleSearch}>검색</button>
            </div>
            { totalPages>0 && 
                <span className='total-page'>{currentPage}/{totalPages}</span>
            }
            <div className='search-btns'>
              <button 
                className={`search-btn ${typeState === "식당" ? "active" : ""}`} 
                onClick={(e) => { setTypeState(e.target.innerText); }}
              >
                식당
              </button>
              <button 
                className={`search-btn ${typeState === "숙소" ? "active" : ""}`} 
                onClick={(e) => { setTypeState(e.target.innerText); }}
              >
                숙소
              </button>
              <button 
                className={`search-btn ${typeState === "관광지" ? "active" : ""}`} 
                onClick={(e) => { setTypeState(e.target.innerText); }}
              >
                관광지
              </button>
            </div>
            <div className="search-body">
              <ul>
                { search && search.length > 0 && typeState=='관광지' && currentResults.map((el, index) => {
                  console.log('image안나오는거보기',el);
                  return (
                    <li key={index}
                      className="search-card"
                      onClick={()=>{props.ClickSearch(el)}}
                    >
                      <div className="card-image">
                              {el && el.image!='No image found' && <img src={el.image} alt="" />}
                              {el && el.imgae=='No image found' && <img src={NoImage} alt="" />}
                      </div>
                      <div className='card-body'>
                        <div className="card-name">{el && el.name}</div>
                        <div className="card-category">{el && el.category}</div>
                        <div className="card-addr">{el && el.address}</div>
                        <div className="card-desc">{el && el.description}</div>
                      </div>
                      <div>
                        <button onClick={(event) => { handleSearchAdd(event, el); }}>+</button>
                      </div>
                    </li>
                  );
                })}
                {search && search.length > 0 && typeState!='관광지' && currentResults.map((el, index) => {
                  return (
                    <li key={index}
                      className="search-card"
                      onClick={()=>{props.ClickSearch(el)}}
                    >
                      <div className="card-image">
                        {el && el.image!='No image found' && <img src={el.image} alt="" />}
                        {el && el.imgae=="" && <img src={NoImage} alt="" />}
                      </div>
                      <div className='card-body'>
                        <div className="card-name">{el && el.name}</div>
                        <div className="card-category">{el && el.category}</div>
                        <div className="card-addr">{el && el.address}</div>
                        <div className="card-desc">{el && el.description}</div>
                      </div>
                      <div>
                        <button onClick={(event) => { handleSearchAdd(event,el); }}>+</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            { search.length !=0 &&
              <div className="pagination">
                <button onClick={()=>{handlePrevious(); }} disabled={currentPage === 1}>Previous</button>
                <span>
                  {pageNumbers.slice(startPage - 1, endPage).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => {paginate(pageNumber); }}
                      className={pageNumber === currentPage ? 'active' : ''}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </span>
                <button
                  onClick={()=>{handleNext(); }}
                  disabled={currentPage + pagesToShow > totalPages}
                >
                  Next
                </button>
              </div>
            }
          </div>
        )}
        <div className="content">
          {titleState && (
            <div className="title">
              <label htmlFor="">플래너 제목</label>
              <input type="text" onChange={(e) => setTitle(e.target.value)} value={title} />
              <label htmlFor="">설명</label>
              <input type="text" onChange={(e) => setDescription(e.target.value)} value={description} />
              <div className='share-check'>
                <label htmlFor="">다른 사람에게 Planner를 공유하시겠습니까?</label>
                <input
                  id="title-checkbox"
                  type="checkbox"
                  onChange={(e) => setIsPublic(e.target.checked)}
                  checked={isPublic}
                />
                <label className='check-label' htmlFor="title-checkbox"></label>
              </div>
              <div className='btn-div'>
                <button onClick={handleStateDate}>다음</button>
              </div>
            </div>
          )}
          {dateState && (
            <div className="date">
              <PlannerDate AreaData={handleArea} DayData={handleDate} AreaNameData={handleAreaName} State={()=>{handleStatePlanner()}}/>
            </div>
          )}
          {listState && (
            <>
            <div className="content-planner">
              <div className='plannerMenu' >
                <p> Planner </p>
                <button 
                  onClick={() => props.DeleteAllDestination()}
                  className="delete-destination-btn"
                >
                  비우기
                </button>
              </div>
              <div className="plannerList">
                <div className="content-side">
                  {(() => {
                    const nthDay = [];
                    for (let i = 1; i <= day; i++) {
                      nthDay.push(
                        <div key={i} className="optionButton" onClick={() => { handleSelect(i) }}>
                          <span>{`${i}일차`}</span>
                        </div>
                      );
                    }
                    return nthDay;
                  })()}
                </div>
                <div className="content-body">
                  {selectedDay && (
                    <ul>
                      {props.DestinationData.length > 0 && props.DestinationData.filter((el) => el.day === selectedDay).map((destination, index) => {
                        return (
                          <li key={index} 
                            className="content-card"
                            onClick={()=>{props.ClickPlanner(destination)}}
                          >
                            <div className="card-image">
                              {destination && destination.data.image==null && destination.data.image=='No image found' && <img src={NoImage} alt="" />}
                              {destination && destination.data.image!=null && destination.data.image!='No image found' && <img src={destination.data.image} alt="" />}
                            </div>
                            <div className="card-content">
                              <div className="card-header">
                                  <div className="card-name">{destination && destination.data.name}</div>
                                  <div className="card-category">{destination && destination.data.category}</div>
                                  <div className="card-addr">{destination && destination.data.address}</div>
                                <div className='card-button'><button onClick={(event) => props.DeleteDestination(event,selectedDay, index)}>제거</button></div>
                              </div>
                              <div className="card-desc">{destination && destination.data.description}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </>          
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;