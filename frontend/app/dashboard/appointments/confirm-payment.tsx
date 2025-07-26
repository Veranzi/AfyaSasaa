"use client";
import { useState, useEffect } from "react";

const DEFAULT_APPOINTMENT = {
  doctor: "Dr. Achieng Onyango (Gynecologist)",
  clinic: "Nairobi Women’s Hospital",
  date: "2025-07-17",
  time: "10:30 AM",
  mode: "In-person",
  fee: 2000,
};

export default function ConfirmPaymentPage({ summary }: { summary?: any }) {
  const [appointment] = useState(summary || DEFAULT_APPOINTMENT);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [sendReceipt, setSendReceipt] = useState({ email: true, sms: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePay = () => {
    setError("");
    if (!billingName || !billingEmail) {
      setError("Please enter your name and email.");
      return;
    }
    if (paymentMethod === "mpesa" && !/^((254|\+254|0)?7\d{8})$/.test(mpesaPhone)) {
      setError("Enter a valid Kenyan phone number for M-PESA.");
      return;
    }
    if (paymentMethod === "card" && (!cardName || !cardNo || !expiry || !cvv)) {
      setError("Please fill in all card details.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  const [proceed, setProceed] = useState(false);
  if (success && !proceed) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-pink-700 flex items-center gap-2">Payment Successful</h2>
        <div className="mb-4">Thank you, <b>{billingName}</b>! Your appointment is confirmed and payment received.</div>
        <div className="mb-2">A receipt will be sent to: {sendReceipt.email && billingEmail}{sendReceipt.email && sendReceipt.sms && ", "}{sendReceipt.sms && "(SMS)"}</div>
        <button className="mt-4 bg-pink-500 text-white px-4 py-2 rounded" onClick={() => setProceed(true)}>Proceed</button>
      </div>
    );
  }
  if (success && proceed) {
    const summary = {
      doctor: appointment.doctor,
      clinic: appointment.clinic,
      date: appointment.date,
      time: appointment.time,
      mode: appointment.mode,
    };
    const AppointmentConfirmation = require("./confirmation.tsx").default;
    return <AppointmentConfirmation summary={summary} />;
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span role="img" aria-label="location">📍</span> Confirm & Pay for Your Appointment
      </h2>
      {/* Appointment Summary */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-2xl shadow p-6 flex flex-col gap-4 border border-pink-100">
          <div className="flex items-center gap-3 text-lg md:text-xl font-semibold text-pink-700">
            <span role="img" aria-label="doctor">👩‍⚕️</span>
            <span>Doctor:</span>
            <span className="text-gray-900 font-bold">{appointment.doctor}</span>
          </div>
          <div className="flex items-center gap-3 text-lg md:text-xl font-semibold text-purple-700">
            <span role="img" aria-label="clinic">🏥</span>
            <span>Clinic:</span>
            <span className="text-gray-900 font-bold">{appointment.clinic}</span>
          </div>
          <div className="flex items-center gap-3 text-lg md:text-xl font-semibold text-blue-700">
            <span role="img" aria-label="calendar">📅</span>
            <span>Date & Time:</span>
            <span className="text-gray-900 font-bold">{appointment.date ? `${new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })} at ${appointment.time}` : "-"}</span>
          </div>
          <div className="flex items-center gap-3 text-lg md:text-xl font-semibold text-amber-700">
            <span role="img" aria-label="mode">💬</span>
            <span>Mode:</span>
            <span className="text-gray-900 font-bold">{appointment.mode}</span>
          </div>
          <div className="flex items-center gap-3 text-lg md:text-xl font-semibold text-green-700">
            <span role="img" aria-label="fee">💸</span>
            <span>Consultation Fee:</span>
            <span className="text-pink-700 font-extrabold text-2xl">KSh {appointment.fee?.toLocaleString?.() ?? 2000}</span>
          </div>
        </div>
      </div>
      {/* Payment Options */}
      <div className="mb-6">
        <div className="font-semibold mb-2">💰 Pay with:</div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={paymentMethod === "mpesa"} onChange={() => setPaymentMethod("mpesa")} />
            M-PESA
          </label>
          {paymentMethod === "mpesa" && (
            <div className="ml-6 mt-2">
              <label className="block mb-1">Enter Phone:</label>
              <input className="border rounded px-3 py-2 w-full" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="e.g. 0712345678" />
              <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded" type="button" onClick={() => alert('STK Push sent (demo)!')}>Send STK Push</button>
            </div>
          )}
        </div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
            Card
          </label>
          {paymentMethod === "card" && (
            <div className="ml-6 mt-2 grid grid-cols-2 gap-2">
              <input className="border rounded px-3 py-2 col-span-2" placeholder="Name on Card" value={cardName} onChange={e => setCardName(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Card No" value={cardNo} onChange={e => setCardNo(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} />
            </div>
          )}
        </div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} />
            PayPal / Flutterwave (Optional)
          </label>
          {paymentMethod === "paypal" && (
            <div className="ml-6 mt-2 text-gray-500">Demo only. Payment integration coming soon.</div>
          )}
        </div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={paymentMethod === "clinic"} onChange={() => setPaymentMethod("clinic")} />
            I’ll pay at the clinic
          </label>
        </div>
      </div>
      {/* Billing Info */}
      <div className="mb-6">
        <div className="mb-2">
          <label className="block font-medium mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" value={billingName} onChange={e => setBillingName(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} />
        </div>
        <div className="mb-2 flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sendReceipt.email} onChange={e => setSendReceipt(r => ({ ...r, email: e.target.checked }))} />
            Email
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sendReceipt.sms} onChange={e => setSendReceipt(r => ({ ...r, sms: e.target.checked }))} />
            SMS
          </label>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <button className="bg-pink-500 text-white px-4 py-2 rounded w-full font-bold" onClick={handlePay} disabled={loading}>
        {loading ? "Processing..." : "CONFIRM & PAY NOW →"}
      </button>
      <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
        <span role="img" aria-label="lock">🔒</span> Your payment is secure & encrypted
      </div>
    </div>
  );
} 