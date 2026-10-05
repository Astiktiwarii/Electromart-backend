const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API Route for Sending Email
app.post('/send-email', async (req, res) => {
    const { toEmail, subject, text } = req.body;

    if (!toEmail) {
        return res.status(400).json({ success: false, error: 'Email required hai.' });
    }

    const mailOptions = {
        from: `ElectroMart <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${toEmail}`);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Full Frontend Served Directly from Server
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ElectroMart - Electronics Store</title>
<style>
*{ margin:0; padding:0; box-sizing:border-box; font-family:Arial, sans-serif; }
body{ background:#f5f7fb; color:#222; }
.topbar{ background:#111827; color:white; text-align:center; padding:10px; font-size:14px; }
.navbar{ background:white; display:flex; justify-space-between; align-items:center; padding:18px 7%; box-shadow:0 2px 10px rgba(0,0,0,0.1); position:sticky; top:0; z-index:1000; }
.logo{ font-size:25px; font-weight:bold; color:#2563eb; }
.logo span{ color:#111827; }
.nav-links{ display:flex; gap:25px; list-style:none; }
.nav-links a{ color:#333; font-weight:bold; cursor:pointer; }
.cart-button{ background:#2563eb; color:white; padding:10px 16px; border-radius:7px; cursor:pointer; border:none; font-weight:bold; }
.page{ display:none; min-height:80vh; }
.page.active{ display:block; }
.hero{ min-height:450px; display:flex; align-items:center; padding:50px 7%; background:linear-gradient(120deg,#dbeafe,#eff6ff); }
.hero-text h1{ font-size:45px; color:#111827; margin-bottom:15px; }
.hero-text h1 span{ color:#2563eb; }
.shop-button{ background:#2563eb; color:white; padding:12px 22px; border:none; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer; }
.section{ padding:50px 7%; }
.products{ display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:25px; }
.product{ background:white; border-radius:12px; overflow:hidden; box-shadow:0 3px 12px rgba(0,0,0,0.08); padding:15px; text-align:center; }
.product img{ width:100%; height:180px; object-fit:cover; border-radius:8px; }
.price{ font-size:20px; font-weight:bold; color:#2563eb; margin:10px 0; }
.add-button{ width:100%; padding:10px; background:#111827; color:white; border:none; border-radius:6px; cursor:pointer; }
.cart-container{ max-width:600px; margin:40px auto; background:white; padding:25px; border-radius:12px; box-shadow:0 3px 15px rgba(0,0,0,0.1); }
.cart-item{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #ddd; }
.checkout-input{ width:100%; padding:12px; margin:15px 0; border:1px solid #ccc; border-radius:6px; }
.checkout-button{ width:100%; padding:14px; background:#16a34a; color:white; border:none; border-radius:8px; font-size:18px; font-weight:bold; cursor:pointer; }
footer{ background:#111827; color:white; padding:20px; text-align:center; }
</style>
</head>
<body>

<div class="topbar">⚡ Special Electronics Sale – Up to 40% Off ⚡</div>

<nav class="navbar">
    <div class="logo">Electro<span>Mart</span> ⚡</div>
    <ul class="nav-links">
        <li><a onclick="showPage('home')">🏠 Home</a></li>
        <li><a onclick="showPage('products')">🛍️ Products</a></li>
        <li><button class="cart-button" onclick="showPage('cart')">🛒 Cart (<span id="cartCount">0</span>)</button></li>
    </ul>
</nav>

<section id="home" class="page active">
    <div class="hero">
        <div class="hero-text">
            <h1>Upgrade Your <span>Digital Life</span></h1>
            <p style="margin-bottom:20px;">Buy smartphones, laptops, headphones & smart watches instantly.</p>
            <button class="shop-button" onclick="showPage('products')">🛍️ Shop Now</button>
        </div>
    </div>
</section>

<section id="products" class="page">
    <div class="section">
        <h2 style="margin-bottom:20px; text-align:center;">🛍️ Products</h2>
        <div class="products">
            <div class="product">
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400">
                <h3>Smartphone</h3>
                <div class="price">₹29,999</div>
                <button class="add-button" onclick="addToCart('Smartphone', 29999)">🛒 Add to Cart</button>
            </div>
            <div class="product">
                <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400">
                <h3>Laptop</h3>
                <div class="price">₹59,999</div>
                <button class="add-button" onclick="addToCart('Laptop', 59999)">🛒 Add to Cart</button>
            </div>
            <div class="product">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400">
                <h3>Headphones</h3>
                <div class="price">₹3,999</div>
                <button class="add-button" onclick="addToCart('Headphones', 3999)">🛒 Add to Cart</button>
            </div>
        </div>
    </div>
</section>

<section id="cart" class="page">
    <div class="cart-container">
        <h2>🛒 Your Shopping Cart</h2>
        <div id="cartItemsList"><p style="margin-top:15px; color:#666;">Cart is empty.</p></div>
        <h3 style="margin-top:15px; text-align:right;">Total: ₹<span id="cartTotal">0</span></h3>
        
        <div style="margin-top:20px;">
            <h4>Enter Email to Receive Bill:</h4>
            <input type="email" id="customerEmail" class="checkout-input" placeholder="Enter your email address">
            <button class="checkout-button" onclick="placeOrderAndSendEmail()">Place Order & Send Receipt ⚡</button>
        </div>
    </div>
</section>

<footer><p>© 2026 ElectroMart. All rights reserved.</p></footer>

<script>
    let cart = [];
    function showPage(p){ document.querySelectorAll('.page').forEach(x=>x.classList.remove('active')); document.getElementById(p).classList.add('active'); }
    function addToCart(n, p){ cart.push({name:n, price:p}); updateCart(); alert(n + ' added!'); }
    function updateCart(){
        document.getElementById('cartCount').innerText = cart.length;
        let list = document.getElementById('cartItemsList'), total = 0, html = '';
        if(cart.length === 0){ list.innerHTML = '<p style="margin-top:15px; color:#666;">Cart is empty.</p>'; document.getElementById('cartTotal').innerText = '0'; return; }
        cart.forEach(i => { total += i.price; html += \`<div class="cart-item"><span>\${i.name}</span><strong>₹\${i.price}</strong></div>\`; });
        list.innerHTML = html;
        document.getElementById('cartTotal').innerText = total;
    }
    async function placeOrderAndSendEmail(){
        if(cart.length === 0) return alert('Cart is empty!');
        let email = document.getElementById('customerEmail').value;
        if(!email) return alert('Please enter email!');

        let itemsStr = cart.map(i => \`\${i.name} - ₹\${i.price}\`).join('\\n');
        let total = document.getElementById('cartTotal').innerText;

        try {
            let res = await fetch('/send-email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    toEmail: email,
                    subject: 'ElectroMart Order Confirmation',
                    text: \`Order Successful!\\n\\nItems:\\n\${itemsStr}\\n\\nTotal: ₹\${total}\`
                })
            });
            let data = await res.json();
            if(data.success){
                alert('🎉 Order Placed! Confirmation Mail sent to ' + email);
                cart = []; updateCart();
            } else { alert('Error: ' + data.error); }
        } catch(e) { alert('Backend Server connect nahi ho pa raha!'); }
    }
</script>
</body>
</html>
    `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});