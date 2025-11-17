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

fermerForme.addEventListener("click", () => closeModal(addEditEmployeeModal));
employeeForm.addEventListener("submit", ajouterOuEditerEmployer);
closeAssignModal.onclick = () => closeModal(assignModal);

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

addExperienceBtn.addEventListener("click", () => {
  const expDiv = document.createElement("div");
  expDiv.className = "experience-item";

  expDiv.innerHTML = `
      <button type="button" class="removeExp btn-danger" style="position: absolute; top: 5px; right: 5px; padding: 3px 8px; font-size: 0.8rem; border-radius: 4px;">&times;</button>
      <label>Poste: <input type="text" placeholder="Poste occupé" class="posteExp" /></label>
      <label>Entreprise: <input type="text" placeholder="Entreprise" class="entrepriseExp" /></label>
      <div class="exp-dates">
        <label>Début: <input type="number" min="1900" max="${new Date().getFullYear()}" placeholder="Ex: 2020" class="startYearExp" /></label>
        <label>Fin: <input type="number" min="1900" max="${new Date().getFullYear()}" placeholder="Ex: 2023" class="endYearExp" /></label>
      </div>
  `;

  expDiv.querySelector(".removeExp").addEventListener("click", () => {
    expDiv.remove();
  });

  experiencesList.appendChild(expDiv);
});

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

function openEditModal(index) {
  const emp = storInfoEmploy[index];
  if (!emp) return;

  isEditMode = true;
  editingIndex = index;
  document.getElementById("modalTitle").textContent = "Éditer l'employé : " + emp.name;

  nameInput.value = emp.name;
  roleSelect.value = emp.role;
  imgInput.value = emp.img === DEFAULT_PHOTO_URL ? "" : emp.img;
  emailInput.value = emp.email;
  telInput.value = emp.tel;

  previewPhoto(emp.img);

  experiencesList.innerHTML = "";
  emp.experiences.forEach((exp) => {
    const expDiv = document.createElement("div");
    expDiv.className = "experience-item";
    expDiv.innerHTML = `
          <button type="button" class="removeExp btn-danger" style="position: absolute; top: 5px; right: 5px; padding: 3px 8px; font-size: 0.8rem; border-radius: 4px;">&times;</button>
          <label>Poste: <input type="text" placeholder="Poste occupé" class="posteExp" value="${exp.poste}" /></label>
          <label>Entreprise: <input type="text" placeholder="Entreprise" class="entrepriseExp" value="${exp.entreprise}" /></label>
          <div class="exp-dates">
            <label>Début: <input type="number" min="1900" max="${new Date().getFullYear()}" placeholder="Ex: 2020" class="startYearExp" value="${exp.startYear}" /></label>
            <label>Fin: <input type="number" min="1900" max="${new Date().getFullYear()}" placeholder="Ex: 2023" class="endYearExp" value="${exp.endYear}" /></label>
          </div>
      `;
    expDiv.querySelector(".removeExp").addEventListener("click", () => {
      expDiv.remove();
    });
    experiencesList.appendChild(expDiv);
  });

  openModal(addEditEmployeeModal);
}



function affichierEmployeer() {
  affEmployeers.innerHTML = "";
  const nonAssign = storInfoEmploy.filter((e) => e.zone === null);

  if (nonAssign.length === 0) {
    paraAssignie.style.display = "block";
    return;
  }
  paraAssignie.style.display = "none";

  nonAssign.forEach((employe) => {
    const realIndex = storInfoEmploy.indexOf(employe);

    const divem = document.createElement("div");
    divem.className = "employenonassi";
    divem.dataset.index = realIndex;

    divem.innerHTML = `
          <div class="parentimg">
              <img class="imgempl" src="${employe.img}" onerror="this.src='${DEFAULT_PHOTO_URL}'" alt="${employe.name}" />
          </div>
          <div class="employe-info">
              <h3 class="h3" style="font-weight: 500;">${employe.name}</h3>
              <p class="rols">${employe.role}</p>
          </div>
          <div class="employe-actions">
              <button class="btn btn-secondary edit-employee-btn" data-index="${realIndex}" title="Éditer">
              </button>
              <button class="btn btn-danger delete-employee-btn" data-index="${realIndex}" title="Supprimer">
              </button>
          </div>
      `;

    divem.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        affEmployeersinfo(employe, realIndex);
      }
    });

    divem.querySelector(".edit-employee-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(realIndex);
    });
    divem
      .querySelector(".delete-employee-btn")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        deleteEmployee(realIndex);
      });

    affEmployeers.appendChild(divem);
  });
}


function affEmployeersinfo(employe, index) {
  openModal(profileModal);
  profileModal.innerHTML = "";

  const zoneElement = document.querySelector(`[data-zone="${employe.zone}"]`);
  const zoneName = employe.zone && zoneElement
    ? zoneElement.querySelector("h3").textContent
    : "Non assigné";

  const experiencesHTML =
    employe.experiences.length > 0
      ? employe.experiences
          .map(
            (exp) => `
        <p style="margin-bottom: 8px;">
            <strong>${exp.poste}</strong> chez ${exp.entreprise} <br>
            <small style="color: #7f8c8d;">${exp.startYear} - ${
              exp.endYear
            }</small>
        </p>
    `
          )
          .join("")
      : "<p>Aucune expérience enregistrée.</p>";

  const card = document.createElement("div");
  card.className = "modal-content profile-view";

  card.innerHTML = `
    <button class="btn btn-danger" style="position: absolute; top: 10px; right: 10px; border-radius: 50%; padding: 5px 10px;" onclick="closeProfileModal()">&times;</button>
    <img src="${employe.img}" style="width:100px;height:100px;border-radius:50%;object-fit:cover; border: 3px solid var(--color-primary);" onerror="this.src='${DEFAULT_PHOTO_URL}'"/>
    <h2>${employe.name}</h2>
    <div class="profile-details" style="text-align: left; max-width: 300px; margin: 10px auto;">
        <p><strong>Rôle:</strong> ${employe.role}</p>
        <p><strong>Localisation:</strong> ${zoneName}</p>
        <p><strong>Email:</strong> ${employe.email}</p>
        <p><strong>Téléphone:</strong> ${employe.tel}</p>
    </div>
    <hr style="width: 80%; margin: 15px auto; border-color: #eee;">
    <h3>Expériences Professionnelles</h3>
    <div style="text-align: left; max-height: 200px; overflow-y: auto; padding: 10px;">
        ${experiencesHTML}
    </div>
    <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
        <button class="btn btn-primary edit-btn" data-index="${index}">Éditer</button>
        <button class="btn btn-danger delete-btn" data-index="${index}">Supprimer</button>
    </div>
  `;

  card.querySelector(".edit-btn").addEventListener("click", () => {
    closeModal(profileModal);
    openEditModal(index);
  });
  card.querySelector(".delete-btn").addEventListener("click", () =>
    deleteEmployee(index)
  );

  profileModal.appendChild(card);
}

function deleteEmployee(index) {
  if (
    confirm(
      `etes-vous sur de vouloir supprimer ${storInfoEmploy[index].name} ?`
    )
  ) {
    storInfoEmploy.splice(index, 1);
    saveToLocalStorage();
    closeModal(profileModal);
    affichierEmployeer();
    refreshZones();
  }
}


function checkZoneWarnings() {
  document.querySelectorAll(".required-zone").forEach((zoneEl) => {
    const zoneName = zoneEl.dataset.zone;
    if (zoneName !== 'conference' && zoneName !== 'staff') {
        const count = storInfoEmploy.filter((e) => e.zone === zoneName).length;

        if (count === 0) {
          zoneEl.classList.add("required-zone-empty");
        } else {
          zoneEl.classList.remove("required-zone-empty");
        }
    }
  });
}

function refreshZones() {
  document.querySelectorAll(".zone").forEach((zone) => {
    const zoneName = zone.dataset.zone;
    const list = zone.querySelector(".zone-list");
    const counter = zone.querySelector(".zone-count");
    const capacity = zoneCapacity[zoneName];

    const inside = storInfoEmploy.filter((e) => e.zone === zoneName);

    list.innerHTML = "";

    inside.forEach((emp) => {
      const realIndex = storInfoEmploy.indexOf(emp);
      const div = document.createElement("div");
      div.className = "empInZone";
      div.dataset.index = realIndex;
      div.title = emp.name;

      div.innerHTML = `
          ${emp.name.split(" ")[0]} 
          <button title="Retirer de la zone" onclick="unassignEmployee(${realIndex})">&times;</button>
      `;

      div.addEventListener("click", (e) => {
        if (!e.target.closest("button")) {
          affEmployeersinfo(emp, realIndex);
        }
      });
      list.appendChild(div);
    });

    counter.textContent = `${inside.length} / ${capacity} employé${
      inside.length > 1 ? "s" : ""
    }`;
  });

  checkZoneWarnings();
}

function canAssign(employeeRole, zoneName) {
  const allowedZones = zoneRules[employeeRole];
  if (!allowedZones) {
    return false;
  }
  return allowedZones.includes(zoneName);
}

function assignEmployee(index, zone) {
  const employee = storInfoEmploy[index];

  if (!employee) return;

  const countInZone = storInfoEmploy.filter((e) => e.zone === zone).length;

  if (countInZone >= zoneCapacity[zone]) {
    alert("Zone pleine ! Capacité max atteinte.");
    return;
  }

  if (!canAssign(employee.role, zone)) {
    alert(
      `L'employé ${employee.name} (Rôle: ${employee.role}) n'est pas autorisé dans cette zone selon les règles métier.`
    );
    return;
  }

  employee.zone = zone;
  saveToLocalStorage();

  closeModal(assignModal);
  affichierEmployeer();
  refreshZones();
}

function unassignEmployee(index) {
  const employee = storInfoEmploy[index];
  if (!employee) return;

  employee.zone = null;
  saveToLocalStorage();

  affichierEmployeer();
  refreshZones();
}


function openAssignModal(zoneName) {
  openModal(assignModal);
  assignZoneTitle.textContent = `Zone: ${
    document.querySelector(`[data-zone="${zoneName}"] h3`).textContent
  }`;
  assignList.innerHTML = "";

  const unassigned = storInfoEmploy.filter((e) => e.zone === null);
  let eligibleCount = 0;

  unassigned.forEach((emp) => {
    if (canAssign(emp.role, zoneName)) {
      eligibleCount++;
      const realIndex = storInfoEmploy.indexOf(emp);
      const item = document.createElement("div");
      item.className = "assignItem";
      item.innerHTML = `
          <div style="display: flex; align-items: center;">
             <img src="${emp.img}" onerror="this.src='${DEFAULT_PHOTO_URL}'" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
             <span>${emp.name} (${emp.role})</span>
          </div>
          <button class="btn btn-primary assignNowBtn">Assigner</button>
      `;

      item.querySelector(".assignNowBtn").onclick = () => {
        assignEmployee(realIndex, zoneName);
      };

      assignList.appendChild(item);
    }
  });

  if (eligibleCount === 0) {
    assignList.innerHTML =
      '<p style="text-align:center; color: var(--color-danger); padding: 10px;">Aucun employé non assigné éligible pour cette zone.</p>';
  }
}


ajouteEmployersBtn.addEventListener("click", () => {
  resetForm();
  previewPhoto("");
  openModal(addEditEmployeeModal);
});


