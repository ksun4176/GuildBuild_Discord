import { useLocation } from "react-router-dom";

const Dashboard = () => {
    const location = useLocation();
    const { user } = location.state;
    return <div>
        <h3>{
            user ? 
                `Hi there ${JSON.stringify(user)}` :
                'You need to login'
        }</h3>
    </div>
};

export default Dashboard;
