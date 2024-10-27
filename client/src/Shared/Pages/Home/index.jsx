import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import './Home.css';

export default function Home() {
  const [user, setUser] = useState(null); // שמירת המידע על המשתמש המחובר
  const [rooms, setRooms] = useState([]); // שמירת רשימת החדרים
  const [editingRoomId, setEditingRoomId] = useState(null); // מזהה החדר שנערך כרגע
  const [editedRoomName, setEditedRoomName] = useState(''); // שם החדר הנערך
  const [editedRoomType, setEditedRoomType] = useState(''); // סוג החדר הנערך
  const [openAddRoom, setOpenAddRoom] = useState(false); // מצב פתיחת חלון הוספת חדר
  const [newRoomName, setNewRoomName] = useState(''); // שם החדר החדש
  const [newRoomType, setNewRoomType] = useState('Pop'); // סוג החדר החדש
  const navigate = useNavigate();
  useEffect(() => {
    // נתונים מדומים להצגת החדרים
    const mockRooms = [
      { id: 1, roomId: '1', roomName: 'Room A', ownerId: '101', createdAt: '2024-10-01', roomType: 'Pop' },
      { id: 2, roomId: '2', roomName: 'Room B', ownerId: '102', createdAt: '2024-10-02', roomType: 'Rock' },
      { id: 3, roomId: '3', roomName: 'Room C', ownerId: '103', createdAt: '2024-10-03', roomType: 'Jazz' },
    ];
    setRooms(mockRooms); // עדכון רשימת החדרים בסטייט
  }, []);

  useEffect(() => {
    // בדיקה אם יש משתמש מחובר בעת טעינת הקומפוננטה
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // אם יש משתמש שמור ב-localStorage, עדכון הסטייט
    } else {
      navigate('/auth/login'); // ניתוב לעמוד ההתחברות אם המשתמש לא מחובר
    }
  }, [navigate]);



  // פונקציה ליציאה מהחשבון
  const handleLogout = async () => {
    try {
      localStorage.removeItem('user'); // הסרת המשתמש מ-localStorage
      alert('Logout Successful');
      navigate('/auth/login'); // ניתוב לעמוד ההתחברות
    } catch (error) {
      alert(`Error: ${error.message}`); // טיפול בשגיאה
    }
  };

  // פונקציה לפתיחת חלון הוספת חדר חדש
  const handleAddRoom = () => {
    setOpenAddRoom(true); // פתיחת חלון הוספת חדר
  };

  // פונקציה לאישור הוספת חדר חדש
  const handleAddRoomConfirm = async () => {
    // יצירת מספר רנדומלי של 4 ספרות להוספה ל-ID של המשתמש
    const getCurrentDate = () => {
      const today = new Date();
      return today.toISOString()// יחזיר תאריך בפורמט YYYY-MM-DD
    };

    const newRoom = {
      roomID: 0,
      roomName: newRoomName,
      ownerID: user?.id, // מזהה בעל החדר הוא המשתמש המחובר
      createdAt: getCurrentDate(), // יצירת אובייקט Date בפורמט yyyy-mm-dd
      roomType: newRoomType, // סוג החדר
    };
    console.log(newRoom)
    try {
      const response = await fetch('http://www.enchanterapiuser.somee.com/api/karakoeRoom/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(newRoom),
      });

      console.log(response)
      if (response.ok) {
        setRooms([...rooms, { ...newRoom, id: rooms.length + 1 }]);
        setOpenAddRoom(false); // סגירת חלון הוספת חדר
        setNewRoomName(''); // איפוס שם החדר החדש
        setNewRoomType('Pop'); // איפוס סוג החדר החדש
      } else {
        const errorText = await response.text();
        alert(`Failed to add room: ${errorText}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // פונקציה לעריכת פרטי חדר קיים
  const handleEditClick = (room) => {
    setEditingRoomId(room.id); // שמירת מזהה החדר שנערך כרגע
    setEditedRoomName(room.roomName); // שמירת שם החדר הנערך בסטייט
    setEditedRoomType(room.roomType); // שמירת סוג החדר הנערך בסטייט
  };

  // פונקציה לשמירת השינויים בפרטי חדר
  const handleSaveClick = (roomId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, roomName: editedRoomName, roomType: editedRoomType } : room
      )
    );
    setEditingRoomId(null); // איפוס מזהה החדר שנערך
  };

  // פונקציה לביטול העריכה
  const handleCancelClick = () => {
    setEditingRoomId(null); // איפוס מזהה החדר שנערך
  };

  // פונקציה לניווט לעמוד ניהול חדר מסוים
  const handleRoomClick = (roomId) => {
    navigate(`/home/roomManager/${roomId}`); // ניווט לעמוד ניהול החדר
  };

  // פונקציה למחיקת חדר
  const handleDeleteClick = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId)); // מחיקת החדר מהסטייט
    }
  };

  return (
    <div className='container layout'>
      {user && (
        <>
          <div className='sidebar'>
            <button onClick={handleLogout} className='logout-button'>
              Log Out
            </button>
            <button onClick={handleAddRoom} className='add-room-button'>Add New Room</button>
          </div>
          <div className='content'>
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={rooms}
                columns={[
                  {
                    field: 'roomName', headerName: 'Room Name', flex: 1, renderCell: (params) => (
                      editingRoomId === params.row.id ? (
                        <TextField
                          value={editedRoomName}
                          onChange={(e) => setEditedRoomName(e.target.value)}
                        />
                      ) : (
                        <span onClick={() => handleRoomClick(params.row.roomId)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                          {params.value}
                        </span>
                      )
                    )
                  },
                  { field: 'ownerId', headerName: 'Owner ID', flex: 1 },
                  { field: 'createdAt', headerName: 'Created At', flex: 1 },
                  {
                    field: 'roomType', headerName: 'Room Type', flex: 1, renderCell: (params) => (
                      editingRoomId === params.row.id ? (
                        <TextField
                          value={editedRoomType}
                          onChange={(e) => setEditedRoomType(e.target.value)}
                        />
                      ) : (
                        params.value
                      )
                    )
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    flex: 1,
                    renderCell: (params) => (
                      editingRoomId === params.row.id ? (
                        <>
                          <IconButton onClick={() => handleSaveClick(params.row.id)}>
                            <CheckIcon />
                          </IconButton>
                          <IconButton onClick={handleCancelClick}>
                            <CloseIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditClick(params.row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )
                    ),
                  },
                ]}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0 }}
              />
            </Paper>
          </div>
          <Dialog open={openAddRoom} onClose={() => setOpenAddRoom(false)}>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Room Name"
                type="text"
                fullWidth
                variant="standard"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                helperText="Please enter the room name"
              />
              <Select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                fullWidth
                variant="standard"
                margin="dense"
              >
                <MenuItem value={'Pop'}>Pop</MenuItem>
                <MenuItem value={'Rock'}>Rock</MenuItem>
                <MenuItem value={'Jazz'}>Jazz</MenuItem>
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddRoom(false)}>Cancel</Button>
              <Button onClick={handleAddRoomConfirm}>Add Room</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}
