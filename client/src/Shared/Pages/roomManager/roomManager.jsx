import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonOffIcon from '@mui/icons-material/PersonOff';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MessageIcon from '@mui/icons-material/Message';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LinkIcon from '@mui/icons-material/Link';
import LeakAddIcon from '@mui/icons-material/LeakAdd'; // כפתור אישור להתחברות לזמר
import LeakRemoveIcon from '@mui/icons-material/LeakRemove'; // כפתור התנתקות מהזמר
import Tooltip from '@mui/material/Tooltip'; // הוספת Tooltip של MUI
import Alert from '@mui/material/Alert'; // Alert של MUI להצגת התראה כשאין בקשות
import './RoomManager.css';

export default function RoomManager() {
  const { roomId } = useParams(); // מקבל את ה-roomId מהנתיב
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodesRef = useRef([]);

  useEffect(() => {
    // קריאה ל-API כדי להביא את כל המשתמשים בחדר לפי ה-ID
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://ApiEnchanter.somee.com/api/KaraokeRooms/all/users/${roomId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          console.log(data);
        } else {
          alert('Failed to fetch users.');
        }
      } catch (error) {
        alert(`Error fetching users: ${error.message}`);
      }
    };

    fetchUsers(); // קריאה לפונקציה לטעינת המשתמשים בחדר

    // קריאה ל-API כדי להביא את הבקשות ולהכניס אותן לסטייט
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://www.enchanterr.somee.com/queue/${roomId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          const formattedRequests = data.map((item) => ({
            queueID: item.queueID,
            userName: item.userName,
            songName: item.songName,
            linkSong: item.linkSong,
            roomId: roomId,
          }));
          setRequests(data);
          console.log(data);

        } else {
          // alert('Failed to fetch requests.');
          setAlertMessage('אין בקשות בחדר.');
        }
      } catch (error) {
        alert(`Error fetching requests: ${error.message}`);
      }
    };

    fetchRequests(); // קריאה לפונקציה לטעינת הבקשות מה-API


    // הגדרת הקשר לאודיו והכנת הפילטרים לאיקולייזר
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audioElement = audioRef.current;
      const track = audioContextRef.current.createMediaElementSource(audioElement);

      const frequencies = [60, 170, 350, 1000, 3500];
      gainNodesRef.current = frequencies.map((frequency) => {
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });

      gainNodesRef.current.reduce((prev, current) => {
        prev.connect(current);
        return current;
      }, track).connect(audioContextRef.current.destination);
    }
  }, [roomId]);


  const handleDeleteRequest = async (queueID) => {
    try {
      // קריאה ל-API למחיקת הבקשה לפי ה-queueID
      const response = await fetch(`http://www.enchanterr.somee.com/queue/${queueID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      });

      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        fetchRequests();
      } else {
        // alert('Failed to delete request.');
      }
    } catch (error) {
      // alert(`Error deleting request: ${error.message}`);
    }

  };

  const handleFrequencyChange = (index, value) => {
    if (gainNodesRef.current[index]) {
      gainNodesRef.current[index].gain.value = value;
    }
  };

  const handleConnectRequest = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleRejectRequest = (requestId) => {
    setRequests(requests.filter(request => request.queueID !== requestId));
  };

  const handleMoveUpRequest = (requestId) => {
    const index = requests.findIndex(request => request.queueID === requestId);
    if (index > 0) {
      const newRequests = [...requests];
      [newRequests[index - 1], newRequests[index]] = [newRequests[index], newRequests[index - 1]];
      setRequests(newRequests);
    }
  };

  const handleMoveDownRequest = (requestId) => {
    const index = requests.findIndex(request => request.queueID === requestId);
    if (index < requests.length - 1) {
      const newRequests = [...requests];
      [newRequests[index + 1], newRequests[index]] = [newRequests[index], newRequests[index + 1]];
      setRequests(newRequests);
    }
  };

  const handleOpenMessageDialog = (nickname, phone) => {
    setSelectedUser({ nickname, phone });
    setOpenMessageDialog(true);
  };

  const handleCloseMessageDialog = () => {
    setOpenMessageDialog(false);
    setMessage('');
  };

  const handleSendMessage = () => {
    console.log(`Sending message to ${selectedUser.nickname} (${selectedUser.phone}): ${message}`);
    handleCloseMessageDialog();
  };

  return (
    <div className='room-manager-container layout'>
      <div className='sidebar'>
        <h2>Song Requests</h2>
        <Paper sx={{ height: 400, width: '100%' }}>
          {requests.length === 0 ? (
            // אם אין בקשות, הצגת Alert של MUI
            <Alert severity="info">אין עדיין בקשות לשיר</Alert>
          ) : (
            <DataGrid
              rows={requests}
              getRowId={(row) => row.queueID}
              columns={[
                { field: 'userName', headerName: 'User Name', flex: 1 },
                { field: 'songName', headerName: 'Song Name', flex: 1 },
                {
                  field: 'linkSong',
                  headerName: 'Link',
                  flex: 1,
                  renderCell: (params) => (
                    <a href={params.value} target="_blank" rel="noopener noreferrer" className='link'>Listen</a>
                  ),
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  flex: 1,
                  renderCell: (params) => (
                    <div className='action-buttons'>
                      <IconButton onClick={() => handleConnectRequest(params.row.linkSong)}>
                        <Tooltip title="התחבר לזמר">
                          <LeakAddIcon sx={{ color: 'blue' }} className='connect-icon' />
                        </Tooltip>
                      </IconButton>
                      <IconButton onClick={() => handleRejectRequest(params.row.queueID)}>
                        <Tooltip title="התנתק מהזמר">
                          <LeakRemoveIcon sx={{ color: 'red' }} className='reject-icon' />
                        </Tooltip>
                      </IconButton>
                      <IconButton onClick={() => handleDeleteRequest(params.row.queueID)}>
                        <Tooltip title="מחק בקשה">
                          <PersonOffIcon sx={{ color: 'black' }} className='delete-icon' />
                        </Tooltip>
                      </IconButton>
                      <IconButton onClick={() => handleMoveUpRequest(params.row.queueID)}>
                        <ArrowUpwardIcon className='move-up-icon' />
                      </IconButton>
                      <IconButton onClick={() => handleMoveDownRequest(params.row.queueID)}>
                        <ArrowDownwardIcon className='move-down-icon' />
                      </IconButton>
                      <IconButton onClick={() => handleOpenMessageDialog(params.row.userName, params.row.phone)}>
                        <MessageIcon className='message-icon' />
                      </IconButton>
                    </div>
                  ),
                },
              ]}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{ border: 0 }}
            />
          )}
        </Paper>
        <div className='audio-stream-container'>
          <h2>Audio Stream</h2>
          <audio ref={audioRef} controls src="אין עדין נתיב"></audio>
          <div className="equalizer">
            <h2>Equalizer</h2>
            {gainNodesRef.current.map((_, index) => (
              <div key={index}>
                <label>
                  {/* הסבר על כל בר באיקולייזר */}
                  {index === 0 && "60 Hz (Deep Bass) "}
                  {index === 1 && "170 Hz (Bass) "}
                  {index === 2 && "350 Hz (Low-Mid) "}
                  {index === 3 && "1000 Hz (Mid) "}
                  {index === 4 && "3500 Hz (Treble)"}
                </label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  defaultValue="0" // ערך התחלתי של 0 כדי להיות באמצע
                  onChange={(e) => handleFrequencyChange(index, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='content'>
        <h1>Room Manager number : {roomId}</h1>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={[

              {
                field: 'avatarUrl',
                headerName: 'Avatar',
                flex: 0.5,
                renderCell: (params) => (
                  <div className="avatar-cell">
                    <img src={params.value} alt="Avatar" className="avatar-image" />
                  </div>
                ),
              },
              { field: 'userName', headerName: 'User Name', flex: 1 },
              { field: 'phone', headerName: 'Phone Number', flex: 1 },
              { field: 'ipUser', headerName: 'ip', flex: 1 },
              {
                field: 'actions',
                headerName: 'Actions',
                flex: 0.5,
                renderCell: (params) => (
                  <div className="action-buttons">
                    <IconButton className="delete-icon-button" onClick={() => handleRemoveUser(params.row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ),
              },
            ]}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        </Paper>
      </div>
      <Dialog open={openMessageDialog} onClose={handleCloseMessageDialog}>
        <DialogTitle>Send Message to {selectedUser?.nickname} ({selectedUser?.phone})</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" color="primary">Send</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
