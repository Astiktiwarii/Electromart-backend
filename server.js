const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Static Files Serve Karein (public folder se index.html serve hoga)
app.use(express.static(path.join(__dirname, 'public')));

// Email Sending Transporter (Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Checkout Email Receipt API Endpoint
app.post('/send-receipt', async (req, res) => {
    const { email, total } = req.body;

    if (!email || !total) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email aur Total Amount dono required hain!' 
        });
    }

    const mailOptions = {
        from: `"ElectroMart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Order Receipt - ElectroMart ⚡',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #2563eb; text-align: center;">ElectroMart ⚡</h2>
                <hr style="border: none; border-top: 1px solid #eeeeee;">
                <p>Hello,</p>
                <p>Thank you for shopping with us! Your order has been placed successfully.</p>
                <div style="background: #f5f7fb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">Total Paid: ₹${total}</p>
                </div>
                <p style="color: #555; font-size: 14px;">If you have any questions, reply to this email.</p>
                <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">&copy; 2026 ElectroMart. All rights reserved.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ 
            success: true, 
            message: 'Receipt aapke email par bhej di gayi hai!' 
        });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Email bhejne me issue aaya.', 
            error: error.message 
        });
    }
});

// Catch-all Route (Frontend Fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});