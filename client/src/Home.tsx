import { Component } from "react";

class Home extends Component {
    override render(): React.JSX.Element {
        const clientId = `client_id=${process.env.REACT_APP_CLIENT_ID}`;
        const redirectUri = `redirect_uri=${"http%3A%2F%2Flocalhost%3A3000%2Flogin"}`;
        const scope = `scope=${"identify+email"}`;
        const authUrl = `https://discord.com/oauth2/authorize?response_type=code&${clientId}&${redirectUri}&${scope}`;
        return (
            <div className="App">
                <button onClick={ () => window.open(authUrl, "_parent") }>
                    Log In
                </button>
            </div>
        );
    }
};

export default Home;
