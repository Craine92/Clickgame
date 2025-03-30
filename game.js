// Spielzustand
const gameState = {
    wood: 100,
    clay: 100,
    iron: 100,
    crop: 100,
    buildings: {
        woodcutter: 0,
        clay_pit: 0,
        iron_mine: 0,
        farm: 0
    },
    research: {
        wood_production: 1,
        clay_production: 1,
        iron_production: 1,
        crop_production: 1,
        'knight-armor': 0,
        'knight-weapons': 0,
        'archer-training': 0,
        'archer-range': 0,
        'cavalry-training': 0,
        'cavalry-armor': 0
    },
    units: {
        spearman: 0,
        archer: 0,
        cavalry: 0
    },
    map: {
        size: 5,
        tiles: []
    },
    unitStats: {
        spearman: {
            health: 60,
            attack: 25,
            defense: 20,
            level: 0
        },
        archer: {
            health: 40,
            attack: 15,
            defense: 5,
            level: 0
        },
        cavalry: {
            health: 70,
            attack: 20,
            defense: 10,
            level: 0
        }
    },
    unitUpgrades: {
        spearman: { attack: 0, defense: 0 },
        archer: { attack: 0 },
        cavalry: { attack: 0, defense: 0 }
    },
    gameStartTime: Date.now(), // Zeitpunkt des Spielstarts
    totalPlayTime: 0, // Gespeicherte Spielzeit in Sekunden
    buildingUpgrades: {
        woodcutter: 0,
        clay_pit: 0,
        iron_mine: 0,
        farm: 0
    },
    warehouse: {
        level: 1,
        capacity: 1000
    },
    fortress: {
        level: 1,
        capacity: 15
    }
};

// Einheitenstats (Basis-Werte für Reset)
const baseUnitStats = {
    spearman: {
        health: 60,
        attack: 25,
        defense: 20,
        level: 0
    },
    archer: {
        health: 40,
        attack: 15,
        defense: 5,
        level: 0
    },
    cavalry: {
        health: 70,
        attack: 20,
        defense: 10,
        level: 0
    }
};

// Speichere den Spielzustand
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Lade den Spielzustand
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Aktualisiere den Spielzustand mit den gespeicherten Daten
        Object.assign(gameState, parsedState);
        return true;
    }
    return false;
}

// Produktionsraten pro Gebäude (erhöht um 20%)
const productionRates = {
    woodcutter: { wood: 1.2 },
    clay_pit: { clay: 1.2 },
    iron_mine: { iron: 1.2 },
    farm: { crop: 1.2 }
};

// Basis-Baukosten
const baseBuildingCosts = {
    woodcutter: { wood: 50, clay: 30, iron: 20 },
    clay_pit: { wood: 40, clay: 50, iron: 20 },
    iron_mine: { wood: 40, clay: 30, iron: 50 },
    farm: { wood: 40, clay: 30, iron: 20, crop: 20 },
    warehouse: {
        wood: 200,
        clay: 250,
        iron: 100,
        crop: 50
    },
    fortress: {
        wood: 300,
        clay: 400,
        iron: 200,
        crop: 100
    }
};

// Basis-Forschungskosten für Einheiten
const baseUnitResearchCosts = {
    'knight-armor': { iron: 100, clay: 80 },
    'knight-weapons': { iron: 120, crop: 50 },
    'archer-training': { wood: 80, crop: 40 },
    'archer-range': { wood: 100, iron: 50 },
    'cavalry-training': { clay: 70, crop: 60 },
    'cavalry-armor': { iron: 90, clay: 60 }
};

// Ressourcen-Forschungskosten
const resourceResearchCosts = {
    wood_production: { wood: 100, clay: 50, iron: 30 },
    clay_production: { wood: 80, clay: 100, iron: 30 },
    iron_production: { wood: 80, clay: 50, iron: 100 },
    crop_production: { wood: 80, clay: 50, iron: 30, crop: 50 }
};

// Forschungsbonus
const researchBonus = 0.2; // 20% Erhöhung pro Level

// Einheitenkosten
const unitCosts = {
    spearman: { iron: 80, clay: 50, crop: 30 },
    archer: { wood: 60, iron: 30, crop: 25 },
    cavalry: { iron: 75, clay: 50, crop: 40 }
};

// Einheitenstats
const unitStats = {
    spearman: { health: 40, attack: 10, defense: 15 },
    archer: { health: 30, attack: 15, defense: 5 },
    cavalry: { health: 60, attack: 20, defense: 10 }
};

// Basis-Upgrade-Kosten für Einheiten
const unitUpgradeCosts = {
    spearman: { iron: 100, clay: 80, crop: 50 },
    archer: { wood: 80, iron: 40, crop: 40 },
    cavalry: { iron: 90, clay: 70, crop: 60 }
};

// Basis-Verbesserungskosten für Gebäude
const baseBuildingUpgradeCosts = {
    woodcutter: { wood: 1000, clay: 1000, iron: 1000, crop: 1000 },
    clay_pit: { wood: 1000, clay: 1000, iron: 1000, crop: 1000 },
    iron_mine: { wood: 1000, clay: 1000, iron: 1000, crop: 1000 },
    farm: { wood: 1000, clay: 1000, iron: 1000, crop: 1000 }
};

const MAX_BUILDING_LEVEL = 15; // Maximales Level für Gebäude
const MAX_BUILDING_UPGRADE_LEVEL = 5; // Maximales Level für Verbesserungen (5% bis 25%)
const BASE_UPGRADE_BONUS = 0.05; // 5% Basis-Verbesserungsbonus

// Berechne die aktuellen Baukosten basierend auf dem Level
function getBuildingCosts(buildingType) {
    const baseCosts = baseBuildingCosts[buildingType];
    const level = gameState.buildings[buildingType];
    const costMultiplier = Math.pow(1.5, level); // 50% Erhöhung pro Level
    
    const costs = {};
    for (const [resource, cost] of Object.entries(baseCosts)) {
        costs[resource] = Math.floor(cost * costMultiplier);
    }
    return costs;
}

// Berechne die aktuellen Forschungskosten basierend auf dem Level
function getResearchCosts(researchType) {
    // Für Ressourcen-Forschungen
    if (resourceResearchCosts[researchType]) {
        const baseCosts = resourceResearchCosts[researchType];
        const level = gameState.research[researchType];
        const costMultiplier = Math.pow(1.5, level - 1); // Erhöhung basierend auf aktuellem Level
        
        const costs = {};
        for (const [resource, cost] of Object.entries(baseCosts)) {
            costs[resource] = Math.floor(cost * costMultiplier);
        }
        return costs;
    }
    
    // Für Einheiten-Forschungen
    if (baseUnitResearchCosts[researchType]) {
        const baseCosts = baseUnitResearchCosts[researchType];
        const level = gameState.research[researchType];
        const costMultiplier = Math.pow(1.5, level); // 50% Erhöhung pro Level
        
        const costs = {};
        for (const [resource, cost] of Object.entries(baseCosts)) {
            costs[resource] = Math.floor(cost * costMultiplier);
        }
        return costs;
    }
    
    return {};
}

// Berechne die aktuellen Upgrade-Kosten basierend auf dem Level
function getUpgradeCosts(unitType) {
    const baseCosts = unitUpgradeCosts[unitType];
    const currentLevel = gameState.unitStats[unitType].level;
    
    // Kosten steigen exponentiell mit dem Level
    // Level 0 -> Basiskosten
    // Level 1 -> Basiskosten × 1.5
    // Level 2 -> Basiskosten × 2.25
    // Level 3 -> Basiskosten × 3.375
    // usw.
    const costMultiplier = Math.pow(1.5, currentLevel);
    
    const costs = {};
    for (const [resource, baseCost] of Object.entries(baseCosts)) {
        // Runde die Kosten auf ganze Zahlen
        costs[resource] = Math.floor(baseCost * costMultiplier);
    }
    return costs;
}

// Berechne die Verbesserungskosten für ein Gebäude
function getBuildingUpgradeCosts(buildingType) {
    const baseCosts = baseBuildingUpgradeCosts[buildingType];
    const level = gameState.buildingUpgrades[buildingType];
    const costMultiplier = Math.pow(1.5, level); // 50% Erhöhung pro Level
    
    const costs = {};
    for (const [resource, cost] of Object.entries(baseCosts)) {
        costs[resource] = Math.floor(cost * costMultiplier);
    }
    return costs;
}

// Berechne die Lagerkapazität basierend auf dem Level
function calculateWarehouseCapacity(level) {
    return Math.floor(1000 * Math.pow(1.5, level - 1));
}

// Berechne die Upgrade-Kosten für das Lagerhaus
function calculateUpgradeCosts(buildingType) {
    if (buildingType === 'warehouse') {
        const level = gameState.warehouse.level;
        return {
            wood: Math.floor(200 * Math.pow(1.5, level - 1)),
            clay: Math.floor(250 * Math.pow(1.5, level - 1)),
            iron: Math.floor(100 * Math.pow(1.5, level - 1)),
            crop: Math.floor(50 * Math.pow(1.5, level - 1))
        };
    }
    return {};
}

// Berechne die Armeekapazität basierend auf dem Festungslevel
function calculateArmyCapacity(level) {
    return Math.floor(15 * Math.pow(1.5, level - 1));
}

// Berechne die Upgrade-Kosten für die Festung
function calculateFortressUpgradeCosts() {
    const level = gameState.fortress.level;
    return {
        wood: Math.floor(300 * Math.pow(1.5, level - 1)),
        clay: Math.floor(400 * Math.pow(1.5, level - 1)),
        iron: Math.floor(200 * Math.pow(1.5, level - 1)),
        crop: Math.floor(100 * Math.pow(1.5, level - 1))
    };
}

// Zeige einen bestimmten Abschnitt an
function showSection(sectionId) {
    // Verstecke alle Abschnitte
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Zeige den gewählten Abschnitt
    document.getElementById(sectionId).classList.add('active');
    
    // Aktualisiere die Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// Aktualisiere die Anzeige der Ressourcen
function updateResourceDisplay() {
    const capacity = calculateWarehouseCapacity(gameState.warehouse.level);
    gameState.warehouse.capacity = capacity;
    
    // Begrenze Ressourcen auf Lagerkapazität
    for (const resource of ['wood', 'clay', 'iron', 'crop']) {
        if (gameState[resource] > capacity) {
            gameState[resource] = capacity;
        }
        const element = document.getElementById(resource);
        if (element) {
            element.textContent = Math.floor(gameState[resource]);
            // Füge die rote Farbe hinzu, wenn das Limit erreicht ist
            if (Math.floor(gameState[resource]) >= capacity) {
                element.classList.add('resource-full');
            } else {
                element.classList.remove('resource-full');
            }
        }
    }
    
    // Aktualisiere Lagerhaus-Anzeige
    const warehouseLevelElement = document.getElementById('warehouse-level');
    const warehouseCapacityElement = document.getElementById('warehouse-capacity');
    if (warehouseLevelElement) {
        warehouseLevelElement.textContent = gameState.warehouse.level;
    }
    if (warehouseCapacityElement) {
        warehouseCapacityElement.textContent = capacity;
    }
    
    // Aktualisiere Upgrade-Buttons
    updateUpgradeButtons();
}

// Prüfe, ob genügend Ressourcen zum Bauen vorhanden sind
function canBuild(buildingType) {
    const costs = getBuildingCosts(buildingType);
    for (const [resource, cost] of Object.entries(costs)) {
        if (gameState[resource] < cost) {
            return false;
        }
    }
    return true;
}

// Baue ein Gebäude
function build(buildingType) {
    if (gameState.buildings[buildingType] >= MAX_BUILDING_LEVEL) {
        alert('Maximales Gebäudelevel erreicht!');
        return;
    }

    if (!canBuild(buildingType)) {
        alert('Nicht genügend Ressourcen!');
        return;
    }

    const costs = getBuildingCosts(buildingType);
    for (const [resource, cost] of Object.entries(costs)) {
        gameState[resource] -= cost;
    }

    gameState.buildings[buildingType]++;
    updateResourceDisplay();
    updateBuildingDisplay();
    saveGameState();
}

// Prüfe, ob Forschung möglich ist
function canResearch(researchType) {
    const costs = getResearchCosts(researchType);
    for (const [resource, cost] of Object.entries(costs)) {
        if (gameState[resource] < cost) {
            return false;
        }
    }
    return true;
}

// Erforsche eine neue Technologie
function research(researchType) {
    if (!canResearch(researchType)) {
        alert('Nicht genügend Ressourcen!');
        return;
    }

    const costs = getResearchCosts(researchType);
    for (const [resource, cost] of Object.entries(costs)) {
        gameState[resource] -= cost;
    }

    gameState.research[researchType]++;
    
    // Wende Forschungseffekte an
    if (baseUnitResearchCosts[researchType]) {
        applyUnitResearchEffects(researchType);
    }
    
    updateResourceDisplay();
    updateResearchDisplay();
    saveGameState();
}

// Wende Einheiten-Forschungseffekte an
function applyUnitResearchEffects(researchType) {
    switch(researchType) {
        case 'knight-armor':
            gameState.unitStats.spearman.defense += 5;
            break;
        case 'knight-weapons':
            gameState.unitStats.spearman.attack += 5;
            break;
        case 'archer-training':
            gameState.unitStats.archer.attack += 3;
            break;
        case 'archer-range':
            gameState.unitStats.archer.attack += 4;
            break;
        case 'cavalry-training':
            gameState.unitStats.cavalry.attack += 4;
            break;
        case 'cavalry-armor':
            gameState.unitStats.cavalry.defense += 4;
            break;
    }
    
    // Aktualisiere die Anzeige in der Kaserne und Forschung
    updateUnitDisplay();
    updateResearchDisplay();
    saveGameState();
}

// Aktualisiere die Anzeige der Gebäude
function updateBuildingDisplay() {
    const resourceNames = {
        wood: 'Holz',
        clay: 'Lehm',
        iron: 'Eisen',
        crop: 'Getreide'
    };

    for (const [building, count] of Object.entries(gameState.buildings)) {
        const buildingElement = document.querySelector(`[data-building="${building}"]`);
        if (buildingElement) {
            // Aktualisiere Level
            const levelSpan = document.getElementById(`${building}-level`);
            if (levelSpan) {
                levelSpan.textContent = `${count}/${MAX_BUILDING_LEVEL}`;
            }
            
            // Aktualisiere Baukosten-Button
            const buildButton = buildingElement.querySelector('.build-btn');
            if (buildButton) {
                const costs = getBuildingCosts(building);
                const costText = Object.entries(costs)
                    .map(([r, c]) => `${c} ${resourceNames[r]}`)
                    .join(', ');
                buildButton.textContent = `Bauen (${costText})`;
                buildButton.disabled = !canBuild(building) || count >= MAX_BUILDING_LEVEL;
            }
            
            // Aktualisiere Verbesserungs-Button
            const upgradeButton = buildingElement.querySelector('.upgrade-btn');
            if (upgradeButton) {
                const costs = getBuildingUpgradeCosts(building);
                const costText = Object.entries(costs)
                    .map(([r, c]) => `${c} ${resourceNames[r]}`)
                    .join(', ');
                const upgradeLevel = gameState.buildingUpgrades[building];
                const currentBonus = upgradeLevel * BASE_UPGRADE_BONUS * 100;
                const nextBonus = (upgradeLevel + 1) * BASE_UPGRADE_BONUS * 100;
                upgradeButton.textContent = `Verbessern (${currentBonus}% → ${nextBonus}%) (${upgradeLevel}/${MAX_BUILDING_UPGRADE_LEVEL}) (${costText})`;
                upgradeButton.disabled = !canUpgradeBuilding(building) || upgradeLevel >= MAX_BUILDING_UPGRADE_LEVEL;
            }
        }
    }
}

// Aktualisiere die Anzeige der Forschung
function updateResearchDisplay() {
    const resourceNames = {
        wood: 'Holz',
        clay: 'Lehm',
        iron: 'Eisen',
        crop: 'Getreide'
    };

    for (const [research, level] of Object.entries(gameState.research)) {
        const researchElement = document.querySelector(`[data-research="${research}"]`);
        if (researchElement) {
            const levelSpan = researchElement.querySelector('.level');
            const button = researchElement.querySelector('button');
            const costs = getResearchCosts(research);
            
            if (levelSpan) {
                levelSpan.textContent = level;
            }
            
            // Aktualisiere Produktionsbonus für Ressourcen
            if (research.includes('_production')) {
                const resource = research.split('_')[0];
                const bonusSpan = researchElement.querySelector(`[data-resource="${resource}"]`);
                if (bonusSpan) {
                    const bonus = ((level - 1) * 20); // 20% pro Level
                    bonusSpan.textContent = bonus;
                }
            }
            
            // Aktualisiere Einheitenwerte
            if (research.startsWith('knight-')) {
                const statSpan = researchElement.querySelector('[data-unit="spearman"]');
                if (statSpan) {
                    const stat = statSpan.getAttribute('data-stat');
                    statSpan.textContent = gameState.unitStats.spearman[stat];
                }
            } else if (research.startsWith('archer-')) {
                const statSpan = researchElement.querySelector('[data-unit="archer"]');
                if (statSpan) {
                    const stat = statSpan.getAttribute('data-stat');
                    statSpan.textContent = gameState.unitStats.archer[stat];
                }
            } else if (research.startsWith('cavalry-')) {
                const statSpan = researchElement.querySelector('[data-unit="cavalry"]');
                if (statSpan) {
                    const stat = statSpan.getAttribute('data-stat');
                    statSpan.textContent = gameState.unitStats.cavalry[stat];
                }
            }
            
            if (button && Object.keys(costs).length > 0) {
                const costText = Object.entries(costs)
                    .map(([r, c]) => `${c} ${resourceNames[r]}`)
                    .join(', ');
                button.textContent = `Erforschen (${costText})`;
                button.disabled = !canResearch(research);
            }
        }
    }
}

// Aktualisiere die Anzeige der Einheiten
function updateUnitDisplay() {
    const resourceNames = {
        wood: 'Holz',
        clay: 'Lehm',
        iron: 'Eisen',
        crop: 'Getreide'
    };

    // Aktualisiere Einheitenzähler
    document.getElementById('spearman-count').textContent = gameState.units.spearman;
    document.getElementById('archer-count').textContent = gameState.units.archer;
    document.getElementById('cavalry-count').textContent = gameState.units.cavalry;

    // Berechne und aktualisiere Armeestärke
    updateArmyStats();

    // Aktualisiere die Einheiten in der Kaserne
    for (const [unit, count] of Object.entries(gameState.units)) {
        const unitElement = document.querySelector(`[data-unit="${unit}"]`);
        if (unitElement) {
            // Aktualisiere den Einheitenzähler
            const countSpan = document.getElementById(`${unit}-count`);
            if (countSpan) {
                countSpan.textContent = count;
            }
            
            // Aktualisiere die Einheitenstats
            const healthSpan = unitElement.querySelector('[data-stat="health"]');
            const attackSpan = unitElement.querySelector('[data-stat="attack"]');
            const defenseSpan = unitElement.querySelector('[data-stat="defense"]');
            
            const stats = gameState.unitStats[unit];
            if (healthSpan) healthSpan.textContent = stats.health;
            if (attackSpan) attackSpan.textContent = stats.attack;
            if (defenseSpan) defenseSpan.textContent = stats.defense;
            
            // Aktualisiere die Buttons
            const trainButton = unitElement.querySelector('.train-button');
            const upgradeButton = unitElement.querySelector('.upgrade-button');
            
            if (trainButton) {
                const costs = unitCosts[unit];
                const costText = Object.entries(costs)
                    .map(([r, c]) => `${c} ${resourceNames[r]}`)
                    .join(', ');
                trainButton.textContent = `Ausbilden (${costText})`;
                trainButton.disabled = !canTrainUnit(unit);
            }
            
            if (upgradeButton) {
                const currentLevel = stats.level || 0;
                const costs = getUpgradeCosts(unit);
                const costText = Object.entries(costs)
                    .map(([r, c]) => `${c} ${resourceNames[r]}`)
                    .join(', ');
                upgradeButton.textContent = `Verbessern Level ${currentLevel + 1} (+5 ❤️/⚔️/🛡️) (${costText})`;
                upgradeButton.disabled = !canUpgradeUnit(unit);
            }
        }
    }
}

// Berechne und aktualisiere die Armeestärke
function updateArmyStats() {
    let totalHealth = 0;
    let totalAttack = 0;
    let totalDefense = 0;

    // Berechne Gesamtstärke für jede Einheit
    for (const [unit, count] of Object.entries(gameState.units)) {
        const stats = gameState.unitStats[unit];
        totalHealth += stats.health * count;
        totalAttack += stats.attack * count;
        totalDefense += stats.defense * count;
    }

    // Aktualisiere die Anzeige
    document.getElementById('total-health').textContent = totalHealth;
    document.getElementById('total-attack').textContent = totalAttack;
    document.getElementById('total-defense').textContent = totalDefense;
}

// Formatiere die Spielzeit in Stunden:Minuten:Sekunden
function formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Aktualisiere die Spielzeitanzeige
function updatePlayTimeDisplay() {
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - gameState.gameStartTime) / 1000);
    const totalSeconds = gameState.totalPlayTime + elapsedSeconds;
    
    const timeDisplays = document.querySelectorAll('.play-time');
    timeDisplays.forEach(display => {
        display.textContent = formatPlayTime(totalSeconds);
    });
}

// Aktualisiere alle Anzeigen
function updateDisplay() {
    // Aktualisiere Ressourcenanzeigen
    updateResourceDisplay();
    
    // Aktualisiere Produktionsraten
    const woodRate = calculateProductionRate('wood');
    const clayRate = calculateProductionRate('clay');
    const ironRate = calculateProductionRate('iron');
    const cropRate = calculateProductionRate('crop');

    const woodRateElement = document.getElementById('wood-rate');
    const clayRateElement = document.getElementById('clay-rate');
    const ironRateElement = document.getElementById('iron-rate');
    const cropRateElement = document.getElementById('crop-rate');

    if (woodRateElement) woodRateElement.textContent = woodRate;
    if (clayRateElement) clayRateElement.textContent = clayRate;
    if (ironRateElement) ironRateElement.textContent = ironRate;
    if (cropRateElement) cropRateElement.textContent = cropRate;

    // Aktualisiere Gebäudelevel
    const woodcutterLevel = document.getElementById('woodcutter-level');
    const clayPitLevel = document.getElementById('clay_pit-level');
    const ironMineLevel = document.getElementById('iron_mine-level');
    const farmLevel = document.getElementById('farm-level');

    if (woodcutterLevel) woodcutterLevel.textContent = gameState.buildings.woodcutter;
    if (clayPitLevel) clayPitLevel.textContent = gameState.buildings.clay_pit;
    if (ironMineLevel) ironMineLevel.textContent = gameState.buildings.iron_mine;
    if (farmLevel) farmLevel.textContent = gameState.buildings.farm;

    // Aktualisiere Einheitenzähler
    const spearmanCount = document.getElementById('spearman-count');
    const archerCount = document.getElementById('archer-count');
    const cavalryCount = document.getElementById('cavalry-count');

    if (spearmanCount) spearmanCount.textContent = gameState.units.spearman;
    if (archerCount) archerCount.textContent = gameState.units.archer;
    if (cavalryCount) cavalryCount.textContent = gameState.units.cavalry;

    // Aktualisiere Festungsanzeige
    const fortressLevelElement = document.getElementById('fortress-level');
    const fortressCapacityElement = document.getElementById('fortress-capacity');
    if (fortressLevelElement) {
        fortressLevelElement.textContent = gameState.fortress.level;
    }
    if (fortressCapacityElement) {
        fortressCapacityElement.textContent = calculateArmyCapacity(gameState.fortress.level);
    }

    // Aktualisiere andere Anzeigen
    updateBuildingDisplay();
    updateResearchDisplay();
    updateUnitDisplay();
    updatePlayTimeDisplay();
    updateUpgradeButtons();
}

// Berechne die Produktionsrate
function calculateProductionRate(resource) {
    const baseRate = 100; // Basisrate: 100 pro 30 Sekunden
    let buildingLevel = 0;
    let buildingType = '';
    
    // Korrekte Zuordnung der Gebäudetypen zu Ressourcen
    switch(resource) {
        case 'wood':
            buildingType = 'woodcutter';
            buildingLevel = Math.min(gameState.buildings[buildingType], MAX_BUILDING_LEVEL);
            break;
        case 'clay':
            buildingType = 'clay_pit';
            buildingLevel = Math.min(gameState.buildings[buildingType], MAX_BUILDING_LEVEL);
            break;
        case 'iron':
            buildingType = 'iron_mine';
            buildingLevel = Math.min(gameState.buildings[buildingType], MAX_BUILDING_LEVEL);
            break;
        case 'crop':
            buildingType = 'farm';
            buildingLevel = Math.min(gameState.buildings[buildingType], MAX_BUILDING_LEVEL);
            break;
    }
    
    // Forschungsbonus berechnen (20% pro Level, beginnend bei Level 1)
    const researchLevel = gameState.research[resource + '_production'];
    const researchBonus = (researchLevel - 1) * 0.2;
    
    // Verbesserungsbonus berechnen (5% bis 25%)
    const upgradeLevel = Math.min(gameState.buildingUpgrades[buildingType], MAX_BUILDING_UPGRADE_LEVEL);
    const upgradeBonus = upgradeLevel * BASE_UPGRADE_BONUS;
    
    // Berechne die Produktionsrate pro 30 Sekunden
    const levelMultiplier = buildingLevel * 1.0; // 100% Erhöhung pro Level
    const rate = Math.floor(baseRate * (1 + levelMultiplier) * (1 + researchBonus + upgradeBonus));
    return rate;
}

// Produziere Ressourcen basierend auf Gebäuden und Forschung
function produceResources() {
    const capacity = calculateWarehouseCapacity(gameState.warehouse.level);
    
    for (const resource of ['wood', 'clay', 'iron', 'crop']) {
        const production = calculateProductionRate(resource);
        // Füge nur Ressourcen hinzu, wenn noch Platz im Lager ist
        if (gameState[resource] < capacity) {
            gameState[resource] = Math.min(
                capacity,
                gameState[resource] + (production / 60)
            );
        }
    }
    
    updateResourceDisplay();
    updateUpgradeButtons();
    saveGameState();
}

// Generiere die Karte
function generateMap() {
    const mapGrid = document.querySelector('.map-grid');
    if (!mapGrid) return; // Beende wenn keine Karte vorhanden ist
    
    mapGrid.innerHTML = '';
    
    for (let i = 0; i < gameState.map.size * gameState.map.size; i++) {
        const tile = document.createElement('div');
        tile.className = 'map-tile';
        
        // Zufällige Kacheltypen (für Demo-Zwecke)
        const random = Math.random();
        if (random < 0.1) {
            tile.classList.add('enemy');
            tile.textContent = '👤';
        } else if (random < 0.2) {
            tile.classList.add('owned');
            tile.textContent = '🏰';
        } else {
            tile.classList.add('neutral');
            tile.textContent = '🌲';
        }
        
        mapGrid.appendChild(tile);
    }
}

// Kartensteuerung
function zoomIn() {
    gameState.map.size = Math.min(gameState.map.size + 1, 10);
    generateMap();
}

function zoomOut() {
    gameState.map.size = Math.max(gameState.map.size - 1, 3);
    generateMap();
}

function centerMap() {
    // Implementierung der Kartenzentrierung
    console.log('Karte zentriert');
}

// Prüfe, ob genügend Ressourcen für eine Einheit vorhanden sind
function canTrainUnit(unitType) {
    const costs = unitCosts[unitType];
    // Prüfe Ressourcen
    for (const [resource, cost] of Object.entries(costs)) {
        if (gameState[resource] < cost) {
            return false;
        }
    }
    
    // Prüfe Armeekapazität
    const currentArmySize = gameState.units.spearman + gameState.units.archer + gameState.units.cavalry;
    const maxCapacity = calculateArmyCapacity(gameState.fortress.level);
    
    return currentArmySize < maxCapacity;
}

// Trainiere eine neue Einheit
function trainUnit(unitType) {
    const currentArmySize = gameState.units.spearman + gameState.units.archer + gameState.units.cavalry;
    const maxCapacity = calculateArmyCapacity(gameState.fortress.level);
    
    if (currentArmySize >= maxCapacity) {
        alert('Maximale Armeekapazität erreicht! Verbessere deine Festung für mehr Einheiten.');
        return;
    }

    if (!canTrainUnit(unitType)) {
        alert('Nicht genügend Ressourcen oder Armeekapazität erreicht!');
        return;
    }

    const costs = unitCosts[unitType];
    for (const [resource, cost] of Object.entries(costs)) {
        gameState[resource] -= cost;
    }

    gameState.units[unitType]++;
    updateResourceDisplay();
    updateUnitDisplay();
    saveGameState();
}

// Prüfe, ob eine Einheit verbessert werden kann
function canUpgradeUnit(unitType) {
    const costs = getUpgradeCosts(unitType);
    return Object.entries(costs).every(([resource, cost]) => gameState[resource] >= cost);
}

// Verbessere eine Einheit
function upgradeUnit(unitType) {
    const costs = getUpgradeCosts(unitType);
    
    // Prüfe, ob genügend Ressourcen vorhanden sind
    for (const [resource, cost] of Object.entries(costs)) {
        if (gameState[resource] < cost) {
            alert('Nicht genügend Ressourcen!');
            return;
        }
    }
    
    // Ziehe Ressourcen ab
    for (const [resource, cost] of Object.entries(costs)) {
        gameState[resource] -= cost;
    }
    
    // Verbessere die Einheitenstats
    gameState.unitStats[unitType].health += 5;
    gameState.unitStats[unitType].attack += 5;
    gameState.unitStats[unitType].defense += 5;
    gameState.unitStats[unitType].level += 1;
    
    // Aktualisiere die Anzeige
    updateResourceDisplay();
    updateUnitDisplay();
    saveGameState();
    
    // Zeige die verbesserten Werte visuell an
    const unitElement = document.querySelector(`[data-unit="${unitType}"]`);
    if (unitElement) {
        const statElements = unitElement.querySelectorAll('[data-stat]');
        statElements.forEach(element => {
            element.classList.add('improved');
            setTimeout(() => element.classList.remove('improved'), 1000);
        });
    }
}

// Prüfe, ob genügend Ressourcen für eine Verbesserung vorhanden sind
function canUpgradeBuilding(buildingType) {
    const costs = getBuildingUpgradeCosts(buildingType);
    for (const [resource, cost] of Object.entries(costs)) {
        if (gameState[resource] < cost) {
            return false;
        }
    }
    return true;
}

// Verbessere ein Gebäude
function upgradeBuilding(buildingType) {
    if (buildingType === 'warehouse') {
        const costs = calculateUpgradeCosts('warehouse');
        // Prüfe, ob genügend Ressourcen vorhanden sind
        for (const [resource, cost] of Object.entries(costs)) {
            if (gameState[resource] < cost) {
                alert('Nicht genügend Ressourcen!');
                return;
            }
        }
        // Ziehe Ressourcen ab
        for (const [resource, cost] of Object.entries(costs)) {
            gameState[resource] -= cost;
        }
        // Erhöhe Level
        gameState.warehouse.level++;
        gameState.warehouse.capacity = calculateWarehouseCapacity(gameState.warehouse.level);
        updateDisplay();
        saveGameState();
        return;
    }
    
    if (buildingType === 'fortress') {
        const costs = calculateFortressUpgradeCosts();
        // Prüfe, ob genügend Ressourcen vorhanden sind
        for (const [resource, cost] of Object.entries(costs)) {
            if (gameState[resource] < cost) {
                alert('Nicht genügend Ressourcen!');
                return;
            }
        }
        // Ziehe Ressourcen ab
        for (const [resource, cost] of Object.entries(costs)) {
            gameState[resource] -= cost;
        }
        // Erhöhe Level
        gameState.fortress.level++;
        gameState.fortress.capacity = calculateArmyCapacity(gameState.fortress.level);
        updateDisplay();
        saveGameState();
        return;
    }
    
    // Bestehende Logik für andere Gebäude
    if (gameState.buildingUpgrades[buildingType] >= MAX_BUILDING_UPGRADE_LEVEL) {
        alert('Maximales Verbesserungslevel erreicht (25%)!');
        return;
    }

    if (!canUpgradeBuilding(buildingType)) {
        alert('Nicht genügend Ressourcen!');
        return;
    }

    const costs = getBuildingUpgradeCosts(buildingType);
    for (const [resource, cost] of Object.entries(costs)) {
        gameState[resource] -= cost;
    }

    gameState.buildingUpgrades[buildingType]++;
    updateDisplay();
    saveGameState();
}

// Erweitere die updateUpgradeButtons Funktion
function updateUpgradeButtons() {
    // Ressourcennamen auf Deutsch
    const resourceNames = {
        wood: 'Holz',
        clay: 'Lehm',
        iron: 'Eisen',
        crop: 'Getreide'
    };

    // Lagerhaus-Upgrade-Button
    const warehouseCosts = calculateUpgradeCosts('warehouse');
    const warehouseBtn = document.getElementById('warehouse-upgrade');
    if (warehouseBtn) {
        const costText = Object.entries(warehouseCosts)
            .map(([resource, cost]) => `${cost} ${resourceNames[resource]}`)
            .join(', ');
        
        warehouseBtn.textContent = `Verbessern (${costText})`;
        
        const canUpgradeWarehouse = Object.entries(warehouseCosts)
            .every(([resource, cost]) => gameState[resource] >= cost);
        
        warehouseBtn.disabled = !canUpgradeWarehouse;
        if (canUpgradeWarehouse) {
            warehouseBtn.classList.remove('disabled');
        } else {
            warehouseBtn.classList.add('disabled');
        }
    }

    // Festung-Upgrade-Button
    const fortressCosts = calculateFortressUpgradeCosts();
    const fortressBtn = document.getElementById('fortress-upgrade');
    if (fortressBtn) {
        const costText = Object.entries(fortressCosts)
            .map(([resource, cost]) => `${cost} ${resourceNames[resource]}`)
            .join(', ');
        
        const currentCapacity = calculateArmyCapacity(gameState.fortress.level);
        const nextCapacity = calculateArmyCapacity(gameState.fortress.level + 1);
        
        fortressBtn.textContent = `Verbessern (${currentCapacity} → ${nextCapacity} Einheiten) (${costText})`;
        
        const canUpgradeFortress = Object.entries(fortressCosts)
            .every(([resource, cost]) => gameState[resource] >= cost);
        
        fortressBtn.disabled = !canUpgradeFortress;
        if (canUpgradeFortress) {
            fortressBtn.classList.remove('disabled');
        } else {
            fortressBtn.classList.add('disabled');
        }
    }
}

// Initialisiere das Spiel
function initGame() {
    const loaded = loadGameState();
    if (!loaded) {
        // Setze Standardwerte
        gameState.wood = 100;
        gameState.clay = 100;
        gameState.iron = 100;
        gameState.crop = 100;
        gameState.warehouse = {
            level: 1,
            capacity: 1000
        };
        gameState.buildings = {
            woodcutter: 0,
            clay_pit: 0,
            iron_mine: 0,
            farm: 0
        };
        gameState.research = {
            wood_production: 1,
            clay_production: 1,
            iron_production: 1,
            crop_production: 1
        };
        gameState.units = {
            spearman: 0,
            archer: 0,
            cavalry: 0
        };
        gameState.unitStats = JSON.parse(JSON.stringify(baseUnitStats));
        gameState.gameStartTime = Date.now();
        gameState.totalPlayTime = 0;
        gameState.map.size = 5;
        gameState.map.tiles = [];
        gameState.buildingUpgrades = {
            woodcutter: 0,
            clay_pit: 0,
            iron_mine: 0,
            farm: 0
        };
        gameState.fortress = {
            level: 1,
            capacity: 15
        };
    }
    
    // Aktualisiere alle Anzeigen
    updateDisplay();
    generateMap();
    
    // Stoppe vorhandene Intervalle
    if (window.productionInterval) {
        clearInterval(window.productionInterval);
    }
    if (window.timeInterval) {
        clearInterval(window.timeInterval);
    }
    if (window.buttonInterval) {
        clearInterval(window.buttonInterval);
    }
    
    // Starte die Intervalle
    window.productionInterval = setInterval(produceResources, 1000);
    window.timeInterval = setInterval(updatePlayTimeDisplay, 1000);
    window.buttonInterval = setInterval(() => {
        updateUpgradeButtons();
        updateBuildingDisplay();
    }, 3000);
}

// Reset-Funktion
function resetGame() {
    if (confirm('Möchten Sie wirklich ein neues Spiel starten? Alle Fortschritte werden gelöscht!')) {
        // Lösche den localStorage
        localStorage.removeItem('gameState');
        
        // Setze den Spielzustand zurück
        gameState.wood = 100;
        gameState.clay = 100;
        gameState.iron = 100;
        gameState.crop = 100;
        gameState.buildings = {
            woodcutter: 0,
            clay_pit: 0,
            iron_mine: 0,
            farm: 0
        };
        gameState.research = {
            wood_production: 1,
            clay_production: 1,
            iron_production: 1,
            crop_production: 1
        };
        gameState.units = {
            spearman: 0,
            archer: 0,
            cavalry: 0
        };
        gameState.unitStats = JSON.parse(JSON.stringify(baseUnitStats));
        gameState.gameStartTime = Date.now();
        gameState.totalPlayTime = 0;
        gameState.map = {
            size: 5,
            tiles: []
        };
        gameState.buildingUpgrades = {
            woodcutter: 0,
            clay_pit: 0,
            iron_mine: 0,
            farm: 0
        };
        gameState.fortress = {
            level: 1,
            capacity: 15
        };
        
        // Speichere den zurückgesetzten Zustand
        saveGameState();
        
        // Aktualisiere alle Anzeigen
        updateDisplay();
        generateMap();
        
        alert('Spiel wurde zurückgesetzt!');
    }
}

// Initialisiere das Spiel beim Laden
document.addEventListener('DOMContentLoaded', initGame); 