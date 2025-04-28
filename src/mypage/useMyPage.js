import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const useMyPage = () => {
  const [formData, setFormData] = useState({
    userid: "",
    username: "",
    password: "",
    repassword: "",
    email: "",
    profileImage: "/ProfileImg/anonymous.jpg",
    authCode: "",
  });

  const [imagePreview, setImagePreview] = useState(formData.profileImage);
  const [validationMessages, setValidationMessages] = useState({});
  const [authCodeSent, setAuthCodeSent] = useState(false);
  const [timer, setTimer] = useState(180);
  const [isAuthCodeVerified, setIsAuthCodeVerified] = useState(false);
  const [isAuthCodeLocked, setIsAuthCodeLocked] = useState(false);
  const [isPasswordValidationVisible, setIsPasswordValidationVisible] = useState(false);

  
  // 비밀번호 수정 상태 관리 (추가)
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);  // 여기에서 비밀번호 수정 상태 정의
  const fileInputRef = useRef(null);

  const handlePasswordEditClick = () => {
    setIsPasswordEditing(true); // 비밀번호 입력 필드 활성화
    setIsPasswordValidationVisible(true); // 유효성 메시지 표시 활성화
  };
  
  const handleCancelPasswordEditing = () => {
    setIsPasswordEditing(false); // 잠금 상태로 전환
    setIsPasswordValidationVisible(false); // 유효성 메시지 숨김
    setFormData((prev) => ({
      ...prev,
      password: "", // 비밀번호 초기화
      repassword: "", // 비밀번호 확인 초기화
    }));
    setValidationMessages((prev) => ({
      ...prev,
      password: "", // 비밀번호 메시지 초기화
      repassword: "", // 확인 메시지 초기화
    }));
  };

  
     // 비밀번호 유효성 검사
     const validatePassword = (password) => {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,15}$/;
      if (!password) {
        return { message: "비밀번호를 입력해주세요.", color: "validation-error" };
      }
  
      if (/\s/.test(password)) {
        return { message: "비밀번호에 공백은 사용할 수 없습니다.", color: "validation-error" };
      }
  
      if (!passwordRegex.test(password)) {
        return { message: "비밀번호는 영문+숫자 조합, 8~15자리여야 합니다.", color: "validation-error" };
      }
  
      return { message: "사용가능한 비밀번호입니다.", color: "validation-success" };
    };
  




  // 파일 업로드
  // 이미지 업로드
  const handleImageUpload = async (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result); // 파일 미리보기
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "http://localhost:9000/user/mypage/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );

        if (response.data === "파일 업로드 성공") {
          setFormData((prev) => ({
            ...prev,
            profileImage: `/upload/profile/${file.name}`, // 업로드된 이미지 URL을 formData에 설정
          }));
          console.log("이미지 업로드 성공");
        } else {
          console.error("이미지 업로드 실패:", response.data);
        }
      } catch (error) {
        console.error("파일 업로드 중 오류 발생:", error);
      }
    }
  };

  
  // 이메일 부분

  // 타이머 관리
  useEffect(() => {
    if (authCodeSent && timer > 0 && !isAuthCodeVerified) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [authCodeSent, timer, isAuthCodeVerified]);

  // 이메일 상태 초기화
  const resetAuthState = () => {
    setAuthCodeSent(false);
    setIsAuthCodeVerified(false);
    setIsAuthCodeLocked(false);
  };


  const validateEmail = async (email) => {
    // 이메일 형식 유효성 검사
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationMessages((prev) => ({
        ...prev,
        email: "유효한 이메일 형식을 입력하세요.",
        emailColor: "validation-error",
      }));
      return false;
    }
  
    // 유효한 이메일 형식일 경우
    setValidationMessages((prev) => ({
      ...prev,
      email: "유효한 이메일입니다.",
      emailColor: "validation-success",
    }));
  
    try {
      // 인증 코드 요청 함수 호출
      await sendAuthCode();
    } catch (error) {
      console.error("이메일 유효성 검사 중 오류:", error.response?.data || error.message);
      setValidationMessages((prev) => ({
        ...prev,
        email: "서버 오류로 이메일 인증 요청에 실패했습니다.",
        emailColor: "validation-error",
      }));
    }
  };
  
  // 인증 코드 발송 함수
  const sendAuthCode = async () => {
    if (!formData.email) {
      setValidationMessages((prev) => ({
        ...prev,
        email: "이메일을 입력해주세요.",
        emailColor: "validation-error",
      }));
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:9000/user/send-auth-code",
        { email: formData.email }, // 이메일 전달
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.data.status === "success") {
        setAuthCodeSent(true); // 인증 코드 발송 성공
        setValidationMessages((prev) => ({
          ...prev,
          email: "인증 코드가 발송되었습니다.",
          emailColor: "validation-success",
        }));
      } else {
        setValidationMessages((prev) => ({
          ...prev,
          email: response.data.message || "인증 코드 발송 실패.",
          emailColor: "validation-error",
        }));
      }
    } catch (error) {
      console.error("인증 코드 요청 오류:", error.response?.data || error.message);
      setValidationMessages((prev) => ({
        ...prev,
        email: "서버 오류로 인증 코드를 발송할 수 없습니다.",
        emailColor: "validation-error",
      }));
    }
  };

  const verifyAuthCode = async () => {
    try {
        const response = await axios.post("http://localhost:9000/user/verify-auth-code", {
            email: formData.email,
            code: formData.authCode,
        });

        if (response.data.message.includes("완료")) {
            setIsAuthCodeVerified(true);
            setIsAuthCodeLocked(true); // 인증 성공 시 버튼 잠금
            setValidationMessages((prevMessages) => ({
                ...prevMessages,
                authCode: "인증이 완료되었습니다.",
                authCodeColor: "validation-success", // 성공 색상
            }));
        } else {
            setValidationMessages((prevMessages) => ({
                ...prevMessages,
                authCode: "인증번호가 올바르지 않습니다.",
                authCodeColor: "validation-error", // 오류 색상
            }));
        }
    } catch (error) {
        setValidationMessages((prevMessages) => ({
            ...prevMessages,
            authCode: "서버 오류로 인증을 완료할 수 없습니다.",
            authCodeColor: "validation-error", // 오류 색상
        }));
    }
};

  
  return {
    formData,
    handlePasswordEditClick,
    handleCancelPasswordEditing,
    setFormData,
    imagePreview,
    setImagePreview,
    validationMessages,
    setValidationMessages,
    authCodeSent,
    setAuthCodeSent,
    timer,
    isPasswordEditing,
    handlePasswordEditClick,
    handleCancelPasswordEditing,
    setTimer,
    isPasswordEditing,  // 이 값을 반환하여 사용할 수 있도록 전달
    setIsPasswordEditing,  // 비밀번호 수정 상태를 변경하는 함수도 반환
    setValidationMessages,
    isAuthCodeVerified,
    setIsAuthCodeVerified,
    isAuthCodeLocked,
    setIsAuthCodeLocked,
    setIsPasswordEditing,
    fileInputRef,
    handleDrop: (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleImageUpload(e.dataTransfer.files[0]); // 드래그 앤 드롭 시 이미지 업로드
      }
    },
    handleDragOver: (e) => e.preventDefault(),
    handleFileInputClick: () => fileInputRef.current?.click(),
    handleImageUpload,
    handleCancelImage: () => {
      setImagePreview("/ProfileImg/anonymous.jpg");
      setFormData((prev) => ({
        ...prev,
        profileImage: "/ProfileImg/anonymous.jpg", // 기본 이미지로 변경
      }));
    },
    handleChange: (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    sendAuthCode,
    validateEmail,
    verifyAuthCode,
    setImagePreview,
    resetAuthState,
    validatePassword,
    validatePassword,
    handlePasswordEditClick,
    handleFileChange: (e) => handleImageUpload(e.target.files[0]),
    setIsPasswordValidationVisible,
  };
};

export default useMyPage;



