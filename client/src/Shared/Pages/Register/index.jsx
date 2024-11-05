import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { AvatarContext } from '../../Context/avatarContext'; // ייבוא הקונטקסט

export default function Register() {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [birthday, setBirthday] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);

    // גישה לנתוני האווטרים מהקונטקסט
    const avatars = useContext(AvatarContext);

    const navigate = useNavigate();
    const apiUrl = 'http://www.Enchanter.somee.com/api/UsersControllers/';

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const formattedBirthday = new Date(birthday).toISOString().split('T')[0];
            const response = await fetch(apiUrl + 'create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                body: JSON.stringify({
                    userName: username,
                    email,
                    phone,
                    password,
                    birthday: formattedBirthday,
                   avatarUrl: avatarUrl
                }),
            });
            setIsLoading(false);

            if (response.ok) {
                alert('Registration Successful');
                navigate('/home/manager');
            } else {
                const errorResult = await response.text();
                alert(`Registration Failed: ${errorResult}`);
            }
        } catch (error) {
            setIsLoading(false);
            alert(`Error: ${error.message}`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleRegister();
    };

    return (
        <div className='container'>
            <div className='left-side register-background'>
                <h1>Join the Ultimate Karaoke Experience of En'chanter la compagnie</h1>
                <p>Create your account to unlock seamless room management, real-time song requests, and unforgettable karaoke sessions. Whether you're hosting or participating, our platform is designed to bring music and fun together like never before.</p>
                <button className="read-more">Read More</button>
            </div>
            <div className='right-side'>
                <form className="auth" onSubmit={handleSubmit}>
                    <h3>Hello!</h3>
                    <p>Sign Up to Get Started</p>

                    <div className="input-box">
                        <input
                            placeholder='Nik Name'
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-box">
                        <input
                            placeholder='Phone Number'
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-box">
                        <input
                            placeholder='Email Address'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-box">
                        <input
                            placeholder='Password'
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-box">
                        <label htmlFor="birthday">Date of Birth</label>
                        <input
                            id="birthday"
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            required
                        />
                    </div>
                    <div className="avatar-selection">
                        <p>Select an Avatar:</p>
                        <Stack direction="row" spacing={2} className="avatars-container">
                            {avatars.map((avatar) => (
                                <Avatar
                                    key={avatar.id}
                                    src={avatar.src}
                                    alt={`Avatar ${avatar.id}`}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        border: selectedAvatarId === avatar.id ? '3px solid blue' : 'none',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedAvatarId(avatar.id)}
                                />
                            ))}
                        </Stack>
                    </div>
                    <p className="forgot-password">
                        <a onClick={() => { navigate("/auth/forgetPass") }}>Forgot Password <span className="arrow">→</span></a>
                    </p>
                    <p className="sign-in-link">
                        <a onClick={() => { navigate("/") }}>Sign-In <span className="arrow">→</span></a>
                    </p>
                    <button type="submit" className="register-button" disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
