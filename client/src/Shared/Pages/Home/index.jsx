import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar'; // ייבוא Snackbar
import Alert from '@mui/material/Alert'; // ייבוא Alert
import roomManage from '../../../assets/Images/roomManage.jpg';
import './index.css';

export default function Home() {
  const [user, setUser] = useState(null); // שמירת המידע על המשתמש המחובר
  const [rooms, setRooms] = useState([]); // שמירת רשימת החדרים
  const [isEditing, setIsEditing] = useState(false); // מזהה החדר שנערך כרגע
  const [editedRoomName, setEditedRoomName] = useState(''); // שם החדר הנערך
  const [editedRoomType, setEditedRoomType] = useState(''); // סוג החדר הנערך
  const [openAddRoom, setOpenAddRoom] = useState(false); // מצב פתיחת חלון הוספת חדר
  const [newRoomName, setNewRoomName] = useState(''); // שם החדר החדש
  const [newRoomType, setNewRoomType] = useState('Pop'); // סוג החדר החדש
  const [userIp, setUserIp] = useState(''); 
  const [openSnackbar, setOpenSnackbar] = useState(false);


  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log(parsedUser);

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
      localStorage.removeItem('user');
      setOpenSnackbar(true); // פתיחת ה-Snackbar
      setTimeout(() => {
        navigate('/'); // ניתוב לעמוד ההתחברות אחרי 2 שניות
      }, 2000);
    } catch (error) {
      alert(`Error: ${error.message}`);
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
      roomID: 0, // הוספת מזהה ייחודי חדש שמבוסס על מספר החדרים הקיימים
      roomName: newRoomName,
      ownerID: user?.id, // מזהה בעל החדר הוא המשתמש המחובר
      createdAt: getCurrentDate(), // יצירת תאריך בפורמט ISO
      roomType: newRoomType, // סוג החדר
      roomPassword: passwordRoom,
      IpRoom: "192.168.1.1"//IpRoom
    };

    try {
      // שליחת בקשת POST לכתובת ה-API שלך
      const response = await fetch('http://www.ApiEnchanter.somee.com/api/KaraokeRooms/create', {
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
        setNewRoomType(''); // איפוס סוג החדר החדש
        // setUserIp(user?.id.toString());
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
  const onDelete = (id) => {

    try {
      fetch(`http://www.apienchanter.somee.com/api/KaraokeRooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      }).then((response) => {
        if (response.ok) {
          const updatedRooms = rooms.filter(room => room.roomID !== id)
          setRooms(updatedRooms);
          console.log(updatedRooms);
        } else {
          alert('Failed to delete room.');
        }
      })
        .catch((error) => {
          alert(`Error deleting room: ${error.message}`);
        });
    } catch (error) {
      alert(`Error deleting room: ${error.message}`);
    }


  }
  const onEdit = (id) => {

    setIsEditing(true)

  }
  return (
    <div className='container'>
      {/* התראה של Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Logout Successful
        </Alert>
      </Snackbar>

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

      <div className="left-block">
        <div className='content'>
          <button onClick={handleLogout} className='logout-button'>
            Log Out
          </button>
          <button onClick={handleAddRoom} className='add-room-button'>Add New Room</button>
          <p style={{ color: 'white', fontSize: "2rem" }}>
          </p>
        </div>
      </div>
      <aside className="right-block">
        <div className="content">
          <table>
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Owner ID</th>
                <th>Created At</th>
                <th>Room Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => (
                <tr key={room.roomID + idx}>
                  <td
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => handleRoomClick(room.roomID)}
                  >
                    {room.roomName}
                  </td>
                  <td>{room.ownerID}</td>
                  <td>{room.createdAt}</td>
                  <td>{room.roomType}</td>
                  <td className="action-buttons">
                    <div>
                      <IconButton className="delete-icon-button" onClick={() => onDelete(room.roomID)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton className="edit-icon-button" onClick={() => onEdit(room.roomID)}>
                        <EditIcon />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
      {isEditing && (
        <dialog open onClose={() => setIsEditing(false)}>
          <form className="edit-room-dialog">
            <h2>Edit Room</h2>
            <label htmlFor="roomName">Room Name:</label>
            <input
              type="text"
              id="roomName"
              value={editedRoomName}
              onChange={(e) => setEditedRoomName(e.target.value)} />
          </form>
          <button onClick={() => { }}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </dialog>
      )}
    </div>
  );
}

