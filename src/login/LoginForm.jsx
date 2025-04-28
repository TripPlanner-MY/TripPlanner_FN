import { useState } from "react";
import axios from "axios";
// import "./LoginForm.scss";
import "./scss/LoginForm.scss"

const LoginForm = () => {
  const [formData, setFormData] = useState({
    userid: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState(null);

  //입력 값 변경 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
  };

  const naverLogin = () => {
    console.log("네이버 로그인 클릭");
    window.location.href = "https://www.tripplannerbn.shop/oauth2/authorization/naver";
  };

  const kakaoLogin = () => {
    console.log("카카오 로그인 클릭");
    window.location.href = " https://www.tripplannerbn.shop/oauth2/authorization/kakao ";
  }

  const googleLogin = () => {
    console.log("구글 로그인");
    window.location.href = " https://www.tripplannerbn.shop/oauth2/authorization/google "
  }

  const instaLogin = () => {
    console.log("인스타 로그인");
    window.location.href = " https://www.tripplannerbn.shop/oauth2/authorization/instagram "
  }


  //로그인 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    setError(null); //이전 에러 초기화
    try {
      const response = await axios.post(
        "https://www.tripplannerbn.shop/user/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, //쿠키 저장
        }
      );
      console.log("로그인 성공:", response.data);
      localStorage.setItem("userid",formData.userid); //로컬 스토리지에 userid 저장
      //로그인 성공 시 처리
      alert("로그인 성공 !");
      window.location.href = "/";

    } catch (err) {
      console.log("로그인 실패,", err);
      setError("로그인에 실패했습니다. 다시 시도해주세요");
    }
  };

  return (
    <div className="login-form_wrapper">
      <div className="login-form_logo">여행가자</div>
      <div className="login-form_login">
        <form onSubmit={handleSubmit}>
          <label htmlFor="userid">유저 ID:</label>
          <input
            type="text"
            id="userid"
            name="userid"
            value={formData.userid}
            onChange={handleChange}
            required
          />
          <div className="login-form_checkbox">
            <label>ID 저장
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              /></label>
          </div>
          <label htmlFor="password">PASSWORD:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="login-form_forgot-password">
            <a href="/forgot">비밀번호를 잊으셨나요?</a>
          </div>
          {error && <p className="login-form_error-message">{error}</p>}
          <button className="login-form_loginButton" type="submit">
            로그인
          </button>
        </form>
      </div>
      <div className="login-form_join">
        아직 회원이 아니세요? <a href="/user/join">회원가입</a>
      </div>
      <hr />
      <div className="login-form_oauth2">
        <div style={{ textAlign: "center" }}>SNS 간편 로그인</div>
        <div className="login-form_oauth2-buttons">
          <ul>
            <li>
              <button className="login-form_oauth2-button" onClick={kakaoLogin}>
                <img src="/images/kakaobutton.png" alt="카카오로그인" />
              </button>
            </li>
            <li>
              <button
                className="login-form_oauth2-button" onClick={naverLogin}>
                <img src="/images/naverbutton.png" alt="네이버 로그인" />
              </button>
            </li>
            <li>
              <button className="login-form_oauth2-button" onClick={googleLogin}>
                <img src="/images/googlebutton.png" alt="구글 로그인" />
              </button>
            </li>
            <li>
              <button className="login-form_oauth2-button" onClick={instaLogin}>
                <img src="/images/instabutton.png" alt="인스타 로그인" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
