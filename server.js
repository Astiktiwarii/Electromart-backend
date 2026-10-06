const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Direct Email Config
const EMAIL_USER = "analysisprediction3@gmail.com";
const EMAIL_PASS = "kijafhjqhlxwwxcu"; 

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Order API Endpoint
app.post('/api/orders', async (req, res) => {
    const { customerName, customerEmail, shippingAddress, items, totalAmount } = req.body;

    if (!customerEmail || !customerName || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: "Sabhi Details Bharein!" });
    }

    // HTML Email Template
    const itemsList = items.map(item => `<li>${item.title} - ₹${item.price}</li>`).join('');
    const mailOptions = {
        from: `"ElectroMart ⚡" <${EMAIL_USER}>`,
        to: customerEmail,
        subject: "Order Confirmation - ElectroMart",
        html: `
            <h2>Namaste ${customerName},</h2>
            <p>Aapka Order Successfully Place Ho Gaya Hai!</p>
            <h3>Items:</h3>
            <ul>${itemsList}</ul>
            <p><b>Total Amount:</b> ₹${totalAmount}</p>
            <p><b>Address:</b> ${shippingAddress}</p>
            <br>
            <p>ElectroMart Par Shopping Karne Ke Liye Dhanyawad!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email Successfully Sent To:", customerEmail);
        res.json({ success: true, message: "Order Placed & Confirmation Sent!" });
    } catch (error) {
        console.error("Email Error Details:", error);
        res.status(500).json({ success: false, message: "Email Nahi Bhej Paya." });
    }
});

app.listen(5000, () => {
    console.log("Server Running on http://localhost:5000");
});