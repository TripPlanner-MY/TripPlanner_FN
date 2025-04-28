import axios from "axios";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import "../scss/UseridInputPage.scss"

const UseridInputPage = ()=>{
    const [userid,setUserid] = useState("");
    const [error,setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError("");

        try{
            await axios.post("https://www.tripplannerbn.shop/user/check-userid", {userid});
            navigate(`/email-auth?userid=${userid}`); //이메일 인증 페이지로 이동
        }catch(err){
            setError("해당 사용자 ID가 존재하지 않습니다.");
        }
    };

    return (
        <div className="userid-page">
            <h1 className="userid-title">
                비밀번호를 찾고자 하는 아이디를 입력해주세요.</h1>
            <form className="userid-form" onSubmit={handleSubmit}>
                <input 
                type="text"
                id="userid"
                value={userid}
                onChange={(e)=>setUserid(e.target.value)}
                placeholder="아이디를 입력해주세요"
                required
                className="userid-input"
                />
                <button type="submit" className="userid-button">다음</button>
            </form>
            <div className="userid-help">
            아이디가 기억나지 않는다면 ?
            <a href="/find-id" className="userid-link">아이디 찾기</a>
            </div>
            {error && <p className="userid-error">{error}</p>}
        </div>
    );
};


export default UseridInputPage;