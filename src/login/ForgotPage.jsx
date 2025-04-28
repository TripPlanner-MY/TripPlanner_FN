import { useNavigate } from "react-router-dom";
import "./scss/ForgotPage.scss"

const ForgotPage = () => {
  const navigate = useNavigate();

  return (
    <div className="forgot-page">
      <h1 className="forgot-title">아이디 및 비밀번호 찾기</h1>
      <div className="forgot-options">
        <button className="forgot-button" onClick={() => navigate("/find-id")}>
          아이디 찾기
        </button>
        <button
          className="forgot-button"
          onClick={() => navigate("/find-password")}
        >
          비밀번호 찾기
        </button>
      </div>
    </div>
  );
};

export default ForgotPage;
