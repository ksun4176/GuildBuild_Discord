import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

type User = {
    id: string,
    username: string,
    email: string
}

const Login = () => {
    const [user, setUser] = useState<User | null>(null);
    const getUserDetails = useCallback(async (authCode: string) => {
        try {
            const formData = new URLSearchParams({
                client_id: process.env.REACT_APP_CLIENT_ID!,
                client_secret: process.env.REACT_APP_CLIENT_SECRET!,
                code: authCode,
                grant_type: 'authorization_code',
                redirect_uri: `http://localhost:3000/login`,
            });
            const tokenData = await axios.post('https://discord.com/api/oauth2/token',
				formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',

                    }
                }
			);

            if (tokenData.data) {
                const tokenType = tokenData.data.token_type;
                const accessToken = tokenData.data.access_token;
                // const refreshToken = tokenData.data.refresh_token;

                const userInfo = await axios.get("https://discord.com/api/users/@me", {
                    headers: {
                        'Authorization': `${tokenType} ${accessToken}`
                    }
                });
                setUser({
                    id: userInfo.data.id,
                    username: userInfo.data.username,
                    email: userInfo.data.email
                });
            }
        } catch (err) {
            console.log("error getting user", err);
        }
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const authCode = searchParams.get("code");
        if(authCode) {
            getUserDetails(authCode);
        }
    }, [getUserDetails]);

    return <div>
        <h3>Logging in now...</h3>
        {user && (<Navigate replace to='/dashboard' state={{user: user}} />)}
    </div>
};

export default Login;
