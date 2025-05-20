//  Firebase-konfiguraatio (sisäänkirjautuminen Google/Email)
const firebaseConfig = {
  apiKey: "AIzaSyAe5ZTG3JEUqQr3QYhd4sEqFsfWyOHaN_A",
  authDomain: "opiskelukaveri-34de5.firebaseapp.com",
  projectId: "opiskelukaveri-34de5",
  storageBucket: "opiskelukaveri-34de5.appspot.com",
  messagingSenderId: "763472951260",
  appId: "1:763472951260:web:516265773b2c6a838f4119",
  measurementId: "G-P3647QJYVP"
};
firebase.initializeApp(firebaseConfig);
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Näytetään sisäänkirjautumisalue tai käyttäjän tiedot
firebase.auth().onAuthStateChanged(user => {
  const loginArea = document.getElementById("login-area");
  if (user) {
    loginArea.innerHTML = `<p>Tervetuloa, ${user.displayName} (${user.email})</p><button onclick="firebase.auth().signOut()">Kirjaudu ulos</button>`;
  } else {
    ui.start("#login-area", {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: window.location.href
    });
  }
});

//  Kalenterin luonti FullCalendarilla
let calendar;
function initCalendar(locale = 'fi') {
  const calendarEl = document.getElementById('calendar');
  if (calendar) calendar.destroy();

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: locale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: JSON.parse(localStorage.getItem("todos") || "[]").map(todo => ({
      title: todo.text,
      start: todo.date,
      color: todo.completed ? "#2ecc71" : "#e67e22"
    }))
  });

  calendar.render();
}

// 🌙 Teeman vaihto
document.getElementById("light-mode").addEventListener("click", () => {
  document.body.classList.remove("dark");
});
document.getElementById("dark-mode").addEventListener("click", () => {
  document.body.classList.add("dark");
});

//  Kielen vaihtaminen (FI / EN)
document.getElementById("fi").addEventListener("click", () => {
  changeLanguage("fi");
  initCalendar("fi");
});
document.getElementById("en").addEventListener("click", () => {
  changeLanguage("en");
  initCalendar("en");
});

//  Tekstien käännökset
function changeLanguage(lang) {
  const translations = {
    fi: {
      calendar: "Kalenteri",
      tasks: "Tehtävät",
      add: "Lisää",
      materials: "Materiaalit",
      "add-material": "Lisää materiaali",
      footer: "Opiskelukaveri – Sinun opiskeluaikasi apuri"
    },
    en: {
      calendar: "Calendar",
      tasks: "Tasks",
      add: "Add",
      materials: "Materials",
      "add-material": "Add material",
      footer: "Study Buddy – Your study time assistant"
    }
  };

  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    el.textContent = translations[lang][key];
  });

  // Päivitä paikkamerkit
  if (lang === 'fi') {
    document.getElementById('todo-input').placeholder = 'Lisää uusi tehtävä...';
    document.getElementById('material-title').placeholder = 'Materiaalin otsikko...';
    document.getElementById('material-notes').placeholder = 'Muistiinpanot...';
  } else {
    document.getElementById('todo-input').placeholder = 'Add new task...';
    document.getElementById('material-title').placeholder = 'Material title...';
    document.getElementById('material-notes').placeholder = 'Notes...';
  }
}

// Tehtävien lisääminen
document.getElementById('todo-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const date = document.getElementById('todo-date');
  const todo = {
    text: input.value,
    date: date.value,
    completed: false
  };
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
  input.value = "";
  date.value = "";
  loadTodos();
  initCalendar(); // päivitää kalenterin
});

// Näytä tallennetut tehtävät
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const list = document.getElementById("todo-list");
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.textContent = `${todo.text} (${todo.date})`;
    if (todo.completed) li.classList.add("completed");
    list.appendChild(li);
  });
}

//  Alustetaan kun sivu latautuu
document.addEventListener("DOMContentLoaded", () => {
  initCalendar("fi");
  loadTodos();
});
