import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
    const location = useLocation();
    const { userContext } = location.state;

    const [user, setUser] = useState<any>(null);
    const getData = useCallback(async (_userId: string, userToken: string) => {
        // get user data
        let userData = await axios.get(process.env.REACT_APP_API_URL! + `users/${1}`, 
            { headers: { 
                'Content-Type': 'application/json',
                'Authorization': userToken
            } }
        );
        console.log(userData);
        setUser({
            ...userContext,
            ...(userData.data)
        })

        // get guild data
        let guildData = 
    }, []);
    
    useEffect(() => {
        if(userContext.id) {
            getData(userContext.id, userContext.token);
        }
    }, [userContext, getData]);

    if (!user) {
        return <div><h3>You need to login</h3></div>
    }
    return <div>
        <h3>Hi there {user.name}</h3>

    </div>
};

export default Dashboard;
