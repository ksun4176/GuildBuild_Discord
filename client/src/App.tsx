import { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Dashboard from './Dashboard';
import Login from './Login';

class App extends Component {
    override render(): React.JSX.Element {
        return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        );
    }
}

export default App;
