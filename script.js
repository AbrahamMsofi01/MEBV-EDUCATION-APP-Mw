import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, increment }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* 🔥 YOUR REAL FIREBASE CONFIG (INSERTED) */
const firebaseConfig = {
  apiKey: "AIzaSyAYnqwkb_xLrao-v4rFEXJoAjhpMqM6_lc",
  authDomain: "mebv-education.firebaseapp.com",
  projectId: "mebv-education",
  storageBucket: "mebv-education.firebasestorage.app",
  messagingSenderId: "3349990226",
  appId: "1:3349990226:web:71614567c4adb75977488b"
};

/* 🔥 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/* 🔐 ADMIN PASSWORD */
const ADMIN_PASSWORD = "Msofi@2026";

/* OPEN ADMIN LOGIN */
window.openLogin = function(){
    document.getElementById("loginModal").style.display="block";
}

/* CHECK ADMIN PASSWORD */
window.checkLogin = function(){
    const pass = document.getElementById("adminPass").value;

    if(pass === ADMIN_PASSWORD){
        document.getElementById("adminPanel").classList.remove("hidden");
        document.getElementById("loginModal").style.display="none";
    } else {
        alert("Wrong Password");
    }
}

/* 📤 UPLOAD BOOK */
window.uploadBook = async function(){

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const file = document.getElementById("file").files[0];

    if(!title || !file){
        alert("Fill all fields");
        return;
    }

    try {

        const storageRef = ref(storage, "books/" + file.name);

        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        await addDoc(collection(db, "books"), {
            title: title,
            category: category,
            url: downloadURL,
            downloads: 0,
            createdAt: new Date()
        });

        alert("Book Uploaded Successfully");

    } catch (error) {
        console.error(error);
        alert("Upload Failed. Check Firebase rules.");
    }
}

/* 📚 LOAD BOOKS */
window.loadBooks = function(){

    const filter = document.getElementById("categoryFilter").value;
    const list = document.getElementById("bookList");
    list.innerHTML = "";

    onSnapshot(collection(db, "books"), (snapshot)=>{

        list.innerHTML = "";

        snapshot.forEach((docSnap)=>{

            const book = docSnap.data();

            if(filter === "All" || book.category === filter){

                const div = document.createElement("div");
                div.className = "book-card";

                div.innerHTML = `
                    <h3>${book.title}</h3>
                    <p><strong>Category:</strong> ${book.category}</p>
                    <p><strong>Downloads:</strong> ${book.downloads}</p>
                    <button onclick="downloadBook('${docSnap.id}','${book.url}')">
                        Download
                    </button>
                `;

                list.appendChild(div);
            }
        });
    });
}

/* 📊 DOWNLOAD COUNTER */
window.downloadBook = async function(id,url){

    const bookRef = doc(db, "books", id);

    await updateDoc(bookRef, {
        downloads: increment(1)
    });

    window.open(url, "_blank");
}

/* AUTO LOAD ON START */
document.addEventListener("DOMContentLoaded", ()=>{
    loadBooks();
});
