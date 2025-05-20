// Firebase-konfiguraatio (Google/Sähköposti-kirjautuminen)
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

// Näyttää kirjautumisalueen tai käyttäjän tiedot
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

// Kalenterin alustus FullCalendar-kirjastolla
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

// Teeman vaihto (vaalea/tumma)
document.getElementById("light-mode").addEventListener("click", () => {
  document.body.classList.remove("dark");
});
document.getElementById("dark-mode").addEventListener("click", () => {
  document.body.classList.add("dark");
});

// Kielen vaihto (suomi/englanti)
document.getElementById("fi").addEventListener("click", () => {
  changeLanguage("fi");
  initCalendar("fi");
});
document.getElementById("en").addEventListener("click", () => {
  changeLanguage("en");
  initCalendar("en");
});

// Tekstien kääntäminen
function changeLanguage(lang) {
  document.documentElement.lang = lang;
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

  // Päivitä kenttien placeholder-tekstit
  if (lang === 'fi') {
    document.getElementById('todo-input').placeholder = 'Lisää uusi tehtävä...';
    document.getElementById('material-title').placeholder = 'Materiaalin otsikko...';
    document.getElementById('material-notes').placeholder = 'Muistiinpanot...';
  } else {
    document.getElementById('todo-input').placeholder = 'Add new task...';
    document.getElementById('material-title').placeholder = 'Material title...';
    document.getElementById('material-notes').placeholder = 'Notes...';
  }
  
  loadTodos(); // Päivitä tehtävälista kielen vaihtuessa
}

// Tarkistaa deadlinet ja näyttää huomautuksia
function checkDeadlines() {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const now = new Date();
  const isEnglish = document.documentElement.lang === 'en';

  todos.forEach(todo => {
    if (todo.date && !todo.completed) {
      const deadline = new Date(todo.date);
      const timeDiff = deadline - now;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let message;
      if (isEnglish) {
        if (daysDiff === 1) message = `Deadline approaching: ${todo.text} (due tomorrow)`;
        else if (daysDiff === 0) message = `Deadline today: ${todo.text}`;
        else if (daysDiff < 0) message = `Deadline passed: ${todo.text} (${Math.abs(daysDiff)} days ago)`;
        else message = `Upcoming deadline: ${todo.text} (in ${daysDiff} days)`;
      } else {
        if (daysDiff === 1) message = `Deadline lähestyy: ${todo.text} (huomenna)`;
        else if (daysDiff === 0) message = `Deadline tänään: ${todo.text}`;
        else if (daysDiff < 0) message = `Deadline ohitettu: ${todo.text} (${Math.abs(daysDiff)} päivää sitten)`;
        else message = `Tuleva deadline: ${todo.text} (${daysDiff} päivän päästä)`;
      }

      if (message) showNotification(message);
    }
  });
}

// Näyttää selainilmoituksen
function showNotification(message) {
  if (!("Notification" in window)) {
    alert(message);
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
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
  initCalendar();

  if (todo.date) {
    checkDeadlines();
  }
});

// Näyttää tallennetut tehtävät
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const list = document.getElementById("todo-list");
  list.innerHTML = "";
  const isEnglish = document.documentElement.lang === 'en';

  todos.forEach((todo, index) => {
    const li = document.createElement("li");

    // Valintaruutu
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      todos[index].completed = checkbox.checked;
      localStorage.setItem("todos", JSON.stringify(todos));
      li.classList.toggle("completed", checkbox.checked);
      initCalendar();
    });

    // Teksti deadlinetiedoilla
    const textSpan = document.createElement("span");
    let dateText = "";
    if (todo.date) {
      const now = new Date();
      const deadline = new Date(todo.date);
      const timeDiff = deadline - now;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (isEnglish) {
        if (daysDiff === 0) dateText = " (today)";
        else if (daysDiff === 1) dateText = " (tomorrow)";
        else if (daysDiff > 1) dateText = ` (in ${daysDiff} days)`;
        else dateText = ` (${Math.abs(daysDiff)} days ago)`;
      } else {
        if (daysDiff === 0) dateText = " (tänään)";
        else if (daysDiff === 1) dateText = " (huomenna)";
        else if (daysDiff > 1) dateText = ` (${daysDiff} päivän päästä)`;
        else dateText = ` (${Math.abs(daysDiff)} päivää sitten)`;
      }
    }
    textSpan.textContent = `${todo.text}${todo.date ? ` - ${isEnglish ? 'Deadline' : 'Eräpäivä'}: ${todo.date}${dateText}` : ""}`;

    // Poistopainike
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      todos.splice(index, 1);
      localStorage.setItem("todos", JSON.stringify(todos));
      loadTodos();
      initCalendar();
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    if (todo.completed) li.classList.add("completed");
    list.appendChild(li);
  });
}

// Alustetaan sivu ladatessa
document.addEventListener("DOMContentLoaded", () => {
  initCalendar("fi");
  loadTodos();
  checkDeadlines();
  setInterval(checkDeadlines, 3600000); // Tarkistaa deadlinet tunnin välein
});
