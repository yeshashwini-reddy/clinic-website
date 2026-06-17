/**
 * Dynamically loads the Razorpay Checkout script.
 * Returns a Promise that resolves to true when the script is ready.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Opens the Razorpay Checkout popup.
 *
 * @param {Object} options
 * @param {number}   options.amount       - Amount in rupees (will be converted to paise)
 * @param {string}   options.name         - Patient name (prefill)
 * @param {string}   options.email        - Patient email (prefill)
 * @param {string}   options.contact      - Patient phone (prefill, optional)
 * @param {string}   options.description  - Payment description
 * @param {Function} options.onSuccess    - Called with razorpay response on success
 * @param {Function} options.onDismiss    - Called when user closes the popup
 */
export const openRazorpayCheckout = ({ amount, name, email, contact, description, onSuccess, onDismiss }) => {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID';

  const options = {
    key: keyId,
    amount: amount * 100,           // Razorpay requires paise (multiply by 100)
    currency: 'INR',
    name: 'Vanitha Clinic',
    description: description || 'Consultation Booking Fee',
    image: '/assets/logo.png',      // Clinic logo shown in popup
    prefill: {
      name: name || '',
      email: email || '',
      contact: contact || '',
    },
    notes: {
      clinic: 'Vanitha Clinic, Balanagar, Hyderabad',
    },
    theme: {
      color: '#2563eb',
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },

      escape: true,
    },
    handler: (response) => {
      if (onSuccess) onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    console.error('Razorpay payment failed:', response.error);
    if (onDismiss) onDismiss(response.error?.description || 'Payment failed. Please try again.');
  });
  rzp.open();
};

