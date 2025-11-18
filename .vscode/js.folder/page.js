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

function previewPhoto(url) {
  photoPreviewDiv.innerHTML = "";
  const img = document.createElement("img");
  img.src = url || DEFAULT_PHOTO_URL;
  img.onerror = () => {
    img.src = DEFAULT_PHOTO_URL;
  };
  img.style = "width:60px;height:60px;border-radius:50%;object-fit:cover; margin: 10px 0; border: 3px solid var(--color-primary);";
  photoPreviewDiv.appendChild(img);
}
imgInput.addEventListener("input", (e) => previewPhoto(e.target.value));


function getExperiencesFromForm() {
  let experiences = [];
  let isDateValid = true;
  
  document.querySelectorAll(".experience-item").forEach((exp, index) => {
    const poste = exp.querySelector(".posteExp").value.trim();
    const entreprise = exp.querySelector(".entrepriseExp").value.trim();
    const startYear = parseInt(exp.querySelector(".startYearExp").value);
    const endYear = parseInt(exp.querySelector(".endYearExp").value);
    
    const isPartiallyFilled = poste || entreprise || !isNaN(startYear) || !isNaN(endYear);

    if (isPartiallyFilled && (poste === "" || entreprise === "" || isNaN(startYear) || isNaN(endYear))) {
      alert(`Erreur: Veuillez remplir tous les champs (Poste, Entreprise, Début, Fin) de l'expérience #${index + 1} ou la supprimer.`);
      isDateValid = false;
      return;
    }

    if (!isNaN(startYear) && !isNaN(endYear) && startYear > endYear) {
      alert(
        `Erreur: L'année de début (${startYear}) doit être antérieure ou égale à l'année de fin (${endYear}) pour l'expérience #${index + 1}.`
      );
      isDateValid = false;
      return;
    }

    if (isPartiallyFilled) {
        experiences.push({
            poste: poste,
            entreprise: entreprise,
            startYear: startYear,
            endYear: endYear,
        });
    }
  });
  return isDateValid ? experiences : null;
}

function openModal(modal) {
  modal.classList.remove("modal-hidden");
  container.style.opacity = "0.3";
}

function closeModal(modal) {
  modal.classList.add("modal-hidden");
  container.style.opacity = "1";
}

function closeProfileModal() {
    closeModal(profileModal);
}
function getExperiencesFromForm() {
  let experiences = [];
  let isDateValid = true;
  
  document.querySelectorAll(".experience-item").forEach((exp, index) => {
    const poste = exp.querySelector(".posteExp").value.trim();
    const entreprise = exp.querySelector(".entrepriseExp").value.trim();
    const startYear = parseInt(exp.querySelector(".startYearExp").value);
    const endYear = parseInt(exp.querySelector(".endYearExp").value);
    
    const isPartiallyFilled = poste || entreprise || !isNaN(startYear) || !isNaN(endYear);

    if (isPartiallyFilled && (poste === "" || entreprise === "" || isNaN(startYear) || isNaN(endYear))) {
      alert(`Erreur: Veuillez remplir tous les champs (Poste, Entreprise, Début, Fin) de l'expérience #${index + 1} ou la supprimer.`);
      isDateValid = false;
      return;
    }

    if (!isNaN(startYear) && !isNaN(endYear) && startYear > endYear) {
      alert(
        `Erreur: L'année de début (${startYear}) doit être antérieure ou égale à l'année de fin (${endYear}) pour l'expérience #${index + 1}.`
      );
      isDateValid = false;
      return;
    }

    if (isPartiallyFilled) {
        experiences.push({
            poste: poste,
            entreprise: entreprise,
            startYear: startYear,
            endYear: endYear,
        });
    }
  });
  return isDateValid ? experiences : null;
}
function ajouterOuEditerEmployer(event) {
  event.preventDefault();

  if (!employeeForm.checkValidity()) {
    return; 
  }

  const experiences = getExperiencesFromForm();
  if (experiences === null) {
    return;
  }

  const employeeData = {
    name: nameInput.value.trim(),
    role: roleSelect.value,
    img: imgInput.value.trim() || DEFAULT_PHOTO_URL,
    email: emailInput.value.trim(),
    tel: telInput.value.trim(),
    zone: isEditMode && editingIndex !== -1 ? storInfoEmploy[editingIndex].zone : null,
    experiences: experiences,
  };

  if (isEditMode && editingIndex !== -1) {
    storInfoEmploy[editingIndex] = employeeData; 
  } else {
    storInfoEmploy.push(employeeData); 
  }
  closeModal(addEditEmployeeModal);
  resetForm();
  saveToLocalStorage();
  affichierEmployeer();
  refreshZones();
}

