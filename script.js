//  Firebase ja sisäänkirjautuminen
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
    loginArea.innerHTML = `<p>Tervetuloa, ${user.displayName} (${user.email})</p>
   <button onclick="firebase.auth().signOut()">Kirjaudu ulos</button>`;
  } else {
    ui.start("#login-area", {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: window.location.href
    }, "fi");
  }
});
//  FullCalendarin alustus
let calendar;
function initCalendar(locale = 'fi') {
  const calendarEl = document.getElementById('calendar');
  if (calendar) calendar.destroy();

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: locale,
    aspectRatio: 1.3,
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

//  Teeman vaihto
document.getElementById("light-mode").addEventListener("click", () => {
  document.body.classList.remove("dark");
});
document.getElementById("dark-mode").addEventListener("click", () => {
  document.body.classList.add("dark");
});

//  Kielen vaihto
document.getElementById("fi").addEventListener("click", () => {
  changeLanguage("fi");
  initCalendar("fi");
});
document.getElementById("en").addEventListener("click", () => {
  changeLanguage("en");
  initCalendar("en");
});

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

  // Päivitä placeholderit
  if (lang === 'fi') {
    document.getElementById('todo-input').placeholder = 'Lisää uusi tehtävä...';
    document.getElementById('material-title').placeholder = 'Materiaalin otsikko...';
    document.getElementById('material-notes').placeholder = 'Muistiinpanot...';
  } else {
    document.getElementById('todo-input').placeholder = 'Add new task...';
    document.getElementById('material-title').placeholder = 'Material title...';
    document.getElementById('material-notes').placeholder = 'Notes...';
  }

  loadTodos();
  loadMaterials();
}


// Todo-lista

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

    // Tekstielementti (sisältää eräpäivätiedot)
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

    // Poistonappi
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


// Materiaalit

// Lataa tallennetut materiaalit ja renderöi ne
function loadMaterials() {
  const materials = JSON.parse(localStorage.getItem("materials") || "[]");
  const list = document.getElementById("materials-list");
  list.innerHTML = "";

  materials.forEach(material => {
    renderMaterial(material);
  });
}

// Renderöi yhden materiaalikortin
function renderMaterial(material) {
  const list = document.getElementById("materials-list");

  const materialEl = document.createElement('div');
  materialEl.className = 'material-item';
  materialEl.dataset.id = material.id;

  const titleEl = document.createElement('h3');
  titleEl.textContent = material.title;

  const dateEl = document.createElement('p');
  dateEl.textContent = new Date(material.date).toLocaleDateString(
    document.documentElement.lang === 'en' ? 'en-US' : 'fi-FI'
  );
  dateEl.style.fontSize = '0.8em';
  dateEl.style.color = '#666';

  const notesEl = document.createElement('p');
  notesEl.textContent = material.notes;

  materialEl.appendChild(titleEl);
  materialEl.appendChild(dateEl);
  materialEl.appendChild(notesEl);

  if (material.link) {
    const linkEl = document.createElement('a');
    linkEl.href = material.link;
    linkEl.textContent = material.link;
    linkEl.target = '_blank';
    linkEl.style.display = 'block';
    linkEl.style.marginTop = '8px';
    linkEl.style.color = '#3498db';
    materialEl.appendChild(linkEl);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.className = 'delete-btn'; 
  deleteBtn.title = document.documentElement.lang === "en" ? "Delete material" : "Poista materiaali";
  deleteBtn.style.marginTop = '10px';
  deleteBtn.style.background = 'transparent';
  deleteBtn.style.border = 'none';
  deleteBtn.style.color = '#e74c3c';
  deleteBtn.style.cursor = 'pointer';

  deleteBtn.addEventListener('click', () => {
    deleteMaterial(material.id);
  });

  materialEl.appendChild(deleteBtn);
  list.appendChild(materialEl);
}

// Poistaa materiaalin id:n perusteella
function deleteMaterial(id) {
  let materials = JSON.parse(localStorage.getItem("materials") || "[]");
  materials = materials.filter(m => m.id !== id);
  localStorage.setItem("materials", JSON.stringify(materials));
  loadMaterials();
}

// Käsittelijä materiaalien lisäämiseen lomakkeelta
document.getElementById('material-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const titleInput = document.getElementById('material-title');
  const linkInput = document.getElementById('material-link');
  const notesInput = document.getElementById('material-notes');

  const material = {
    id: Date.now(),
    title: titleInput.value.trim(),
    link: linkInput.value.trim(),
    notes: notesInput.value.trim(),
    date: new Date().toISOString()
  };

  const materials = JSON.parse(localStorage.getItem("materials") || "[]");
  materials.push(material);
  localStorage.setItem("materials", JSON.stringify(materials));

  titleInput.value = "";
  linkInput.value = "";
  notesInput.value = "";

  loadMaterials();
});


// Deadlinet ja ilmoitukset

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


// Motivaatiolainaukset


const motivationQuotes = {
  fi: [
    "Muisti on voimakas. Käytä sitä.",
    "Jos odotamme kunnes olemme valmiita, odotamme koko elämämme.",
    "Ei ole koskaan liian myöhäistä olla se, mikä voisi olla.",
    "Älä lopeta ennen kuin olet ylpeä.",
    "Joki kuluttaa kiven ei voimallaan vaan sinnikkyydellään.",
    "Miehenä vuoren huipulla ei pudonnut sinne.",
    "Ero tavallisen ja erityisen välillä on se pieni ylimääräinen.",
    "Älä koskaan anna pienten mielien vakuuttaa sinua, että unelmasi ovat liian suuria.",
    "Ihmiset, jotka ovat tarpeeksi hulluja uskomaan, että he voivat muuttaa maailman, ovat niitä, jotka tekevät sen. — Steve Jobs",
    "Monet elämän epäonnistumiset ovat ihmisiä, jotka eivät tajunneet kuinka lähellä menestystä olivat, kun he luovuttivat. — Thomas Edison",
    "Sinun ei tarvitse olla loistava aloittaaksesi. Mutta sinun on aloitettava ollaksesi loistava.",
    "Menestys ei ole lopullinen, epäonnistuminen ei ole kohtalokas; sillä rohkeus jatkaa on se, mikä merkitsee. — Winston Churchill",
    "Koulutus on mahtavin ase, jolla voit muuttaa maailmaa. — Nelson Mandela",
    "Voittajat epäonnistuvat uudestaan ja uudestaan, kunnes he onnistuvat."
  ],
  en: [
    "Memory is powerful. Use it.",
    "If we wait until we’re ready, we’ll be waiting for the rest of our lives.",
    "It’s never too late to be what you might have been.",
    "Don’t stop until you’re proud.",
    "A river cuts through rock not because of its power but because of its persistence.",
    "Success is not final, failure is not fatal; it is the courage to continue that counts. — Winston Churchill",
    "Education is the most powerful weapon which you can use to change the world. — Nelson Mandela",
    "Don’t stop until you’re proud.",
    "Winners will fail over and over again until they succeed.",
    "The man on top of the mountain didn’t fall there.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Never let small minds convince you that your dreams are too big.",
    "The people who are crazy enough to believe they can change the world are the ones who do. — Steve Jobs"
  ]
};

const toast = document.createElement('div');
toast.id = 'motivational-toast';
document.body.appendChild(toast);

function startMotivationToasts() {
  showMotivationalToast();
  setInterval(showMotivationalToast, 30 * 60 * 1000);
}

function showMotivationalToast() {
  const lang = document.documentElement.lang === "en" ? "en" : "fi";
  const quotes = motivationQuotes[lang];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const colors = [
    "#2c3e50", "#8e44ad", "#16a085", "#2980b9",
    "#d35400", "#c0392b", "#27ae60", "#34495e",
    "#7f8c8d", "#f39c12"
  ];
  const bg = colors[Math.floor(Math.random() * colors.length)];

  toast.textContent = quote;
  toast.style.backgroundColor = bg;
  toast.style.color = "#fff";
  toast.classList.add('visible');

  setTimeout(() => toast.classList.remove('visible'), 10000);
}

// DOMContentLoaded: kutsut

document.addEventListener("DOMContentLoaded", () => {
  initCalendar("fi");
  loadTodos();
  loadMaterials();
  checkDeadlines();
  setInterval(checkDeadlines, 3600000);
  startMotivationToasts();
});

