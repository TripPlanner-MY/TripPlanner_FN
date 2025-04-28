// import { useState, useEffect } from "react";
// import axios from "axios";

// // 내가 좋아요한 플래너 관련 훅
// const useLikePlanner = (userid) => {
//   const [likedPlanners, setLikedPlanners] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!userid) return;
//     const fetchLikedPlanners = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`http://localhost:9000/api/planners/liked/${userid}`);
//         setLikedPlanners(response.data);
//       } catch (error) {
//         console.error("좋아요한 플래너를 가져오는 데 실패했습니다:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLikedPlanners();
//   }, [userid]);

//   return { likedPlanners, loading };
// };

// export default useLikePlanner;
