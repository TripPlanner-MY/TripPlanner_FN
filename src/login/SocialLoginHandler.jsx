import { useEffect } from "react";
import { useLocation } from "react-router-dom"


const SocialLoginHandler = () => {
    const location = useLocation();

    useEffect(()=>{

        const queryParams = new URLSearchParams(location.search);
        const userid = queryParams.get("userid");

        if(userid) {
            console.log("소셜 로그인 성공, userid:", userid);
            localStorage.setItem("userid", userid); // 로컬스토리지에 저장
            alert("소셜 로그인 성공!");
            window.location.href = "/"; // 메인 페이지로 리다이렉트
        }else{
            console.error("소셜 로그인 실패: userid가 없습니다.");
            alert("소셜 로그인 실패");
        }
    },[location]);

    return <div>소셜 로그인 처리 중..</div>;
};

export default SocialLoginHandler;