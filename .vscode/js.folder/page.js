const zoneRules = {
  Réceptionniste: ["reception"],
  "Technicien IT": ["servers"],
  "Agent de sécurité": ["security"],
  Manager: [
    "conference", "reception", "servers", "security", "staff", "archives",
  ], 
  Nettoyage: ["conference", "reception", "servers", "security", "staff"], 
  Autre: ["conference", "staff", "archives"], 
};

const zoneCapacity = {
  conference: 10,
  reception: 2,
  servers: 3,
  security: 4,
  staff: 15,
  archives: 5,
};

const DEFAULT_PHOTO_URL = "https://tse4.mm.bing.net/th/id/OIP.IGNf7GuQaCqz_RPq5wCkPgHaLH?rs=1&pid=ImgDetMain&o=7&rm=3";
let storInfoEmploy = []; 
let isEditMode = false;
let editingIndex = -1;
const addEditEmployeeModal = document.getElementById("addEmployesform"); 
const employeeForm = document.getElementById("employeeForm");
const container = document.querySelector(".container");
const fermerForme = document.getElementById("annulerinfo");
const ajouteEmployersBtn = document.getElementById("addEmployeeBtn");

const nameInput = document.getElementById("nom");
const roleSelect = document.getElementById("selectAj");
const imgInput = document.getElementById("img");
const emailInput = document.getElementById("email");
const telInput = document.getElementById("tel");

const photoPreviewDiv = document.getElementById("photoPreview");
const affEmployeers = document.getElementById("unassignedList");
const paraAssignie = document.getElementById("noUnassignedMsg");
const profileModal = document.getElementById("profileModal");

const experiencesList = document.getElementById("ajoutExper");
const addExperienceBtn = document.getElementById("addExperienceBtn");

const assignModal = document.getElementById("assignModal");
const assignList = document.getElementById("assignList");
const closeAssignModal = document.getElementById("closeAssignModal");
const assignZoneTitle = document.getElementById("assignZoneTitle");

function saveToLocalStorage() {
  localStorage.setItem("worksphereEmployees", JSON.stringify(storInfoEmploy));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem("worksphereEmployees");
  if (data) {
    storInfoEmploy = JSON.parse(data);
  }
}

function resetForm() {
  employeeForm.reset();
  experiencesList.innerHTML = "";
  isEditMode = false;
  editingIndex = -1;
  document.getElementById("modalTitle").textContent = "Ajouter un employé";
  previewPhoto("");
}

