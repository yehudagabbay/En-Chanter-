import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import './index.css';

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
  const location = useLocation();
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const fetchRooms = async () => {
        try {
          const response = await fetch(`http://www.apienchanter.somee.com/api/KaraokeRooms/room/owner/${parsedUser.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
            },
          });
          console.log(response);

          if (response.ok) {
            const data = await response.json();
            console.log(data);
            
            setRooms(data); // עדכון רשימת החדרים בסטייט
          } else {
            alert('Failed to fetch rooms.');
          }
        } catch (error) {
          if (error.message === 'Unexpected end of JSON input') {
            alert('צור את החדר הראשון שלך');
          } else {
            alert(`Error fetching rooms: ${error.message}`);
          }
        }
      };

      fetchRooms(); // קריאה לפונקציה לטעינת החדרים
    } else {
      navigate('/'); // ניתוב לעמוד ההתחברות אם המשתמש לא מחובר
    }
  }, [navigate]);

  // פונקציה ליציאה מהחשבון
  const handleLogout = async () => {
    try {
      localStorage.removeItem('user'); // הסרת המשתמש מ-localStorage
      alert('Logout Successful');
      navigate('/'); // ניתוב לעמוד ההתחברות
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
    // פונקציה לקבלת תאריך נוכחי בפורמט המתאים
    const getCurrentDate = () => {
      const today = new Date();
      return today.toISOString(); // יחזיר תאריך בפורמט ISO
    };
    const passwordRoom = user?.id.toString()
    // יצירת אובייקט החדר החדש עם הפרטים מהסטייט
    const newRoom = {
      id: 0, // הוספת מזהה ייחודי חדש שמבוסס על מספר החדרים הקיימים
      roomName: newRoomName,
      ownerID: user?.id, // מזהה בעל החדר הוא המשתמש המחובר
      createdAt: getCurrentDate(), // יצירת תאריך בפורמט ISO
      roomType: newRoomType, // סוג החדר
      roomPassword: passwordRoom
    };

    try {
      // שליחת בקשת POST לכתובת ה-API שלך
      const response = await fetch('http://www.apienchanter.somee.com/api/KaraokeRooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(newRoom),
      });
      console.log(newRoom);
      // טיפול בתגובה מהשרת
      if (response.ok) {
        // אם הבקשה עברה בהצלחה, נוסיף את החדר לסטייט הקיים
        setRooms([...rooms, newRoom]);
        setOpenAddRoom(false); // סגירת חלון הוספת חדר
        setNewRoomName(''); // איפוס שם החדר החדש
        setNewRoomType('Pop'); // איפוס סוג החדר החדש
        console.log(`לאחר היצירה:`, newRoom);
      } else {
        // במקרה של שגיאה מצד השרת, נקרא את הודעת השגיאה
        const errorText = await response.text();
        alert(`Failed to add room: ${errorText}`);
      }
    } catch (error) {
      // טיפול בשגיאה בעת שליחה לשרת
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
  const handleDeleteClick = async (id) => {
    console.log(id);

    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await fetch(`http://www.apienchanter.somee.com/api/KaraokeRooms/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        });
        console.log(id);
        if (response.ok) {
          setRooms((prevRooms) => prevRooms.filter((r) => r.roomId !== room.roomId)); // מחיקת החדר מהסטייט
        } else {
          alert('Failed to delete room.');
        }
      } catch (error) {
        alert(`Error deleting room: ${error.message}`);
      }
    }
  };


  return (
    <div className='container'>
      {user && (
        <>
          <div className='sidebar'>
            <button onClick={handleLogout} className='logout-button'>
              Log Out
            </button>
            <button onClick={handleAddRoom} className='add-room-button'>Add New Room</button>
            <p style={{ color: 'white', fontSize: "2rem" }}> asdf
            }</p>
          </div>
          <div className='content'>
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={rooms}
                columns={[
                  {
                    field: 'roomName',
                    headerName: 'Room Name',
                    flex: 1,
                    renderCell: (params) =>
                      editingRoomId === params.row.id ? (
                        <TextField
                          value={editedRoomName}
                          onChange={(e) => setEditedRoomName(e.target.value)}
                        />
                      ) : (
                        <span
                          onClick={() => handleRoomClick(params.row.roomId)}
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {params.value}
                        </span>
                      ),
                  },
                  { field: 'ownerId', headerName: 'Owner ID', flex: 1 },
                  { field: 'createdAt', headerName: 'Created At', flex: 1 },
                  {
                    field: 'roomType',
                    headerName: 'Room Type',
                    flex: 1,
                    renderCell: (params) =>
                      editingRoomId === params.row.id ? (
                        <TextField
                          value={editedRoomType}
                          onChange={(e) => setEditedRoomType(e.target.value)}
                        />
                      ) : (
                        params.value
                      ),
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    flex: 1,
                    renderCell: (params) =>
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
                          <IconButton onClick={() => handleDeleteClick(params?.row?.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      ),
                  },
                ]}
                getRowId={(row) => row.roomID || row.id} // שינוי כאן: שימוש במזהה ייחודי מותאם אישית

                pageSizeOptions={[5, 10, 100]}
                pageSize={10}
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
      {/* <div className="left-block"></div>
      <aside className="right-block">
        <table>
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Owner ID</th>
              <th>Created At</th>
              <th>Room Type</th>
            </tr>

          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.roomID}>
                <td>{room.roomName}</td>
                <td>{room.ownerId}</td>
                <td>{room.createdAt}</td>
                <td>{room.roomType}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </aside> */}

    </div>
  );
}
