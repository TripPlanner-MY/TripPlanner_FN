import axios from "axios";
import { tr } from "date-fns/locale";
import { useState } from "react"
import "../scss/FindIdPage.scss"

const FindIdPage = ()=>{

    const [email , setEmail] = useState("");
    const [message , setMessage] = useState("");
    const [userIds,setUserIds] = useState([]);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setMessage("");
        setUserIds([]);

        try{
            const response = await axios.post("https://www.tripplannerbn.shop/user/findId",{email} );
            const userIds = response.data.userid;
            
            if(userIds && userIds.length > 0){
                setUserIds(userIds);
                setMessage(`${userIds.length}개의 아이디를 찾았습니다`);
            }else{
                setMessage("이메일에 해당하는 아이디를 찾을 수 없습니다.");
            }
        }catch(error){
            setMessage("이메일에 해당하는 아이디를 찾을 수 없습니다");
        }
    };

    return (
        <div className="find-id-page">
            <h2 className="find-id-title">아이디 찾기</h2>
            <form className="find-id-form" onSubmit={handleSubmit}>
                <label htmlFor="email">이메일</label>
                <input 
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e)=> setEmail(e.target.value) }
                placeholder="이메일을 입력해주세요."
                required
                />
                <button type="submit" className="find-id-button">아이디 찾기</button>
            </form>
            {message && <p className="find-id-message">{message}</p>}
            {userIds.length > 0 && (
                <table className="find-id-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>아이디</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userIds.map((id,index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};


export default FindIdPage;