
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';
import LogoImage from '../images/footPrint.png';
import axios from 'axios';
import { useState, useEffect } from "react";


const Header = () => {
    const location = useLocation();

    const [isLogin, setIsLogin] = useState(false);

    // 쿠키를 통한 로그인 상태 확인
    useEffect(() => {
        // 쿠키를 포함한 요청을 통해 로그인 상태 확인
        axios
            .post(
                "https://www.tripplannerbn.shop/api/cookie/validate",
                {},
                { withCredentials: true }
            )
            .then((response) => {
                console.log("쿠키 확인:", response.data);
                // 쿠키가 유효하면 로그인 상태로 설정
                setIsLogin(true);
            })
            .catch((error) => {
                console.error("쿠키 오류:", error);
                setIsLogin(false); // 인증 실패 시 로그인 상태 false로 설정
            });
    }, []);


    // 특정 경로에서는 Header를 표시하지 않음
    if (location.pathname === '/planner/board/destination') {
        return null;
    }
    if (location.pathname === '/makePlanner') {
        return null;
    }

    return (
        <header className="header-wrapper">

            <Link className="header-logo" to="/">
            <div className="logo-wrapper">
                    <span className="logo-text">여행가자</span>
                    <img className="logo-icon" src={LogoImage} alt="Plane Icon" />
                </div>
            </Link>


            <div className="header-btns">
                <Link to="/tourist">
                    <button className="tourist-btn">관광지</button>
                </Link>

                <Link to="/travelcourse">
                    <button className="travelcourse-btn">여행코스</button>
                </Link>


                {/* 로그인 여부에 따라 표시될 버튼 */}
                {!isLogin ? (
                    <>
                        <Link to="/user/login">
                            <button className="login-btn">로그인</button>
                        </Link>
                        <Link to="/user/join">
                            <button className="join-btn">회원가입</button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/user/mypage">
                            <button className="join-btn">마이페이지</button>
                        </Link>

                        <Link to="/user/logout">
                            <button className="logout-btn">로그아웃</button>
                        </Link>
                    </>
                )}




            </div>

        </header>
    );
};

export default Header;
