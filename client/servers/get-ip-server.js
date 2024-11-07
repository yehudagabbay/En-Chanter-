import cors from 'cors';
import express from 'express';
import os from 'os';

const app = express();
app.use(cors());

app.get('/api/ip', (req, res) => {
    const networkInterfaces = os.networkInterfaces();
    let ip = 'IP not found';

    outerLoop:
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                ip = address.address;
                break outerLoop; // יציאה מכל הלולאות
            }
        }
    }

    res.json({ ip });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
