import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import React from "react";

const PrivateRoute = ({ element, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [cookie, setCookie] = useState(null);
    const navigate = useNavigate();  // navigate 훅 사용

    useEffect(()=> {
        const validateCookie = async () =>{
            try{
                const response = await axios.post(
                    "https://www.tripplannerbn.shop/api/cookie/validate",
                    {},
                    {withCredentials:true}
                );
                setIsAuthenticated(true);
                setCookie(response.data); //쿠키정보 저장
                console.log("쿠키정보 :" ,response.data);
            }catch (err) {
                console.log("엑세스 토큰 갱신 시도");
                await handleTokenRefresh();
            }
        };

        const handleTokenRefresh = async () => {
            const userid = localStorage.getItem("userid");
            if(!userid) {
                console.error("userid가 로컬 스토리지에 없습니다");
                setIsAuthenticated(false);
                navigate("/user/login");
                return ;
            }

            try{
                const tokens = await refreshAccessToken(userid);
                console.log("토큰 갱신 성공", tokens);

                //갱신 후 쿠키 유효성 재검사
                const retryResponse = await axios.post(
                    "https://www.tripplannerbn.shop/api/cookie/validate",
                    {},
                    {withCredentials : true}
                );
                setIsAuthenticated(true);
                setCookie(retryResponse.data);
                console.log("갱신 후 쿠키 정보:", retryResponse.data);
            } catch( refreshError) {
                console.error("토큰 갱신 실패:", refreshError);
                setIsAuthenticated(false);
                localStorage.removeItem("userid");
                navigate("/user/login");
            }
        };

        validateCookie();
       
    }, [navigate]);

    if(isAuthenticated === null) {
        return <div>Loading...</div>; //인증 상태 결정 대기

    }


    return isAuthenticated ? React.cloneElement(element, { cookie }) : null;
};

const refreshAccessToken = async (userid) => {
    try{
        const response = await axios.post('https://www.tripplannerbn.shop/api/cookie/refresh',{userid} ,{
            withCredentials : true,
            headers : {
                userid : userid,
            },
        });
        return response.data; 
    }catch (error) {


        console.log("엑세스 토큰 재발급 실패", error);
        localStorage.removeItem("userid");
        throw new Error("엑세스 토큰 재발급 실패");
    }
};


export default PrivateRoute;