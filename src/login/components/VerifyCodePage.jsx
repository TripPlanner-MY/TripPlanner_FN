import axios from "axios";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../scss/VerifyCodePage.scss"

const VerifyCodePage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const userid = searchParams.get("userid")

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post("https://www.tripplannerbn.shop/user/verify-code", { email, code ,userid});

      const {resetToken} = response.data;
      localStorage.setItem("resetToken",resetToken); //로컬스토리지에 리셋토큰저장

      setMessage("인증 성공!");
      navigate(`/reset-password?userid=${userid}&email=${email}`); //비밀번호 재설정 페이지로 이동
    } catch (err) {
      setError("인증 코드가 유효하지 않습니다. 다시 시도해 주세요");
    }
  };

  return (
    <div className="verify-code-page">
      <h2 className="verify-code-title">인증 코드 입력</h2>
      <form onSubmit={handleSubmit} className="verify-code-form">
        <label htmlFor="code">인증 코드</label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="인증 코드를 입력하세요"
          required
        />
        <button className="verify-code-button" type="submit">확인</button>
      </form>
      {message && <p className="verify-code-message">{message}</p>}
      {error && <p className="verify-code-error">{error}</p>}
    </div>
  );
};

export default VerifyCodePage;