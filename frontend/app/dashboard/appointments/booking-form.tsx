"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
const ClinicMapSelector = dynamic(() => import("@/components/ClinicMapSelector"), { ssr: false });

interface Doctor {
  id: string;  // This is the uid/clinicianId
  name: string;  // This is the name from users collection
  specialization?: string;
}

interface STKPushResponse {
  success: boolean;
  checkoutRequestId: string;
  message: string;
}

export default function AppointmentBookingForm({ onBook }: { onBook: (summary: any) => void }) {
  // Step state
  const [step, setStep] = useState(1);
  // Form state
  const [location, setLocation] = useState("");
  const [facility, setFacility] = useState("");
  const [doctor, setDoctor] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [consultationType, setConsultationType] = useState("in-person");
  const [insurance, setInsurance] = useState("");
  const [policyNo, setPolicyNo] = useState("");
  const [error, setError] = useState("");
  const [selectedClinicMap, setSelectedClinicMap] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [phoneForPayment, setPhoneForPayment] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Add phone number normalization function
  const normalizePhone = (phone: string) => {
    if (!phone) return "";
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");
    
    if (digits.startsWith("0")) {
      return "+254" + digits.slice(1);
    } else if (digits.startsWith("254")) {
      return "+" + digits;
    } else if (digits.startsWith("7")) {
      return "+254" + digits;
    } else if (!digits.startsWith("+254")) {
      return "+254" + digits;
    }
    return "+" + digits.replace(/^\+/, "");
  };

  // Add phone validation function
  const validatePhone = (phone: string) => {
    const normalized = normalizePhone(phone);
    // Check if it's a valid Kenyan phone number
    const isValid = /^\+254[17]\d{8}$/.test(normalized);
    if (!isValid) {
      return "Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX or +2547XX XXX XXX)";
    }
    return "";
  };

  // Data states
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string; locationId: string }>>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Array<{ doctorId: string; date: string; times: string[] }>>([]);
  const [loading, setLoading] = useState(false);

  // Load facilities that have clinicians
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        // Get unique facilities from slots collection
        const slotsQuery = query(collection(db, "slots"), where("available", "==", true));
        const slotsSnapshot = await getDocs(slotsQuery);
        
        // Get unique facilities from slots
        const uniqueFacilities = new Set<string>();
        slotsSnapshot.forEach(doc => {
          const facilityName = doc.data().facility;
          if (facilityName) uniqueFacilities.add(facilityName);
        });

        setFacilities(Array.from(uniqueFacilities).map(name => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          locationId: location // Keep location ID for backward compatibility
        })));
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setError("Failed to load facilities. Please try again.");
      }
      setLoading(false);
    };

    fetchFacilities();
  }, []);

  // Load doctors when facility is selected
  useEffect(() => {
    if (!facility) return;

    const fetchDoctors = async () => {
      setLoading(true);
      setError(""); // Clear any previous errors
      try {
        const selectedFacilityName = facilities.find(f => f.id === facility)?.name;

        // Get slots for the facility
        const slotsQuery = query(
          collection(db, "slots"),
          where("facility", "==", selectedFacilityName)
        );
        const slotsSnapshot = await getDocs(slotsQuery);
        
        // Get unique clinicianIds from slots
        const uniqueClinicianIds = new Set<string>();
        slotsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.clinicianId) {
            uniqueClinicianIds.add(data.clinicianId);
          }
        });

        // Create doctors array directly from clinicianIds
        const doctorsArray = Array.from(uniqueClinicianIds).map(id => ({
          id: id,
          name: id, // Just use the ID as the name
          specialization: undefined
        }));

        setDoctors(doctorsArray);
      } catch (error) {
        console.error("Error in fetchDoctors:", error);
        setError("Failed to load doctors. Please try again. " + (error instanceof Error ? error.message : ""));
      }
      setLoading(false);
    };

    fetchDoctors();
  }, [facility, facilities]);

  // Load slots when doctor is selected
  useEffect(() => {
    if (!doctor || !facility) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const selectedFacilityName = facilities.find(f => f.id === facility)?.name;
        console.log("Fetching slots for:", {
          facility: selectedFacilityName,
          doctorId: doctor
        });
        
        // Query slots by both clinicianId and facility
        const slotsQuery = query(
          collection(db, "slots"),
          where("clinicianId", "==", doctor),
          where("facility", "==", selectedFacilityName),
          where("available", "==", true)
        );
        const slotsSnapshot = await getDocs(slotsQuery);
        
        console.log("Found slots:", slotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Group slots by date
        const slotsByDate = new Map<string, string[]>();
        slotsSnapshot.forEach(doc => {
          const data = doc.data();
          const existingTimes = slotsByDate.get(data.date) || [];
          slotsByDate.set(data.date, [...existingTimes, data.time]);
        });

        // Convert to array and sort dates
        const sortedSlots = Array.from(slotsByDate.entries())
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
          .map(([date, times]) => ({
            doctorId: doctor,
            date,
            times: times.sort()
          }));

        console.log("Processed slots:", sortedSlots);
        setSlots(sortedSlots);

        // Clear date and time selections when slots change
        setDate("");
        setTime("");
      } catch (error) {
        console.error("Error fetching slots:", error);
        setError("Failed to load available slots. Please try again.");
      }
      setLoading(false);
    };

    fetchSlots();
  }, [doctor, facility, facilities]);

  // Auto-connect map selection to form fields
  const handleMapClinicSelect = (clinicObj: any) => {
    setSelectedClinicMap(clinicObj);
    // Find the matching facility
    const foundFacility = facilities.find(f => f.name === clinicObj.name);
    if (foundFacility) {
      setLocation(foundFacility.locationId);
      setFacility(foundFacility.id);
      setDoctor(""); // Clear doctor selection so user can pick
    }
  };

  // Step 1 validation
  const handleNext1 = () => {
    if ((!location || !facility || !doctor) && !selectedClinicMap) {
      setError("Please select location, facility, and doctor, or choose a facility from the map.");
      return;
    }
    setSpecialization(doctors.find(d => d.id === doctor)?.specialization || "");
    setError("");
    setStep(2);
  };

  // Step 2 validation
  const handleNext2 = () => {
    if (!date || !time) {
      setError("Please select date and time.");
      return;
    }
    setError("");
    setStep(3);
  };

  // Step 3 validation and submit
  const handleBook = () => {
    // Clear previous errors
    setError("");

    // Required fields validation
    if (!fullName || !phone || !email) {
      setError("Please fill in all required fields.");
      return;
    }

    // Phone validation
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const selectedFacility = facilities.find(f => f.id === facility);
    const selectedDoctor = doctors.find(d => d.id === doctor);

    // Calculate payment amount
    const baseAmount = 2000;
    const emergencyFee = emergency ? 1000 : 0;
    const totalAmount = baseAmount + emergencyFee;
    setPaymentAmount(totalAmount);
    
    // Normalize phone for payment
    const normalizedPhone = normalizePhone(phone);
    setPhoneForPayment(normalizedPhone);

    const summary = {
      doctor: selectedDoctor?.name + (selectedDoctor?.specialization ? ` (${selectedDoctor.specialization})` : ""),
      facility: selectedFacility?.name,
      date,
      time,
      mode: consultationType === "in-person" ? "In-person" : "Virtual",
      fee: totalAmount,
      fullName,
      phone: normalizedPhone, // Use normalized phone
      email,
      emergency,
      insurance,
      policyNo,
      symptoms,
    };

    // Show payment confirmation
    setShowPayment(true);
  };

  // Handle payment confirmation with proper validation and error handling
  const handlePaymentConfirm = async () => {
    try {
      setIsProcessingPayment(true);
      setError("");

      // Validate phone number again before processing payment
      const phoneError = validatePhone(phoneForPayment);
      if (phoneError) {
        setError(phoneError);
        return;
      }

      // Simulate STK push request
      const stkPushResponse = await simulateSTKPush();
      
      if (stkPushResponse.success) {
      const doctorName = doctors.find(d => d.id === doctor)?.name;
      const facilityName = facilities.find(f => f.id === facility)?.name;
        
      onBook({
        doctor: doctorName,
        facility: facilityName,
        date,
        time,
        mode: consultationType === "in-person" ? "In-person" : "Virtual",
        fee: paymentAmount,
        fullName,
          phone: phoneForPayment, // Use normalized phone
        email,
        emergency,
        insurance,
        policyNo,
        symptoms,
          paymentStatus: "success",
          checkoutRequestID: stkPushResponse.checkoutRequestId,
      });
        
      setShowPayment(false);
      } else {
        setError("Payment initiation failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setError("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Simulate STK Push request
  const simulateSTKPush = async (): Promise<STKPushResponse> => {
    // In a real implementation, this would make an API call to your payment gateway
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          checkoutRequestId: "STK_" + Date.now(),
          message: "STK push sent successfully"
        });
      }, 2000); // Simulate 2-second delay
    });
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-pink-700 flex items-center gap-2">Book Appointment</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {step === 1 && (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 md:flex-[1.2] bg-white rounded-xl shadow p-4 min-h-[500px]">
            <div className="mb-4">
              <label className="block font-medium mb-1">Select Location</label>
              <select 
                className="w-full border rounded px-3 py-2" 
                value={location} 
                onChange={e => { 
                  setLocation(e.target.value); 
                  setFacility(""); 
                  setDoctor(""); 
                  setSelectedClinicMap(null); 
                }}
              >
                <option value="">-- Select Location --</option>
                <option value="nairobi">Nairobi</option>
                <option value="mombasa">Mombasa</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Select Facility</label>
              <select 
                className="w-full border rounded px-3 py-2" 
                value={facility} 
                onChange={e => { 
                  setFacility(e.target.value); 
                  setDoctor(""); 
                  setSelectedClinicMap(null); 
                }} 
                disabled={!location || loading}
              >
                <option value="">-- Select Facility --</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Select Doctor</label>
              <select 
                className="w-full border rounded px-3 py-2" 
                value={doctor} 
                onChange={e => setDoctor(e.target.value)} 
                disabled={!facility || loading}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name || 'Unknown Doctor'}
                  </option>
                ))}
              </select>
              {loading && <p className="text-sm text-gray-500 mt-1">Loading doctors...</p>}
            </div>
            {doctor && doctors.find(d => d.id === doctor)?.specialization && (
              <div className="mb-4 flex items-center gap-2">
                <span className="font-medium">Specialization:</span>
                <span>{doctors.find(d => d.id === doctor)?.specialization}</span>
                <button className="ml-auto text-blue-600 underline text-sm" onClick={() => alert("Doctor profile coming soon!")}>View Doctor Profile</button>
              </div>
            )}
            <button 
              className="bg-pink-500 text-white px-4 py-2 rounded disabled:opacity-50" 
              onClick={handleNext1}
              disabled={loading}
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </div>
          <div className="flex-1 md:flex-[1.8] bg-white rounded-xl shadow p-4 flex flex-col justify-center">
            <label className="block font-medium mb-1">Or select a facility from the map</label>
            <ClinicMapSelector onSelect={handleMapClinicSelect} />
            {selectedClinicMap && (
              <div className="mt-2 text-green-700 font-bold">Selected Facility: {selectedClinicMap.name}</div>
            )}
          </div>
        </div>
      )}
      {step === 2 && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">Select Date</label>
            {loading ? (
              <div className="text-gray-500">Loading available dates...</div>
            ) : slots.length === 0 ? (
              <div className="text-red-500">No available slots found for this doctor at this facility.</div>
            ) : (
              <select 
                className="w-full border rounded px-3 py-2" 
                value={date} 
                onChange={e => {
                  setDate(e.target.value);
                  setTime("");
                }}
              >
                <option value="">-- Select Date --</option>
                {slots.map(slot => (
                  <option key={slot.date} value={slot.date}>
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Select Time Slot</label>
            {loading ? (
              <div className="text-gray-500">Loading available times...</div>
            ) : !date ? (
              <div className="text-gray-500">Please select a date first</div>
            ) : (
              <select 
                className="w-full border rounded px-3 py-2" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
              >
                <option value="">-- Select Time --</option>
                {slots
                  .find(s => s.date === date)
                  ?.times.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
              </select>
            )}
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" checked={emergency} onChange={e => setEmergency(e.target.checked)} id="emergency" />
            <label htmlFor="emergency">Emergency Booking? <span className="text-xs text-gray-500">(+Extra Charge)</span></label>
          </div>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2" onClick={() => setStep(1)}>Back</button>
          <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={handleNext2}>Next</button>
        </>
      )}
      {step === 3 && !showPayment && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">Full Name</label>
            <input className="w-full border rounded px-3 py-2" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Phone Number</label>
            <input className="w-full border rounded px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Email Address</label>
            <input className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Symptoms (optional)</label>
            <textarea className="w-full border rounded px-3 py-2" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
          </div>
          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={consultationType === "in-person"} onChange={() => setConsultationType("in-person")}/>
              In-person
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={consultationType === "virtual"} onChange={() => setConsultationType("virtual")}/>
              Virtual
            </label>
          </div>
          <div className="mb-4 flex gap-4 items-center">
            <label className="block font-medium mb-1">Insurance Provider</label>
            <select className="border rounded px-3 py-2" value={insurance} onChange={e => setInsurance(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="None">None</option>
              <option value="AAR Insurance">AAR Insurance</option>
              <option value="Jubilee Insurance">Jubilee Insurance</option>
              <option value="NHIF">NHIF</option>
              <option value="Britam">Britam</option>
              <option value="Other">Other</option>
            </select>
            <input className="border rounded px-3 py-2 ml-2" placeholder="Policy No" value={policyNo} onChange={e => setPolicyNo(e.target.value)} />
          </div>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2" onClick={() => setStep(2)}>Back</button>
          <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={handleBook}>Proceed to Payment →</button>
        </>
      )}
      {/* Payment confirmation modal */}
      {step === 3 && showPayment && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Payment Confirmation</h3>
          <div className="mb-4">
            <p className="text-lg">Total Amount: KES {paymentAmount}</p>
            {emergency && <p className="text-sm text-gray-600">(Includes KES 1,000 emergency fee)</p>}
          </div>
          <div className="mb-4">
            <p>An M-PESA STK push will be sent to:</p>
            <p className="font-bold">{phoneForPayment}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please ensure your phone is unlocked and ready to receive the M-PESA prompt
            </p>
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="flex gap-4">
            <button 
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              onClick={() => setShowPayment(false)}
              disabled={isProcessingPayment}
            >
              Back
            </button>
            <button 
              className={`bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 ${isProcessingPayment ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'}`}
              onClick={handlePaymentConfirm}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>💳</span>
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 