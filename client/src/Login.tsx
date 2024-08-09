import { useCallback, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Navigate } from "react-router-dom";

const Login = () => {
    const [user, setUser] = useState<any>(null);
    const getUserDetails = useCallback(async (authCode: string) => {
        // get token data
        let tokenData: AxiosResponse | null = null;
        try {
            const formData = new URLSearchParams({
                client_id: process.env.REACT_APP_CLIENT_ID!,
                client_secret: process.env.REACT_APP_CLIENT_SECRET!,
                code: authCode,
                grant_type: 'authorization_code',
                redirect_uri: `http://localhost:3000/login`,
            });
            tokenData = await axios.post('https://discord.com/api/oauth2/token',
				formData,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
			);
        }
        catch (err) {
            console.error("Could not get token data" , err);
        }

        // get discord user info
        let userContext = null;
        try {
            if (tokenData?.data) {
                const tokenType = tokenData.data.token_type;
                const accessToken = tokenData.data.access_token;
                // const refreshToken = tokenData.data.refresh_token;

                const discordUserData = await axios.get("https://discord.com/api/users/@me",
                    { headers: { 'Authorization': `${tokenType} ${accessToken}` } }
                );

                userContext = {
                    discordId: discordUserData.data.id,
                    name: discordUserData.data.username,
                    email: discordUserData.data.email
                };
            }
        }
        catch (err) {
            console.error("Could not get user info", err);
            return;
        }

        // get API user info
        try {
            if (userContext) {
                let userInfo = null;
                let apiUserData = await axios.get(process.env.REACT_APP_API_URL! + `users?discordId=${userContext.discordId}`, 
                    { headers: { 'Content-Type': 'application/json' } }
                );
                if (apiUserData.data.length > 0) {
                    setUser(apiUserData.data[0])
                    userInfo = apiUserData.data[0];
                    console.log("User found:", apiUserData);
                }
                else {
                    apiUserData = await axios.post(process.env.REACT_APP_API_URL! + `user`, 
                        { user: userContext },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    setUser(apiUserData.data)
                    userInfo = apiUserData.data;
                    console.log("User created:", apiUserData);
                }

                if (userInfo) {
                    setUser({
                        ...userInfo,
                        token: tokenData!.data.access_token
                    })
                }
            }
        }
        catch (err) {
            console.log("error getting user", err);
            return;
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
