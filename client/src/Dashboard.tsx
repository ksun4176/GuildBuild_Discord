import { useLocation } from "react-router-dom";

const Dashboard = () => {
    const location = useLocation();
    const { user } = location.state;
    if (!user){
        return <h3>You need to login</h3>
    }
    return <div>
        <h3>Hi there {JSON.stringify(location.state.user)}</h3>
    </div>
};

export default Dashboard;
