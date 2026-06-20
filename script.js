let health = 15;
let armor = 2;
let ap = 3;
let startingAP = 3;
let activeProfile = "selene";
let rollHistory = [];

const championProfiles = {
  selene: {
    name: "Selene",
    icon: "☾",
    health: 15,
    armor: 2,
    ap: 3,
    attributes: {
      might: 1,
      speed: 4,
      resolve: 2,
      focus: 5,
      influence: 3
    },
    passiveTitle: "Passive — Calculated Future",
    passiveText: "Once per turn, after a D20 roll, you may increase or decrease the result by 1.",
    basic: "Basic Attack: 1 AP → 1 Damage",
    signatureName: "Command Reality",
    signatureAttribute: "focus",
    signatureDifficulty: 17,
    signatureCost: 2,
    signatureEffects: {
      success: "You may change one d20 result this turn by +2 or -2.",
      nat20: "You may change one d20 result this turn by +3 or -3 and gain +1 AP.",
      nat1: "Exhaust 1 AP."
    }
  },
  mark: {
    name: "Mark",
    icon: "⚔",
    health: 18,
    armor: 2,
    ap: 2,
    attributes: {
      might: 5,
      speed: 2,
      resolve: 4,
      focus: 1,
      influence: 3
    },
    passiveTitle: "Passive — Berserker Spirit",
    passiveText: "When Mark is below half health, gain +1 AP and add +2 Might to all Might checks.",
    basic: "Basic Attack: 1 AP → 1 Damage",
    signatureName: "Rage Surge",
    signatureAttribute: "might",
    signatureDifficulty: 18,
    signatureCost: 2,
    signatureEffects: {
      success: "Your next Basic Attack this turn deals +2 damage.",
      nat20: "Gain +1 AP. Your next Basic Attack this turn deals +3 damage.",
      nat1: "Exhaust 1 AP."
    }
  },
  custom: {
    name: "Custom Champion",
    icon: "♙",
    health: 20,
    armor: 0,
    ap: 6,
    attributes: {
      might: 3,
      speed: 3,
      resolve: 3,
      focus: 3,
      influence: 3
    },
    passiveTitle: "Passive — Custom",
    passiveText: "Use this slot for testing a custom Champion.",
    basic: "Basic Attack: 1 AP → 1 Damage",
    signatureName: "Signature Ability",
    signatureAttribute: "focus",
    signatureDifficulty: 17,
    signatureCost: 2,
    signatureEffects: {
      success: "Apply this Champion's custom success effect.",
      nat20: "Apply this Champion's custom Nat 20 effect.",
      nat1: "Exhaust 1 AP."
    }
  }
};

let attributes = { ...championProfiles.selene.attributes };
let markBerserkerActive = false;

function isMarkBerserkerActive() {
  const profile = getActiveProfile();
  return profile.name === "Mark" && health < profile.health / 2;
}

function getCurrentStartingAP() {
  const profile = getActiveProfile();
  return profile.ap + (isMarkBerserkerActive() ? 1 : 0);
}

function getRollBonusDetails(attribute) {
  const base = attributes[attribute] || 0;
  const bonuses = [];

  if (activeProfile === "mark" && attribute === "might" && isMarkBerserkerActive()) {
    bonuses.push({ label: "Berserker Spirit", value: 2 });
  }

  const bonusTotal = bonuses.reduce((sum, item) => sum + item.value, 0);
  return { base, bonuses, total: base + bonusTotal };
}

function getRollBonus(attribute) {
  return getRollBonusDetails(attribute).total;
}

function getAPStateDetails() {
  const profile = getActiveProfile();
  const bonuses = [];

  if (profile.name === "Mark" && isMarkBerserkerActive()) {
    bonuses.push({ label: "Berserker Spirit", value: 1 });
  }

  const bonusTotal = bonuses.reduce((sum, item) => sum + item.value, 0);
  return { base: profile.ap, bonuses, total: profile.ap + bonusTotal };
}

function formatSigned(value) {
  return (value >= 0 ? "+" : "") + value;
}

function applyStatePassives() {
  const profile = getActiveProfile();
  if (profile.name !== "Mark") {
    markBerserkerActive = false;
    startingAP = profile.ap;
    return;
  }

  const activeNow = isMarkBerserkerActive();
  startingAP = profile.ap + (activeNow ? 1 : 0);

  if (activeNow && !markBerserkerActive) {
    ap += 1;
  }

  markBerserkerActive = activeNow;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function getActiveProfile() {
  return championProfiles[activeProfile];
}

function loadChampionProfile() {
  activeProfile = document.getElementById("championSelect").value;
  resetGame();
}

function updateChampionInfo() {
  const profile = getActiveProfile();
  setText("championIcon", profile.icon);
  setText("championPassiveTitle", profile.passiveTitle);
  setText("championPassiveText", profile.passiveText);
  setText("championBasic", profile.basic);
  setText("signatureName", profile.signatureName);
  setText("signatureText", profile.signatureCost + " AP • " + capitalize(profile.signatureAttribute) + " " + profile.signatureDifficulty);
}

function updateDisplay() {
  applyStatePassives();
  setText("health", health);
  setText("armor", armor);
  setText("ap", ap);
  for (const attribute in attributes) {
    setText(attribute, attributes[attribute]);
  }

  updateChampionInfo();
}

function clearRoll() {
  closeResultPopup();
}

function showResultPopup(title, status, formula, resultClass = "") {
  const modal = document.getElementById("resultModal");
  const titleBox = document.getElementById("resultModalTitle");
  const statusBox = document.getElementById("resultModalStatus");
  const formulaBox = document.getElementById("resultModalFormula");

  if (!modal || !titleBox || !statusBox || !formulaBox) return;

  titleBox.innerText = title;
  statusBox.className = resultClass;
  statusBox.innerText = status;
  formulaBox.innerText = formula;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeResultPopup() {
  const modal = document.getElementById("resultModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}


function changeHealth(amount) {
  health += amount;
  if (health < 0) health = 0;
  updateDisplay();
}

function changeArmor(amount) {
  armor += amount;
  if (armor < 0) armor = 0;
  setText("armor", armor);
}

function changeAP(amount) {
  ap += amount;
  if (ap < 0) ap = 0;
  setText("ap", ap);
}

function changeAttribute(attribute, amount) {
  attributes[attribute] += amount;
  if (attributes[attribute] < 0) attributes[attribute] = 0;
  setText(attribute, attributes[attribute]);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getRollResultLabel(roll, total, difficulty) {
  if (roll === 20) return { status: "NAT 20", className: "nat20" };
  if (roll === 1) return { status: "NAT 1", className: "nat1" };
  if (difficulty !== null && total >= difficulty) return { status: "SUCCESS", className: "success" };
  if (difficulty !== null) return { status: "FAILED", className: "fail" };
  return { status: "ROLL RESULT", className: "" };
}

function getBonusLine(attribute, baseBonus, passiveBonus) {
  const details = getRollBonusDetails(attribute);
  const lines = [];
  lines.push(capitalize(attribute) + " Base: " + formatSigned(details.base));

  if (details.bonuses.length) {
    lines.push("Bonuses:");
    details.bonuses.forEach(item => lines.push("• " + item.label + ": " + formatSigned(item.value)));
  } else {
    lines.push("Bonuses: none");
  }

  lines.push(capitalize(attribute) + " Final: " + formatSigned(details.total));
  return lines.join("\n");
}

function getAPStateLine() {
  const details = getAPStateDetails();
  const parts = ["Base AP " + details.base];
  details.bonuses.forEach(item => parts.push(item.label + " " + formatSigned(item.value)));
  return "AP: " + ap + " / " + details.total + " (" + parts.join(" • ") + ")";
}

function buildSimpleRollMessage({ championName, rollType, roll, attribute, baseBonus, passiveBonus, total, difficulty, outcome, effectText }) {
  let lines = [];
  lines.push(championName + " — " + rollType);
  lines.push("Roll: " + roll);
  lines.push(getBonusLine(attribute, baseBonus, passiveBonus));
  lines.push("Total: " + total + (difficulty !== null ? " vs " + difficulty : ""));

  if (outcome === "fail") {
    lines.push("");
    lines.push("FAILED");
    return lines.join("\n");
  }

  if (effectText) {
    lines.push("");
    lines.push("Effect: " + effectText);
  }

  return lines.join("\n");
}

function rollAttribute(attribute, difficulty = null, label = null) {
  const profile = getActiveProfile();
  const roll = Math.floor(Math.random() * 20) + 1;
  const bonusDetails = getRollBonusDetails(attribute);
  const baseBonus = bonusDetails.base;
  const bonus = bonusDetails.total;
  const passiveBonus = bonus - baseBonus;
  const total = roll + bonus;
  const rollName = label || capitalize(attribute);
  const result = getRollResultLabel(roll, total, difficulty);

  const message = buildSimpleRollMessage({
    championName: profile.name,
    rollType: rollName,
    roll,
    attribute,
    baseBonus,
    passiveBonus,
    total,
    difficulty,
    outcome: result.status === "FAILED" ? "fail" : "attribute"
  });

  showResultPopup(profile.name + " " + rollName, result.status, message, result.className);
  addRollHistory(rollName + ": " + roll + " + " + bonus + " = " + total + (difficulty ? " vs " + difficulty : ""));
}


function handleSignatureKey(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    rollSignature();
  }
}

function getChampionStateText() {
  const profile = getActiveProfile();
  const activeNotes = [];
  if (profile.name === "Mark" && isMarkBerserkerActive()) {
    activeNotes.push("Berserker Spirit active: +1 max AP and +2 Might rolls.");
  }
  return "Champion State After Roll:\nHealth: " + health + " / " + profile.health +
    "\nArmor: " + armor +
    "\nAP: " + ap + " / " + startingAP +
    (activeNotes.length ? "\n" + activeNotes.join("\n") : "");
}

function applySignatureOutcome(profile, outcome) {
  const effects = profile.signatureEffects || {};

  if (outcome === "nat20") {
    if (profile.name === "Selene") ap += 1;
    if (profile.name === "Mark") ap += 1;
    return effects.nat20 || "Apply the Nat 20 effect.";
  }

  if (outcome === "success") {
    return effects.success || "Apply the success effect.";
  }

  if (outcome === "nat1") {
    ap = Math.max(0, ap - 1);
    return effects.nat1 || "Exhaust 1 AP.";
  }

  return "";
}

function rollSignature() {
  const profile = getActiveProfile();
  applyStatePassives();

  if (ap < profile.signatureCost) {
    showResultPopup(
      profile.name + " Signature Ability",
      "NOT ENOUGH AP",
      profile.name + " cannot use " + profile.signatureName + ".\nNeed " + profile.signatureCost + " AP.\n" + getAPStateLine(),
      "fail"
    );
    return;
  }

  ap -= profile.signatureCost;

  const attribute = profile.signatureAttribute;
  const roll = Math.floor(Math.random() * 20) + 1;
  const bonusDetails = getRollBonusDetails(attribute);
  const baseBonus = bonusDetails.base;
  const bonus = bonusDetails.total;
  const passiveBonus = bonus - baseBonus;
  const total = roll + bonus;

  let outcome = "fail";
  let resultClass = "fail";
  let status = "FAILED";

  if (roll === 20) {
    outcome = "nat20";
    resultClass = "nat20";
    status = "NAT 20";
  } else if (roll === 1) {
    outcome = "nat1";
    resultClass = "nat1";
    status = "NAT 1";
  } else if (total >= profile.signatureDifficulty) {
    outcome = "success";
    resultClass = "success";
    status = "SUCCESS";
  }

  const effectText = applySignatureOutcome(profile, outcome);
  applyStatePassives();
  updateDisplay();

  let message = buildSimpleRollMessage({
    championName: profile.name,
    rollType: profile.signatureName,
    roll,
    attribute,
    baseBonus,
    passiveBonus,
    total,
    difficulty: profile.signatureDifficulty,
    outcome,
    effectText: outcome === "fail" ? "" : effectText
  });

  message += "\n\n" + getAPStateLine();

  showResultPopup(profile.name + " Signature Ability", status, message, resultClass);
  addRollHistory(profile.signatureName + ": " + roll + " + " + bonus + " = " + total + " vs " + profile.signatureDifficulty);
}


function addRollHistory(entry) {
  // Recent roll tracker was removed from the main UI to save space.
  // Keep a tiny in-memory history in case future tools need it.
  rollHistory.unshift(entry);
  rollHistory = rollHistory.slice(0, 3);
}

function refreshAP() {
  applyStatePassives();
  ap = getCurrentStartingAP();
  updateDisplay();
}

function nextTurn() {
  refreshAP();
}

function resetGame() {
  const profile = getActiveProfile();

  health = profile.health;
  armor = profile.armor;
  ap = profile.ap;
  startingAP = profile.ap;
  attributes = { ...profile.attributes };
  markBerserkerActive = false;
  rollHistory = [];

  updateDisplay();
  clearRoll();
}

function toggleMenu(){
 const menu = document.getElementById("menuDropdown");
 menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function showTracker(){
 document.getElementById("trackerPage").style.display="block";
 document.getElementById("rulesPage").style.display="none";
 document.getElementById("menuDropdown").style.display="none";
}

function showRules(){
 document.getElementById("trackerPage").style.display="none";
 document.getElementById("rulesPage").style.display="block";
 document.getElementById("menuDropdown").style.display="none";
}


document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") closeResultPopup();
});

document.addEventListener("click", function(event) {
  const modal = document.getElementById("resultModal");
  if (modal && event.target === modal) closeResultPopup();
});

window.onload = function() {
  document.getElementById("championSelect").value = activeProfile;
  resetGame();
};
