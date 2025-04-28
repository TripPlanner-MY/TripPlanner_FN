
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import TravelCourse from '../tourist/TravelCourse.jsx';
import TravelCourseInfo from '../tourist/TravelCourseInfo.jsx';
import Tourist from '../tourist/Tourist.jsx';
import TouristInfo from '../tourist/TouristInfo.jsx';
import Board from '../board/Board.jsx';
import MakePlanner from '../planner/makePlanner/MakePlanner.jsx';
import LoginForm from '../login/LoginForm.jsx';
import Join from '../Join/Join.jsx';
import Mypage from '../mypage/Mypage.jsx';
import Main from './Main.jsx';
import BoardInfo from '../board/BoardInfo.jsx';
import PrivateRoute from '../auth/PrivateRoute.jsx';
import Logout from '../login/Logout.jsx';
import ForgotPage from '../login/ForgotPage.jsx';
import FindIdPage from '../login/components/FindIdPage.jsx';
import UseridInputPage from '../login/components/UseridInputPage.jsx';
import EmailAuthPage from '../login/components/EmailAuthPage.jsx';
import VerifyCodePage from '../login/components/VerifyCodePage.jsx';
import PasswordResetPage from '../login/components/PasswordResetPage.jsx';
import SocialLoginHandler from '../login/SocialLoginHandler.jsx';


const Body = () => {


    return (

        <Routes>

            {/* 메인 페이지 */}
            <Route path="/" element={<Main />}></Route>

            {/* 회원가입 페이지 */}
            <Route path="/user/join" element={<Join />}> </Route>

            {/* 로그인 */}
            <Route path="/user/login" element={<LoginForm />}></Route>
            <Route path="/user/logout" element={<Logout />}></Route>
            <Route path="/forgot" element={<ForgotPage />}></Route>
            <Route path="/find-id" element={<FindIdPage />}></Route>
            <Route path="/find-password" element={<UseridInputPage />}></Route>
            <Route path="/email-auth" element={<EmailAuthPage />}></Route>
            <Route path="/verify-code" element={<VerifyCodePage />}></Route>
            <Route path="/reset-password" element={<PasswordResetPage />}></Route>
            <Route path="/oauth2/success" element={<SocialLoginHandler />}></Route>

            {/* 계획 생성 */}
            <Route path="/makePlanner" element={<PrivateRoute element={<MakePlanner />} />} />

            {/* 마이 페이지 */}
            <Route path="user/mypage" element={<Mypage />}></Route>

            {/* 플래너 생성 */}
            <Route path="/makePlanner" element={< MakePlanner />}></Route>

            {/* 관광지 코스 */}
            <Route path="/travelcourse" element={< TravelCourse />}></Route>

            {/* 관광지 코스 자세히 보기 */}
            <Route path="/travelcourse-info" element={< TravelCourseInfo />}></Route>

            {/* 관광지 리스트 */}
            <Route path="/tourist" element={<Tourist />}></Route>

            {/* 관광지 자세히 보기 */}
            <Route path="/tourist-info" element={<TouristInfo />}></Route>

            {/* 게시판 */}
            <Route path="/planner/board" element={<Board />}></Route>

            {/* 게시판 자세히 보기 */}
            <Route path="/planner/board/destination" element={<BoardInfo />}></Route>

        </Routes>
    );
};

export default Body;
