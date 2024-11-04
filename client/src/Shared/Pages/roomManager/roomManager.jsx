import React, { useState, useEffect,useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
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
import './RoomManager.css';

export default function RoomManager() {
  const { roomId } = useParams(); // Get the roomId from the URL
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAudioDiv, setShowAudioDiv] = useState(false);


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
          setUsers(data); // עדכון הסטייט עם המשתמשים שהתקבלו מה-API
          console.log(data);

        } else {
          alert('Failed to fetch users.');
        }
      } catch (error) {
        alert(`Error fetching users: ${error.message}`);
      }
    };

    fetchUsers(); // קריאה לפונקציה לטעינת המשתמשים בחדר

    // Mock data for song requests in the room
    const mockRequests = [
      { id: 1, nickname: 'שי המשורר', phone: '123-456-7890', songName: 'אבא - בן צור ', link: 'https://www.youtube.com/watch?v=xJWiDfMsw0U' },
      { id: 2, nickname: 'עדי המעללפפתתתת XOXO', phone: '987-654-3210', songName: 'כוכבים - שילה בן סעדון', link: 'https://www.youtube.com/watch?v=8MuoC5DCFwg' },
      { id: 3, nickname: 'יעלי המוש <3', phone: '555-666-7777', songName: 'ואיך שלא', link: 'https://www.youtube.com/watch?v=gkqHQxbL-MY' },
    ];
    setRequests(mockRequests);
  }, [roomId]);


  // Handlers for user actions
  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the room?')) {
      try {
        const response = await fetch(`http://www.apienchanter.somee.com/api/KaraokeRooms/user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        });

        if (response.ok) {
          // הסרה מהסטייט של המשתמש לאחר מחיקה מוצלחת בשרת
          setUsers(users.filter(user => user.id !== userId));
          console.log(`User with ID ${userId} has been removed successfully.`);
        } else {
          alert('Failed to remove user from the room.');
        }
      } catch (error) {
        alert(`Error removing user from the room: ${error.message}`);
      }
    }
  };

  const handleApproveRequest = (requestId) => {
    console.log(`Approved request ${requestId}`);
  };

  const handleRejectRequest = (requestId) => {
    setRequests(requests.filter(request => request.id !== requestId));
  };

  const handleMoveUpRequest = (requestId) => {
    const index = requests.findIndex(request => request.id === requestId);
    if (index > 0) {
      const newRequests = [...requests];
      // הזזת השורה למעלה
      [newRequests[index - 1], newRequests[index]] = [newRequests[index], newRequests[index - 1]];
      setRequests(newRequests);
    }
  };

  const handleMoveDownRequest = (requestId) => {
    const index = requests.findIndex(request => request.id === requestId);
    if (index < requests.length - 1) {
      const newRequests = [...requests];
      // הזזת השורה למטה
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
  const handleConnectRequest = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };
        //איקולזחר
  
  return (
    <div className='room-manager-container layout'>
      <div className='sidebar'>
        <h2>Song Requests</h2>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={requests}
            getRowId={(row) => row.id}
            columns={[
              { field: 'nickname', headerName: 'Nickname', flex: 1 },
              { field: 'phone', headerName: 'Phone Number', flex: 1 },
              { field: 'songName', headerName: 'Song Name', flex: 1 },
              {
                field: 'link',
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
                    <IconButton onClick={() => handleConnectRequest(params.row.link)}>
                      <LinkIcon className='connect-icon' /> 
                    </IconButton>
                    <IconButton onClick={() => handleRejectRequest(params.row.id)}>
                      <CloseIcon className='reject-icon' />
                    </IconButton>
                    <IconButton onClick={() => handleMoveUpRequest(params.row.id)}>
                      <ArrowUpwardIcon className='move-up-icon' />
                    </IconButton>
                    <IconButton onClick={() => handleMoveDownRequest(params.row.id)}>
                      <ArrowDownwardIcon className='move-down-icon' />
                    </IconButton>
                    <IconButton onClick={() => handleOpenMessageDialog(params.row.nickname, params.row.phone)}>
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
        </Paper>
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
