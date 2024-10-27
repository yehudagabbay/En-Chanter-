import { Route, Routes } from "react-router-dom"
import { Register, Login } from "./Shared/Pages"
import ForgetPass from "./Shared/Pages/ForgetPassowrd"
import HomePage from "./Shared/Pages/Home"
import RoomManager from "./Shared/Pages/roomManager/roomManager"


function App() {

  return (
    <Routes>
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/forgetPass" element={<ForgetPass/>}/>
      <Route path="/home/manager" element={<HomePage />} /> 
      <Route path="/home/roomManager/:roomId" element={<RoomManager />} />
   </Routes>
  )
}

export default App
