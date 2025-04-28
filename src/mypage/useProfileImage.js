// import { useState, useRef } from "react"; // React 훅들 임포트
// import axios from "axios"; // axios 임포트

// const useProfileImage = (initialImage, defaultImage) => {
//     const [imagePreview, setImagePreview] = useState(initialImage);
//     const [isUploading, setIsUploading] = useState(false); // 업로드 상태
//     const fileInputRef = useRef(null);

//     const handleFileInputClick = () => {
//         if (fileInputRef.current) {
//             fileInputRef.current.click();
//         }
//     };

//     const handleFileChange = async (event, userId) => {
//         const file = event.target.files[0];
//         if (file) {
//             setIsUploading(true);
//             const reader = new FileReader();
//             reader.onload = () => {
//                 setImagePreview(reader.result); // 미리보기 업데이트
//             };
//             reader.readAsDataURL(file);

//             const formData = new FormData();
//             formData.append("file", file);

//             try {
//                 const response = await axios.post(
//                     `http://localhost:9000/user/mypage/upload?userid=${userId}`,
//                     formData,
//                     { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
//                 );
//                 if (response.data === "파일 업로드 성공") {
//                     setImagePreview(`/upload/profile/${userId}/${file.name}`);
//                 } else {
//                     console.error("이미지 업로드 실패:", response.data);
//                 }
//             } catch (error) {
//                 console.error("파일 업로드 중 오류 발생:", error);
//             } finally {
//                 setIsUploading(false); // 업로드 상태 리셋
//             }
//         }
//     };

//     const handleCancelImage = () => {
//         setImagePreview(initialImage); // 초기 이미지로 복구
//     };

//     const handleResetToDefaultImage = () => {
//         setImagePreview(defaultImage); // 기본 이미지로 복구
//     };

//     return {
//         imagePreview,
//         fileInputRef,
//         isUploading, // 반환 값에 추가
//         handleFileInputClick,
//         handleFileChange,
//         handleCancelImage,
//         handleResetToDefaultImage,
//     };
// };

// export default useProfileImage;
