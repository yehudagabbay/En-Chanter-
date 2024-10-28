import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
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
import './RoomManager.css';

export default function RoomManager() {
  const { roomId } = useParams(); // Get the roomId from the URL
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Mock data for users in the room
    const mockUsers = [
      { id: 1, name: 'User A', email: 'usera@example.com', phone: '123-456-7890' },
      { id: 2, name: 'User B', email: 'userb@example.com', phone: '987-654-3210' },
      { id: 3, name: 'User C', email: 'userc@example.com', phone: '555-666-7777' },
    ];
    setUsers(mockUsers);

    // Mock data for song requests in the room
    const mockRequests = [
      { id: 1, nickname: 'User A', phone: '123-456-7890', songName: 'Song A', link: 'https://example.com/songA' },
      { id: 2, nickname: 'User B', phone: '987-654-3210', songName: 'Song B', link: 'https://example.com/songB' },
      { id: 3, nickname: 'User C', phone: '555-666-7777', songName: 'Song C', link: 'https://example.com/songC' },
    ];
    setRequests(mockRequests);
  }, [roomId]);

  // Handlers for user actions
  const handleRemoveUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
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

  return (
    <div className='room-manager-container layout'>
      <div className='sidebar'>
        <h2>Song Requests</h2>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={requests}
            getRowId={(row) => row.id} // שימוש ב-ID כזיהוי ייחודי לשורה

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
                    <IconButton onClick={() => handleApproveRequest(params.row.id)}>
                      <CheckIcon className='approve-icon' />
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
        <h1>Room Manager for: {roomId}</h1>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={[
              { field: 'name', headerName: 'User Name', flex: 1 },
              { field: 'email', headerName: 'Email', flex: 1 },
              { field: 'phone', headerName: 'Phone Number', flex: 1 },
              {
                field: 'actions',
                headerName: 'Actions',
                flex: 1,
                renderCell: (params) => (
                  <IconButton onClick={() => handleRemoveUser(params.row.id)}>
                    <DeleteIcon className='remove-user-button' />
                  </IconButton>
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
