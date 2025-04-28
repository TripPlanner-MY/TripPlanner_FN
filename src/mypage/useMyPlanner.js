// import { useState, useEffect } from "react";
// import axios from "axios";

// // 내가 작성한 플래너 관련 훅
// const useMyPlanner = (userid) => {
//   const [myPlanners, setMyPlanners] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!userid) return;
//     const fetchMyPlanners = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`http://localhost:9000/api/planners/user/${userid}`);
//         setMyPlanners(response.data);
//       } catch (error) {
//         console.error("플래너를 가져오는 데 실패했습니다:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMyPlanners();
//   }, [userid]);

//   return { myPlanners, loading };
// };

// export default useMyPlanner;
