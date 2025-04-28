import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../scss/PasswordResetPage.scss"

const PasswordResetPage = ()=>{
    const [newPassword,setNewPassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error,setError] = useState("");

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if(newPassword !== confirmPassword){
            setError("비밀번호가 일치하지 않습니다");
            return ;
        }
        setMessage("");
        setError("");
        try{
            const token = localStorage.getItem("resetToken");
            await axios.post("https://www.tripplannerbn.shop/user/reset-password",
            { newPassword }, {
                headers : {Authorization : `Bearer ${token}`},
            });
            setMessage("비밀번호가 성공적으로 변경되었습니다");
            setTimeout(()=>{
                window.location.href = "/";
            },2000); //메시지 나오고 2초 뒤에 리다이렉트
            localStorage.removeItem("resetToken"); //비밀번호 변경 완료하면 로컬 스토리지 삭제
        }catch(err){
            setError("비밀번호 변경에 실패했습니다. 링크가 유효하지 않거나 문제가 발생했습니다");
            localStorage.removeItem("resetToken"); //비밀번호 변경 완료하면 로컬 스토리지 삭제
        }
    };

    return (
        <div className="password-reset-page">
            <h2 className="password-reset-title">비밀번호 변경</h2>
                <form onSubmit={handleSubmit} className="password-reset-form">
                    <label htmlFor="newPassword">새 비밀번호</label>
                    <input 
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e)=>setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    required
                    />
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <input 
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    required />
                    <button type="submit" className="password-reset-button">비밀번호 변경</button>
                </form>
                {message && <p className="password-reset-message">{message}</p>}
                {error && <p className="password-reset-error">{error}</p>}
        </div>
    )

}

export default PasswordResetPage;