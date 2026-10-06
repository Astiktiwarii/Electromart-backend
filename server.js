const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Base64 screenshot badi image ho sakti hai, isliye 10mb limit rakhi hai
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Transporter Setup (Gmail SMTP)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Order Processing API
app.post('/api/order', async (req, res) => {
    const { customer, items, totalPrice, paymentMethod, utr, screenshot } = req.body;
    const itemListText = items.map(i => `- ${i.name}: ₹${i.price}`).join('\n');

    // 1. Customer Confirmation Email
    const customerMail = {
        from: `ElectroMart <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: 'Order Confirmation - ElectroMart ⚡',
        text: `Hello ${customer.name},\n\nThank you for shopping at ElectroMart!\n\nOrder Details:\n${itemListText}\n\nTotal Price: ₹${totalPrice}\nPayment Method: ${paymentMethod}\nDelivery Address: ${customer.address}\n\nWe will process your order soon!`
    };

    // 2. Admin Notification Mail Setup
    let adminMailText = `New Order Received!\n\nCustomer Name: ${customer.name}\nEmail: ${customer.email}\nDelivery Address: ${customer.address}\nPayment Method: ${paymentMethod}\n`;
    
    if (utr) {
        adminMailText += `UTR / Transaction ID: ${utr}\n`;
    }
    
    adminMailText += `\nItems Ordered:\n${itemListText}\n\nTotal Amount: ₹${totalPrice}`;

    const adminMail = {
        from: `ElectroMart System <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `🚨 NEW ORDER (${paymentMethod}) from ${customer.name}`,
        text: adminMailText,
        attachments: []
    };

    // Screenshot Ko Email me Attachment ke roop me add kar rahe hain
    if (screenshot) {
        adminMail.attachments.push({
            filename: `payment_proof_${Date.now()}.png`,
            path: screenshot
        });
    }

    try {
        await transporter.sendMail(customerMail);
        await transporter.sendMail(adminMail);
        res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send confirmation emails' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});