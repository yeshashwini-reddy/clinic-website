import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { 
  collection, 
  getDoc,
  doc, 
  addDoc, 
  query, 
  where, 
  runTransaction, 
  serverTimestamp 
} from 'firebase/firestore';
import { getDocsWithTimeout, addDocWithTimeout, runTransactionWithTimeout } from '../utils/firestoreHelper';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import LoadingSpinner from '../components/LoadingSpinner';
import doctorsData from '../data/doctors';
import { 
  User, 
  Calendar, 
  Ticket, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Stethoscope,
  Info,
  Loader2,
} from 'lucide-react';

const BookAppointment = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Booking Flow Steps
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data States
  const [doctors, setDoctors] = useState(() => 
    doctorsData.map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }))
  );
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  
  // Token & Payment States
  const [tokenNumber, setTokenNumber] = useState('');
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Razorpay loading state
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  // Time slots template
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', 
    '04:00 PM', '04:30 PM'
  ];

  // Get earliest available date for a doctor based on day & current time
  const getEarliestAvailableDate = (doctor) => {
    if (!doctor) return '';
    const now = new Date();
    let checkDate = new Date(now);

    // Vanitha Reddy (Gynaecologist): Mon-Fri, 9 AM - 5 PM (17:00)
    // Venugopal Reddy (General Physician): Tue-Sat, 10 AM - 4 PM (16:00)
    const isVanitha = doctor.name.includes('Vanitha') || doctor.specialization === 'Gynaecologist';
    const closingHour = isVanitha ? 17 : 16;
    const workingDays = isVanitha ? [1, 2, 3, 4, 5] : [2, 3, 4, 5, 6]; // 1=Mon, 5=Fri | 2=Tue, 6=Sat

    // If current local time is past the doctor's closing hour, start from tomorrow
    if (now.getHours() >= closingHour) {
      checkDate.setDate(checkDate.getDate() + 1);
    }

    // Find the next working day within a week
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = checkDate.getDay();
      if (workingDays.includes(dayOfWeek)) {
        const yyyy = checkDate.getFullYear();
        const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
        const dd = String(checkDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    return '';
  };

  // Fetch doctors list
  const fetchDoctors = async () => {
    try {
      setError(null);
      let docsList;
      try {
        const querySnapshot = await getDocsWithTimeout(collection(db, 'doctors'));
        const firestoreDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // If Firestore returns empty, fall back to local static data
        if (firestoreDocs.length > 0) {
          docsList = firestoreDocs;
        } else {
          console.warn('Firestore doctors collection is empty. Using static local data.');
          docsList = doctorsData.map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }));
        }
      } catch (firestoreErr) {
        console.warn('Firestore fetch doctors failed. Falling back to local static doctors data:', firestoreErr);
        docsList = doctorsData.map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }));
      }

      // Deduplicate by name to prevent showing the same doctor twice if Firestore has duplicates
      const uniqueDocs = [];
      const seenNames = new Set();
      for (const doc of docsList) {
        if (!seenNames.has(doc.name)) {
          seenNames.add(doc.name);
          uniqueDocs.push(doc);
        }
      }

      // Always update doctors state with whatever we resolved (limited to 2 as per requirements)
      const limitedDocs = uniqueDocs.slice(0, 2);
      setDoctors(limitedDocs);

      // Check if a doctor was pre-selected via navigation state
      const preSelectedId = location.state?.doctorId;
      if (preSelectedId) {
        const found = limitedDocs.find(d => d.id === preSelectedId || d.name === preSelectedId);
        if (found) {
          setSelectedDoctor(found);
          setSelectedDate(getEarliestAvailableDate(found));
          setStep(2); // Jump to Step 2
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      // Ensure we always have the static fallback visible (limited to 2)
      const fallback = doctorsData.slice(0, 2).map((d, index) => ({ id: `local_doc_${index + 1}`, ...d }));
      setDoctors(fallback);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [location.state]);

  // Fetch booked slots for the selected doctor and date
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    const fetchBookedSlots = async () => {
      try {
        setFetchingSlots(true);
        let slots = [];
        try {
          const q = query(
            collection(db, 'appointments'),
            where('doctorId', '==', selectedDoctor.id),
            where('selectedDate', '==', selectedDate)
          );
          const snapshot = await getDocsWithTimeout(q);
          slots = snapshot.docs
            .map(doc => doc.data())
            .filter(data => data.appointmentStatus !== 'cancelled')
            .map(data => data.selectedSlot);
        } catch (firestoreErr) {
          console.warn('Firestore fetch booked slots timed out/failed. Proceeding with all slots available.', firestoreErr);
        }
        setBookedSlots(slots);
      } catch (err) {
        console.error('Error fetching booked slots:', err);
        setError('Failed to retrieve available timeslots.');
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDoctor, selectedDate]);

  // Handle slot selection and advance to Token step
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  // Open Razorpay Checkout for real online payment
  const handleRazorpayPayment = async () => {
    setRazorpayLoading(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load Razorpay payment gateway. Please check your internet connection and try again.');
      setRazorpayLoading(false);
      return;
    }

    const fee = selectedDoctor?.fee || 500;
    const totalAmount = fee + 50;

    openRazorpayCheckout({
      amount: totalAmount,
      name: profile?.name || user?.displayName || '',
      email: user?.email || '',
      contact: profile?.phone || '',
      description: `Consultation with ${selectedDoctor?.name} on ${selectedDate} at ${selectedSlot}`,
      onSuccess: async (response) => {
        setRazorpayLoading(false);
        await handleConfirmBooking(paymentMethod, true, response.razorpay_payment_id);
      },
      onDismiss: (errMsg) => {
        setRazorpayLoading(false);
        if (errMsg) {
          setError(typeof errMsg === 'string' ? errMsg : 'Payment was not completed. Please try again.');
        }
      },
    });
  };

  // Generate Token number via Firestore transaction to prevent duplicates
  const generateToken = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Please select a doctor, date, and slot first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let nextTokenVal;
      try {
        // Document reference for daily token tracker
        const tokenDocId = `${selectedDate}_${selectedDoctor.id}`;
        const tokenRef = doc(db, 'tokens', tokenDocId);

        nextTokenVal = await runTransactionWithTimeout(db, async (transaction) => {
          const tokenDoc = await transaction.get(tokenRef);
          if (!tokenDoc.exists()) {
            transaction.set(tokenRef, { 
              lastNumber: 101, 
              date: selectedDate, 
              doctorId: selectedDoctor.id 
            });
            return 101;
          } else {
            const nextNum = tokenDoc.data().lastNumber + 1;
            transaction.update(tokenRef, { lastNumber: nextNum });
            return nextNum;
          }
        });
      } catch (firestoreErr) {
        console.warn('Firestore token transaction timed out/failed. Generating offline fallback token.', firestoreErr);
        // Fallback: estimate based on current slot index
        const slotIdx = timeSlots.indexOf(selectedSlot);
        nextTokenVal = 101 + (slotIdx >= 0 ? slotIdx : 0);
      }

      const tokenStr = `A${nextTokenVal}`;
      setTokenNumber(tokenStr);
      // Wait time calculation: (tokenNumber - 101) * 20 minutes
      const waitTime = (nextTokenVal - 101) * 20;
      setEstimatedWait(waitTime);
      setStep(3);
    } catch (err) {
      console.error('Error generating token:', err);
      setError('Failed to allocate appointment token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm booking & payment
  const handleConfirmBooking = async (method, payNow, razorpayPaymentId = null) => {
    setLoading(true);
    setError(null);

    const fee = selectedDoctor.fee || 500;
    const charge = 50; // Platform / consultation charge
    const totalAmount = fee + charge;
    const status = payNow ? 'paid' : 'paid_at_clinic';
    let appointmentId = `local_app_${Date.now()}`;

    try {
      try {
        // 1. Create appointment in Firestore
        const appointmentRef = await addDocWithTimeout(collection(db, 'appointments'), {
          patientId: user.uid,
          doctorId: selectedDoctor.id,
          selectedDate,
          selectedSlot,
          tokenNumber,
          paymentStatus: status,
          appointmentStatus: 'scheduled',
          createdAt: serverTimestamp()
        });
        appointmentId = appointmentRef.id;

        // 2. Create payment record
        await addDocWithTimeout(collection(db, 'payments'), {
          appointmentId: appointmentRef.id,
          patientId: user.uid,
          amount: totalAmount,
          method: method,
          status: payNow ? 'completed' : 'pending',
          razorpayPaymentId: razorpayPaymentId || null,
          createdAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.warn('Firestore booking save timed out/failed. Proceeding with local confirmation.', firestoreErr);
      }

      setPaymentStatus(status);
      setConfirmedAppointment({
        id: appointmentId,
        doctor: selectedDoctor,
        date: selectedDate,
        slot: selectedSlot,
        token: tokenNumber,
        status: status,
        total: totalAmount
      });

      setStep(5);
    } catch (err) {
      console.error('Error finalising appointment:', err);
      setError('Failed to save booking. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Download Receipt as a high-res professional graphic canvas image
  const downloadReceipt = () => {
    if (!confirmedAppointment) return;

    // Create standard high-res digital document canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Solid white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rounded rectangle drawing helper
    const drawRoundedRect = (x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    };

    // Draw Clinic Logo Shield
    ctx.fillStyle = '#2563eb';
    drawRoundedRect(50, 45, 50, 50, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(71, 55, 8, 30);
    ctx.fillRect(60, 66, 30, 8);

    // Clinic Branding Header
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VANITHA', 112, 68);
    ctx.fillStyle = '#2563eb';
    ctx.font = '800 24px "Inter", sans-serif';
    ctx.fillText('CLINIC', 112, 90);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 8px "Inter", sans-serif';
    ctx.fillText('HYDERABAD CENTER', 112, 102);

    // Right Side Contact & Address details
    ctx.textAlign = 'right';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('Vanitha Clinic', 750, 48);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 9.5px "Inter", sans-serif';
    ctx.fillText('Balanagar, Hyderabad', 750, 63);
    ctx.fillText('Telangana - 500042, India', 750, 77);
    ctx.fillText('Phone: 89784 61909 / 92477 63538', 750, 91);
    ctx.fillText('Email: yeshashwinireddy32@gmail.com', 750, 105);

    // Horizontal line separator
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 120);
    ctx.lineTo(750, 120);
    ctx.stroke();

    // Document Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillText('INVOICE CUM RECEIPT', 400, 155);

    // Patient & Appointment Details layout
    const startY = 195;
    const spacingY = 22;
    ctx.textAlign = 'left';

    const drawInfoLine = (label, val, x, y) => {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.fillText(label, x, y);
      ctx.fillStyle = '#1e293b';
      ctx.font = '500 11px "Inter", sans-serif';
      ctx.fillText(`:  ${val}`, x + 90, y);
    };

    const patName = profile?.name || user?.displayName || 'Clinic Guest';
    drawInfoLine('Patient Name', patName.slice(0, 22), 50, startY);
    drawInfoLine('Patient ID', user?.uid ? `USR_${user.uid.slice(0, 8).toUpperCase()}` : 'GUEST', 50, startY + spacingY);
    drawInfoLine('Referred By', 'Self / Walk-in', 50, startY + spacingY * 2);

    drawInfoLine('Date', confirmedAppointment.date, 460, startY);
    drawInfoLine('Invoice No.', `INV-${confirmedAppointment.id.slice(0, 8).toUpperCase()}`, 460, startY + spacingY);
    drawInfoLine('Receipt No.', `REC-${confirmedAppointment.id.slice(0, 8).toUpperCase()}`, 460, startY + spacingY * 2);
    drawInfoLine('Token Number', confirmedAppointment.token, 460, startY + spacingY * 3);

    // Particulars Table Drawing
    const tableY = 300;

    // Header top border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, tableY);
    ctx.lineTo(750, tableY);
    ctx.stroke();

    // Header labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.fillText('Particulars', 55, tableY + 18);
    ctx.fillText('Doctor Specialist', 240, tableY + 18);
    ctx.fillText('Date & Time Slot', 430, tableY + 18);
    ctx.textAlign = 'right';
    ctx.fillText('Price', 640, tableY + 18);
    ctx.fillText('Amount', 745, tableY + 18);

    // Header bottom border
    ctx.beginPath();
    ctx.moveTo(50, tableY + 28);
    ctx.lineTo(750, tableY + 28);
    ctx.stroke();

    // Row 1 values
    const row1Y = tableY + 50;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '500 10.5px "Inter", sans-serif';
    ctx.fillText('Clinical Consultation Visit', 55, row1Y);
    ctx.fillText(confirmedAppointment.doctor.name, 240, row1Y);
    ctx.fillText(`${confirmedAppointment.date} @ ${confirmedAppointment.slot}`, 430, row1Y);
    ctx.textAlign = 'right';
    ctx.fillText(`â‚¹${confirmedAppointment.doctor.fee || 500}.00`, 640, row1Y);
    ctx.fillText(`â‚¹${confirmedAppointment.doctor.fee || 500}.00`, 745, row1Y);

    // Row 2 values (Service fee)
    const row2Y = tableY + 76;
    ctx.textAlign = 'left';
    ctx.fillText('Registration & Service Charge', 55, row2Y);
    ctx.fillText('-', 240, row2Y);
    ctx.fillText('-', 430, row2Y);
    ctx.textAlign = 'right';
    ctx.fillText('â‚¹50.00', 640, row2Y);
    ctx.fillText('â‚¹50.00', 745, row2Y);

    // Table bottom border
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(50, tableY + 95);
    ctx.lineTo(750, tableY + 95);
    ctx.stroke();

    // Summary calculations block (GST inclusive)
    const calcY = tableY + 120;
    const calcSpacingY = 18;
    const rightAlignLabelX = 610;
    const rightAlignValX = 745;

    const drawCalcLine = (label, val, y, isBold = false) => {
      ctx.textAlign = 'right';
      ctx.fillStyle = isBold ? '#1e293b' : '#64748b';
      ctx.font = isBold ? 'bold 11px "Inter", sans-serif' : '500 10px "Inter", sans-serif';
      ctx.fillText(label, rightAlignLabelX, y);
      ctx.fillText(`â‚¹${val}`, rightAlignValX, y);
    };

    const docFee = confirmedAppointment.doctor.fee || 500;
    const totalVal = docFee + 50;
    const gstIncl = (totalVal - (totalVal / 1.18)).toFixed(2);

    drawCalcLine('Subtotal :', `${totalVal}.00`, calcY);
    drawCalcLine('Discount :', '0.00', calcY + calcSpacingY);
    drawCalcLine('Total Tax (GST 18% Incl.) :', gstIncl, calcY + calcSpacingY * 2);

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(550, calcY + calcSpacingY * 2 + 8);
    ctx.lineTo(750, calcY + calcSpacingY * 2 + 8);
    ctx.stroke();

    drawCalcLine('Total Amount Collected :', `${totalVal}.00`, calcY + calcSpacingY * 3 + 8, true);
    drawCalcLine('Balance Due :', '0.00', calcY + calcSpacingY * 4 + 8);

    // Paid Sum Text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold italic 10.5px "Inter", sans-serif';
    const methodStr = confirmedAppointment.status === 'paid' ? `Online (${paymentMethod})` : 'Cash at Counter';
    ctx.fillText(`Received Sum of Rs. ${totalVal} By ${methodStr}.`, 55, calcY + calcSpacingY * 3);

    // Terms & Disclaimers
    ctx.fillStyle = '#64748b';
    ctx.font = '500 9px "Inter", sans-serif';
    ctx.fillText('* Please show this receipt at the registration counter 10 minutes prior to your slot.', 55, calcY + calcSpacingY * 4 + 20);
    ctx.fillText('* Token position is subject to clinic availability. Rescheduling is available online.', 55, calcY + calcSpacingY * 4 + 32);

    // Authorized signature line
    ctx.textAlign = 'right';
    ctx.fillStyle = '#475569';
    ctx.font = '500 10px "Inter", sans-serif';
    ctx.fillText('For Vanitha Clinic', 745, calcY + calcSpacingY * 4 + 30);

    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(600, calcY + calcSpacingY * 4 + 75);
    ctx.lineTo(745, calcY + calcSpacingY * 4 + 75);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    ctx.fillText('Authorized Signatory', 745, calcY + calcSpacingY * 4 + 90);

    // Solid footer separator line
    const footerY = 870;
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, footerY);
    ctx.lineTo(750, footerY);
    ctx.stroke();

    // Bottom solid footer (Apollo Style)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('Vanitha Clinic', 55, footerY + 22);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 9px "Inter", sans-serif';
    ctx.fillText('Leading Healthcare Excellence', 55, footerY + 36);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 9px "Inter", sans-serif';
    ctx.fillText('Regd. Office:', 745, footerY + 20);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 8.5px "Inter", sans-serif';
    ctx.fillText('Vanitha Clinic, Balanagar, Hyderabad, Telangana - 500042, India', 745, footerY + 32);
    ctx.fillText('Phone: 8978461909 / 9247763538 | Email: yeshashwinireddy32@gmail.com', 745, footerY + 44);

    // Trigger PNG file download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Receipt_${confirmedAppointment.token.replace('#', '')}_${confirmedAppointment.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Step Indicator
  const renderStepper = () => {
    const steps = [
      { id: 1, label: 'Doctor', icon: <User size={16} /> },
      { id: 2, label: 'Schedule', icon: <Calendar size={16} /> },
      { id: 3, label: 'Token', icon: <Ticket size={16} /> },
      { id: 4, label: 'Payment', icon: <CreditCard size={16} /> },
      { id: 5, label: 'Confirmed', icon: <CheckCircle size={16} /> }
    ];

    return (
      <div className="mb-8 w-full">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm ${
                  step === s.id 
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/30 scale-110'
                    : step > s.id 
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-slate-400 border-slate-200'
                }`}>
                  {step > s.id ? <CheckCircle size={16} /> : s.icon}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                  step === s.id ? 'text-primary' : step > s.id ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-100 relative">
                  <div className={`absolute top-0 left-0 h-full bg-gradient-to-r transition-all duration-500 ${
                    step > s.id 
                      ? 'w-full from-emerald-500 to-emerald-500' 
                      : step === s.id 
                        ? 'w-1/2 from-primary to-slate-200' 
                        : 'w-0'
                  }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Main UI Wrapper
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto max-w-4xl py-8 px-4"
    >
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Book a Consultation</h1>
        <p className="text-sm text-slate-500 mt-1">Reserve a slot with our specialist medical officers instantly</p>
      </div>

      {/* Step Stepper */}
      {renderStepper()}

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 text-sm shadow-sm animate-shake">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Booking Error</p>
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="font-bold text-xs uppercase hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 relative min-h-[400px] transition-all duration-300">
        
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50 transition-opacity">
            <div className="flex flex-col items-center space-y-3">
              <LoadingSpinner />
              <p className="text-sm font-semibold text-slate-500">Processing booking stage...</p>
            </div>
          </div>
        )}

        {/* STEP 1: CHOOSE DOCTOR */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Step 1 - Choose Doctor</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a specialist physician for your outpatient care</p>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Stethoscope size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold">No specialists listed</p>
                <p className="text-xs text-slate-400">Database collection seeding in progress...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {doctors.map(docData => (
                  <div 
                    key={docData.id} 
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                      selectedDoctor?.id === docData.id 
                        ? 'border-primary ring-2 ring-primary/10 shadow-md' 
                        : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {docData.image ? (
                        <img 
                          src={docData.image} 
                          alt={docData.name} 
                          className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-primary flex flex-col items-center justify-center border border-slate-100 shadow-sm"
                        style={{ display: docData.image ? 'none' : 'flex' }}
                      >
                        <span className="text-base font-extrabold tracking-wider">
                          {docData.name ? docData.name.replace(/^Dr\.\s+/i, '').split(' ').map(n => n[0]).join('') : 'DR'}
                        </span>
                        <Stethoscope size={14} className="text-primary/60 mt-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 tracking-tight">{docData.name}</h3>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">{docData.specialization}</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                          {docData.timings || 'Mon-Fri 9am-5pm'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-800 text-sm">₹{docData.fee || 500}</span> fee
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedDoctor(docData);
                          setSelectedDate(getEarliestAvailableDate(docData));
                          setSelectedSlot('');
                          setStep(2);
                        }}
                        className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition shadow-sm"
                      >
                        Choose Doctor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CHOOSE DATE & TIME SLOT */}
        {step === 2 && selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Step 2 - Select Date & Time Slot</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select a schedule for {selectedDoctor.name}</p>
              </div>
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Back to Doctors</span>
              </button>
            </div>

            {/* Doctor mini info summary */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center space-x-3 text-slate-700 text-xs">
              <Info size={16} className="text-primary shrink-0" />
              <div>
                Selected especialista: <strong className="text-slate-800">{selectedDoctor.name}</strong> ({selectedDoctor.specialization}). Consultation fee: <strong className="text-slate-800">₹{selectedDoctor.fee}</strong>. Available Hours: <strong className="text-slate-800">{selectedDoctor.timings}</strong>.
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Date Selection Box */}
              <div className="md:col-span-1 space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Appointment Date</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(''); // Reset slot on date change
                  }}
                  min={new Date().toISOString().split('T')[0]} // Block yesterday
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm input-focus-glow transition-all duration-200" 
                />
              </div>

              {/* Slot Selection Box */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Available Slots {selectedDate && `for ${selectedDate}`}
                </label>

                {!selectedDate ? (
                  <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                    Please select a date to load available time slots
                  </div>
                ) : (
                  <div className="relative min-h-[120px]">
                    {fetchingSlots && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                          <Loader2 className="animate-spin text-primary" size={16} />
                          <span>Checking slots...</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => handleSelectSlot(slot)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                              isBooked 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                                : isSelected
                                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Proceed to Token Generation */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                disabled={!selectedDate || !selectedSlot}
                onClick={generateToken}
                className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2 shadow-md hover:shadow-lg shadow-primary/25"
              >
                <span>Generate Token</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TOKEN GENERATION PREVIEW */}
        {step === 3 && selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Step 3 - Token Generated</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your queuing position details</p>
              </div>
              <button 
                onClick={() => setStep(2)} 
                className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Reschedule Slot</span>
              </button>
            </div>

            {/* Token Receipt Layout */}
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl relative mt-4">
              {/* Top accent bar */}
              <div className="h-2 w-full bg-primary" />
              
              <div className="p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    {/* Clinic Logo Placeholder */}
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 bg-white" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">VANITHA</h3>
                      <h3 className="text-xl font-extrabold text-primary tracking-tight leading-tight">CLINIC</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Hyderabad Center</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-800 text-sm">Vanitha Clinic</p>
                    <p>Balanagar, Hyderabad</p>
                    <p>Telangana - 500042, India</p>
                    <p>Phone: 89784 61909</p>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h4 className="text-sm font-bold text-slate-800 tracking-widest uppercase border border-slate-200 inline-block px-4 py-1.5 rounded bg-slate-50">
                    Appointment Token
                  </h4>
                </div>

                {/* Patient & Appointment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold text-xs uppercase">Patient Name</span>
                      <span className="text-slate-800 font-semibold">: {profile?.name || user?.displayName || 'Clinic Guest'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold text-xs uppercase">Patient ID</span>
                      <span className="text-slate-800 font-semibold">: {user?.uid ? `USR_${user.uid.slice(0, 8).toUpperCase()}` : 'GUEST'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold text-xs uppercase">Consulting</span>
                      <span className="text-slate-800 font-semibold truncate">: Dr. {selectedDoctor.name.replace(/^Dr\.\s+/i, '')}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold text-xs uppercase">Date</span>
                      <span className="text-slate-800 font-semibold">: {selectedDate}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold text-xs uppercase">Time Slot</span>
                      <span className="text-slate-800 font-semibold">: {selectedSlot}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold text-xs uppercase">Est. Wait</span>
                      <span className="text-slate-800 font-semibold">: {estimatedWait === 0 ? 'No waiting' : `${estimatedWait} mins`}</span>
                    </div>
                  </div>
                </div>

                {/* Token Display Area */}
                <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Queue Number</p>
                  <div className="text-6xl font-black text-primary tracking-tighter">
                    {tokenNumber}
                  </div>
                </div>
                
              </div>
              
              {/* Receipt Footer Line */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 text-center">
                <p className="text-[10px] text-slate-400 font-medium">* This token is for queuing purposes. Final receipt will be generated after payment.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 flex items-start space-x-2 max-w-md mx-auto">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Wait Time Notice</p>
                <p>The estimated waiting time is based on previous bookings for the day. Please report to the counter 10 minutes prior to your slot.</p>
              </div>
            </div>

            {/* Advance Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition flex items-center space-x-2 shadow-md hover:shadow-lg shadow-primary/25"
              >
                <span>Proceed to Payment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT PAGE */}
        {step === 4 && selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Step 4 - Payment Options</h2>
                <p className="text-xs text-slate-400 mt-0.5">Settle consultation invoice to lock the queue slot</p>
              </div>
              <button 
                onClick={() => setStep(3)} 
                className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700 transition"
              >
                <ArrowLeft size={14} />
                <span>View Token</span>
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-5">
              {/* Payment Summary Sheet */}
              <div className="md:col-span-3 border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Appointment Summary</h3>
                
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Doctor</span>
                    <strong className="text-slate-800">{selectedDoctor.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Specialization</span>
                    <span>{selectedDoctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Date</span>
                    <strong className="text-slate-800">{selectedDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Slot</span>
                    <strong className="text-slate-800">{selectedSlot}</strong>
                  </div>
                  <div className="flex justify-between text-primary font-bold">
                    <span>Queue Position</span>
                    <span>{tokenNumber}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 pt-2">Billing Breakdown</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Doctor Consultation Fee</span>
                    <span>₹{selectedDoctor.fee || 500}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outpatient Service Charges</span>
                    <span>₹50</span>
                  </div>
                  <div className="border-t border-slate-200 my-1 pt-2 flex justify-between font-bold text-slate-800 text-sm">
                    <span>Total Amount Payable</span>
                    <span className="text-primary text-base">₹{(selectedDoctor.fee || 500) + 50}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Option Selector */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Method</label>
                  
                  <div className="space-y-2">
                    {['UPI', 'Card', 'Cash'].map(method => (
                      <label 
                        key={method}
                        className={`flex items-center space-x-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                          paymentMethod === method 
                            ? 'border-primary bg-blue-50/20 text-primary font-semibold ring-2 ring-primary/5' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method} 
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs uppercase tracking-wider">{method === 'Cash' ? 'Cash at Clinic' : method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Note on Cash */}
                {paymentMethod === 'Cash' && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700">
                    Choosing <strong>Cash at Clinic</strong> allows you to book immediately. You must settle the bill of <strong>₹{(selectedDoctor.fee || 500) + 50}</strong> at the reception counter before entering the consultation room.
                  </div>
                )}
                {paymentMethod !== 'Cash' && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 flex items-center space-x-1">
                    <Lock size={12} className="shrink-0 text-slate-400" />
                    <span>Safe 256-bit encrypted gateway booking.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              {paymentMethod === 'Cash' ? (
                <button
                  onClick={() => handleConfirmBooking('Cash', false)}
                  className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition shadow-md shadow-primary/25 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Confirm Booking (Pay at Clinic)</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleConfirmBooking(paymentMethod, false)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition"
                  >
                    Pay at Clinic
                  </button>

                  <button
                    onClick={handleRazorpayPayment}
                    disabled={razorpayLoading}
                    className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md shadow-primary/25 flex items-center space-x-2"
                  >
                    {razorpayLoading ? (
                      <><Loader2 size={14} className="animate-spin" /><span>Loading Gateway...</span></>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5l4.5 7.5H12V4.5zm0 15l-4.5-7.5H12V19.5z"/>
                        </svg>
                        <span>Pay Now · Razorpay</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>


            {/* Razorpay trust badge */}
            <div className="flex items-center justify-end space-x-1.5 mt-2">
              <Lock size={10} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">Secured by <strong className="text-slate-500">Razorpay</strong> · UPI · Cards · Net Banking · Wallets</span>
            </div>
          </div>
        )}

        {/* STEP 5: APPOINTMENT CONFIRMATION */}
        {step === 5 && confirmedAppointment && (
          <div className="space-y-8 text-center max-w-xl mx-auto py-4">
            
            {/* Animated Celebration Icon */}
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-inner scale-110 mb-2 animate-bounce">
              <CheckCircle2 size={48} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Appointment Confirmed!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your outpatient consultation slot is locked. A booking receipt is generated below for verification.
              </p>
            </div>

            {/* Summary details card */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3.5 text-left text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Booking Token</span>
                <span className="font-extrabold text-primary text-sm bg-white border border-slate-100 rounded-lg px-2.5 py-0.5 shadow-sm">
                  {confirmedAppointment.token}
                </span>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Specialist Name</span>
                  <strong className="text-slate-800">{confirmedAppointment.doctor.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Specialization</span>
                  <span>{confirmedAppointment.doctor.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Date</span>
                  <strong className="text-slate-800">{confirmedAppointment.date}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Appointment Slot</span>
                  <strong className="text-slate-800">{confirmedAppointment.slot}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                    confirmedAppointment.status === 'paid' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {confirmedAppointment.status === 'paid' ? 'PAID ONLINE' : 'PAY AT CLINIC'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={downloadReceipt}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Download size={14} />
                <span>Download Receipt</span>
              </button>
              
              <button
                onClick={() => navigate('/my-appointments')}
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition shadow-md shadow-primary/20"
              >
                View Appointment
              </button>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default BookAppointment;
