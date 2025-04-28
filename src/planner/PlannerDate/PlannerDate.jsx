import React, { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // 기본 스타일
import "react-date-range/dist/theme/default.css"; // 테마 스타일
import "./PlannerDate.scss";

const PlannerDate = (props) => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false); // 팝업 열림 여부
  const [inputValue, setInputValue] = useState(""); // 날짜 입력 필드 값
  const [area, setArea] = useState([126.9779692, 37.566535]); // 선택된 지역 좌표
  const [areaName, setAreaName] = useState("서울");

  const today = new Date(); // 오늘 날짜 계산
  today.setHours(0, 0, 0, 0); // 시간 초기화

  const areaCoordinate = [
    { value: [0, 0], name: "도시를 선택하세요" },
    { value: [126.9779692, 37.566535], name: "서울" },
    { value: [129.05562775, 35.1379222], name: "부산" },
    { value: [126.7052062, 37.4562557], name: "인천" },
    { value: [128.601445, 35.8714354], name: "대구" },
    { value: [127.3845475, 36.3504119], name: "대전" },
    { value: [126.8526012, 35.1595454], name: "광주" },
    { value: [129.3113596, 35.5383773], name: "울산" },
    { value: [127.5183, 37.4138], name: "경기도" },
    { value: [128.18161, 37.142803], name: "충청북도" },
    { value: [127.1516, 36.8075], name: "충청남도" },
    { value: [126.991, 34.8679], name: "전라남도" },
    { value: [127.153, 35.7175], name: "전라북도" },
    { value: [128.8889, 36.4919], name: "경상북도" },
    { value: [128.2132, 35.4606], name: "경상남도" },
    { value: [128.1555, 37.8228], name: "강원도" },
    { value: [126.794586, 33.532237], name: "제주" },
  ];

  useEffect(() => {
    setShowCalendar(true); // 페이지 로드 시 달력 팝업 창 열기
  }, []);

  const handleDateChange = (ranges) => {
    const startDate = ranges.selection.startDate;
    const endDate = ranges.selection.endDate;
    const diffDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    if (startDate < today || endDate < today) {
      alert("오늘 이전의 날짜는 선택할 수 없습니다.");
      return;
    }

    if (diffDays > 10) {
      alert("날짜는 최대 10일까지 선택 가능합니다.");
      return;
    }

    setState([ranges.selection]);
  };

  const handleSelect = (e) => {
    const data = e.target.value;
    if (data != null) {
      const selectedArea = areaCoordinate.find(
        (item) => item.value.toString() === data.toString()
      ).name;

      setArea(data.split(","));
      setAreaName(selectedArea);
    }
  };

  const handleConfirm = () => {
    const startDate = state[0].startDate;
    const endDate = state[0].endDate;

    const formattedDate = `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`;
    setInputValue(formattedDate);
    setShowCalendar(false); // 팝업 닫기
  };

  const handleNext = async () => {
    const startDate = state[0].startDate;
    const endDate = state[0].endDate;

    if (!area || area === "도시를 선택하세요") {
      alert("지역을 선택해주세요.");
      return;
    }
    // 날짜 데이터 전달
    props.DayData(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1
    );
    props.AreaData(area);
    props.AreaNameData(areaName);
    props.State();
  };

  return (
    <div className="planner-date-container">
      <h1>날짜 및 지역 선택</h1>
      <h2>날짜 선택</h2>
      <div className="calendar-box">
        <input
          type="text"
          value={inputValue}
          placeholder="날짜를 선택하세요"
          readOnly
          onClick={() => setShowCalendar(true)} // 팝업 열기
          style={{ cursor: "pointer" }}
        />
      </div>
      {showCalendar && (
        <div className="calendar-popup">
          <div
            className="calendar-popup-overlay"
            onClick={() => setShowCalendar(false)}
          ></div>
          <div className="calendar-popup-content">
            <DateRangePicker
              ranges={state}
              onChange={handleDateChange}
              editableDateInputs={true}
              moveRangeOnFirstSelection={false}
              minDate={today} // 오늘 이전 날짜 비활성화
              months={2}
              direction="horizontal"
              rangeColors={["#3ecf8e"]}
              staticRanges={[]} // 모든 프리셋 버튼 제거
              inputRanges={[]} // 모든 입력 버튼 제거
            />
            <button className="confirm-button" onClick={handleConfirm}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 지역 선택 */}
      <div className="area">
        <h2>지역 선택</h2>
        <select onChange={handleSelect} value={area != null && area}>
          {areaCoordinate.map((item, index) => {
            return (
              <option value={item.value} key={index}>
                {item.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="areaBtn">
        <button onClick={handleNext}>다음</button>
      </div>
      
    </div>
  );
};

export default PlannerDate;
