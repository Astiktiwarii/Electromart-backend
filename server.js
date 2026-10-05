const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Email Handler Function
const handleSendMail = async (req, res) => {
    const { email, total } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"ElectroMart" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '⚡ ElectroMart Order Confirmation & Receipt',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Thank you for your order! ⚡</h2>
                    <p>Your order has been placed successfully.</p>
                    <h3>Total Amount Paid: ₹${total || 0}</h3>
                    <p>We will notify you once your items are dispatched.</p>
                    <br>
                    <p>Regards,<br><strong>ElectroMart Team</strong></p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Receipt sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send receipt' });
    }
};

// Route 1
app.post('/send-email', handleSendMail);

// Route 2
app.post('/send-receipt', handleSendMail);

// Fallback route to serve index.html for all UI requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});