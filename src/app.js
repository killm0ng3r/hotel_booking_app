import './styles.css';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, onSnapshot } from './firebase-config.js';

// Function to show login modal
const showLoginModal = () => {
  const modal = document.getElementById('authModal');
  if (modal) {
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }
};

// Function to hide admin link
const hideAdminLink = () => {
  document.querySelectorAll('.admin-link').forEach(link => {
    link.style.display = 'none';
  });
};

// Function to show admin link
const showAdminLink = () => {
  document.querySelectorAll('.admin-link').forEach(link => {
    link.style.display = 'block';
  });
};

// Function to get user role
const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return "user"; // Default to "user" role if document doesn't exist
  } catch (err) {
    console.error("Error fetching user role:", err);
    return "user"; // Default to "user" role on error
  }
};

// Function to update auth link based on login state
const updateAuthLink = (user) => {
  const authLink = document.querySelector('.auth-link');
  if (user) {
    authLink.textContent = 'Logout';
    authLink.removeAttribute('data-bs-toggle');
    authLink.removeAttribute('data-bs-target');
    authLink.addEventListener('click', () => {
      signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = "index.html";
      }).catch(err => {
        alert("Error logging out: " + err.message);
      });
    });
  } else {
    authLink.textContent = 'Login';
    authLink.setAttribute('data-bs-toggle', 'modal');
    authLink.setAttribute('data-bs-target', '#authModal');
  }
};

// Handle Admin link click
document.querySelectorAll('.admin-link').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      sessionStorage.setItem('previousPage', window.location.pathname);
      showLoginModal();
      sessionStorage.setItem('intendedDestination', 'admin.html');
    } else {
      const role = await getUserRole(user.uid);
      if (role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        alert("You do not have permission to access the admin panel.");
        window.location.href = 'booking.html';
      }
    }
  });
});

// Login Form
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const role = await getUserRole(user.uid);

    const modal = document.getElementById("authModal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    document.body.classList.remove("modal-open");
    document.querySelector(".modal-backdrop")?.remove();

    // Redirect based on role
    if (role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'booking.html';
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// Sign-Up Form
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "user"
    });
    alert("Sign-up successful! Please log in.");
    const modal = document.getElementById("authModal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    document.body.classList.remove("modal-open");
    document.querySelector(".modal-backdrop")?.remove();
  } catch (err) {
    alert("Sign-up failed: " + err.message);
  }
});

// Check Auth State on Page Load
auth.onAuthStateChanged(async (user) => {
  updateAuthLink(user); // Update the auth link based on login state
  if (user) {
    const role = await getUserRole(user.uid);
    if (role === 'admin') {
      showAdminLink();
    } else {
      hideAdminLink();
      if (window.location.pathname.includes("admin.html")) {
        alert("You do not have permission to access the admin panel.");
        window.location.href = "booking.html";
      }
    }
  } else {
    hideAdminLink();
    if (window.location.pathname.includes("admin.html")) {
      sessionStorage.setItem('previousPage', window.location.pathname);
      showLoginModal();
    }
  }
});

// Redirect to previous page if modal is closed without logging in
document.getElementById('authModal')?.addEventListener('hidden.bs.modal', () => {
  const user = auth.currentUser;
  if (!user) {
    const previousPage = sessionStorage.getItem('previousPage') || '/index.html';
    window.location.href = previousPage;
    sessionStorage.removeItem('previousPage');
    sessionStorage.removeItem('intendedDestination');
  }
});

// Booking Form Submission
document.getElementById("bookingForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;

  try {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("status", "==", "available"));
    const roomsSnapshot = await getDocs(q);
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    roomsSnapshot.forEach(doc => {
      const room = doc.data();
      const roomTypeForImage = room.type.toLowerCase().replace(/\s+/g, '-');
      const roomDiv = document.createElement("div");
      roomDiv.className = "room-card col-md-4";
      roomDiv.innerHTML = `
        <img src="images/${roomTypeForImage}-room.jpg" alt="${room.type} Room" class="img-fluid">
        <div class="room-info">
          <h3>${room.type} Room</h3>
          <div class="room-actions">
            <button class="btn btn-outline-warning book-btn" data-room-id="${doc.id}">Book Now</button>
            <span class="price">Ksh. ${room.price} avg/night</span>
          </div>
        </div>
      `;
      roomList.appendChild(roomDiv);
    });

    document.querySelectorAll(".book-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const roomId = btn.getAttribute("data-room-id");
        const user = auth.currentUser;

        if (!user) {
          alert("Please log in to book a room.");
          return;
        }

        const bookingId = doc(collection(db, "bookings")).id;
        await setDoc(doc(db, "bookings", bookingId), {
          bookingID: bookingId,
          customerID: user.uid,
          roomID: roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          paymentStatus: "completed"
        });

        await updateDoc(doc(db, "rooms", roomId), { status: "booked" });
        alert("Booking confirmed! Booking ID: " + bookingId);
        window.location.reload();
      });
    });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    alert("Error fetching rooms: " + err.message);
  }
});

// Admin Dashboard
if (window.location.pathname.includes("admin.html")) {
  const bookingsRef = collection(db, "bookings");
  onSnapshot(bookingsRef, (snapshot) => {
    const bookingList = document.getElementById("bookingList");
    bookingList.innerHTML = "";
    snapshot.forEach(doc => {
      const booking = doc.data();
      const bookingDiv = document.createElement("div");
      bookingDiv.className = "booking-card col-md-4";
      bookingDiv.innerHTML = `
        <p><strong>Booking ID:</strong> ${booking.bookingID}</p>
        <p><strong>Room ID:</strong> ${booking.roomID}</p>
        <p><strong>Check-In:</strong> ${booking.checkInDate}</p>
        <p><strong>Check-Out:</strong> ${booking.checkOutDate}</p>
        <p><strong>Status:</strong> ${booking.paymentStatus}</p>
      `;
      bookingList.appendChild(bookingDiv);
    });
  }, err => {
    console.error("Error fetching bookings:", err);
    alert("Error fetching bookings: " + err.message);
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
      alert("Logged out successfully!");
      window.location.href = "index.html";
    }).catch(err => {
      alert("Error logging out: " + err.message);
    });
  });
}