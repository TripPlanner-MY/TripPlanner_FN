import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"


const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {


        axios.post('https://www.tripplannerbn.shop/user/logout',{},{withCredentials:true})
        .then((response)=>{

            localStorage.removeItem("userid");
            window.location.href="/";
        })      
        .catch((error) =>{
 
        });
    },[navigate]);


    return (
        <div>
            <h1>로그아웃 중...</h1>
        </div>
    );
};

export default Logout;