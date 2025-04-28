import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Mypage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        img: "",
    });
    const [newProfileImg, setNewProfileImg] = useState(null); // 새로운 프로필 이미지 상태

    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    setError("로그인이 필요합니다.");
                    return;
                }

                const response = await axios.get("https://www.tripplannerbn.shop/api/mypage/info", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setUserInfo(response.data);
                }
            } catch (error) {
                setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
                console.error("사용자 정보 오류:", error);
            }
        };

        fetchUserInfo();
    }, []);

    // 프로필 이미지 변경 처리 함수
    const handleProfileImageChange = async (e) => {
        e.preventDefault();
        if (!newProfileImg) {
            alert("변경할 이미지를 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("profileImg", newProfileImg);

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("로그인이 필요합니다.");
                return;
            }

            const response = await axios.put("https://www.tripplannerbn.shop/api/mypage/profile-img", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                alert("프로필 이미지가 성공적으로 변경되었습니다.");
                setUserInfo({ ...userInfo, img: response.data.img });
                setNewProfileImg(null); // 입력값 초기화
            }
        } catch (error) {
            setError("프로필 이미지 변경 중 오류가 발생했습니다.");
            console.error("프로필 이미지 변경 오류:", error);
        }
    };

    // 회원 탈퇴 처리 함수
    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("정말로 회원탈퇴를 진행하시겠습니까?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("로그인이 필요합니다.");
                return;
            }

            const response = await axios.delete("http://localhost:9090/api/user/delete", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                alert("회원탈퇴가 완료되었습니다.");
                localStorage.removeItem("accessToken");
                navigate("/");
            }
        } catch (error) {
            setError("회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.");
            console.error("회원탈퇴 오류:", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>마이페이지</h1>
            <div>
                <h2>내 정보</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <img
                        src={userInfo.img || "/default-profile.png"} // 기본 프로필 이미지 제공
                        alt="프로필 이미지"
                        style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                    />
                    <form onSubmit={handleProfileImageChange}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewProfileImg(e.target.files[0])}
                        />
                        <button type="submit">프로필 이미지 변경</button>
                    </form>
                </div>
                <p><strong>사용자명:</strong> {userInfo.username}</p>
                <p><strong>이메일:</strong> {userInfo.email}</p>
            </div>
            <div style={{ margin: "20px 0" }}>
                <a href="/mypage/planners" style={{ marginRight: "10px" }}>내가 작성한 Planner</a>
                <a href="/mypage/liked" style={{ marginRight: "10px" }}>내가 좋아한 Planner</a>
                <a href="/mypage/edit">내 정보 변경</a>
            </div>
            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={handleDeleteAccount}
                    style={{
                        background: "red",
                        color: "white",
                        padding: "10px",
                        border: "none",
                        borderRadius: "5px",
                    }}
                >
                    회원 탈퇴
                </button>
            </div>
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
    );
};

export default Mypage;
