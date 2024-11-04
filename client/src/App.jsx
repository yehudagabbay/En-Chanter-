import React from 'react';
import { Route, Routes } from "react-router-dom";
import { AvatarProvider } from './Shared/Context/avatarContext';
import Register from './Shared/Pages/Register';
import Login from './Shared/Pages/Login';
import ForgetPass from './Shared/Pages/ForgetPassowrd';
import HomePage from './Shared/Pages/Home';
import RoomManager from './Shared/Pages/roomManager/roomManager';

function App() {
    return (
        <AvatarProvider>
            <Routes>
                <Route index element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgetPass" element={<ForgetPass />} />
                <Route path="/home/manager" element={<HomePage />} />
                <Route path="/home/roomManager/:roomId" element={<RoomManager />} />
            </Routes>
        </AvatarProvider>
    );
}

export default App;
