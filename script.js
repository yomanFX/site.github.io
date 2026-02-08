// Game state
let gameState = {
    day: 1,
    money: 2500,
    prestige: 0,
    speed: 1,
    dogs: [],
    marketLastUpdate: 1,
    marketListings: []
};

// Dog breeds with base prices
const BREEDS = [
    { name: "French Bulldog", basePrice: 800 },
    { name: "Labrador", basePrice: 600 },
    { name: "Australian Shepherd", basePrice: 900 },
    { name: "German Shepherd", basePrice: 1000 },
    { name: "Poodle", basePrice: 1200 }
];

// Defect types with inheritance patterns
const DEFECT_TYPES = [
    { name: "Hip Dysplasia", inheritance: "recessive", transmissionChance: 0.5, expressionChance: 0.25 },
    { name: "Crooked Teeth", inheritance: "dominant", transmissionChance: 0.75, expressionChance: 0.75 },
    { name: "Corneal Spot", inheritance: "recessive", transmissionChance: 0.5, expressionChance: 0.25 },
    { name: "Skin Allergy", inheritance: "polygenic", transmissionChance: 0.4, expressionChance: 0.15 },
    { name: "Breathing Problems", inheritance: "recessive", transmissionChance: 0.5, expressionChance: 0.25 }
];

// Initialize game
function initGame() {
    // Create starting dogs
    gameState.dogs.push(createDog({
        breed: BREEDS[Math.floor(Math.random() * BREEDS.length)].name,
        gender: "male",
        age: 548, // ~1.5 years in days
        conformation: Math.floor(Math.random() * 21) + 40, // 40-60
        coat: Math.floor(Math.random() * 21) + 40,
        temperament: Math.floor(Math.random() * 21) + 40,
        stamina: Math.floor(Math.random() * 21) + 40,
        satiety: 100,
        happiness: 100,
        health: 100
    }));

    gameState.dogs.push(createDog({
        breed: BREEDS[Math.floor(Math.random() * BREEDS.length)].name,
        gender: "female",
        age: 548, // ~1.5 years in days
        conformation: Math.floor(Math.random() * 21) + 40,
        coat: Math.floor(Math.random() * 21) + 40,
        temperament: Math.floor(Math.random() * 21) + 40,
        stamina: Math.floor(Math.random() * 21) + 40,
        satiety: 100,
        happiness: 100,
        health: 100
    }));

    // Generate initial market listings
    generateMarketListings();

    updateUI();
    setupEventListeners();
    
    // Start game loop
    setInterval(gameLoop, 60000 / gameState.speed); // Each game day is 1 real minute divided by speed
}

// Create a new dog with random stats
function createDog(customProps = {}) {
    const defaultDog = {
        id: Date.now() + Math.random(),
        name: generateDogName(),
        breed: BREEDS[Math.floor(Math.random() * BREEDS.length)].name,
        gender: Math.random() > 0.5 ? "male" : "female",
        age: 0, // in days
        conformation: Math.floor(Math.random() * 41) + 30, // 30-70
        coat: Math.floor(Math.random() * 41) + 30,
        temperament: Math.floor(Math.random() * 41) + 30,
        stamina: Math.floor(Math.random() * 41) + 30,
        satiety: 100,
        happiness: 100,
        health: 100,
        defects: [], // Array of defect objects
        lastFed: 0, // Days since last fed
        lastWalked: 0, // Days since last walked
        lastBred: 0, // Days since last breeding (for females)
        geneticRating: 0
    };

    return { ...defaultDog, ...customProps };
}

// Generate a random dog name
function generateDogName() {
    const prefixes = ["Max", "Bella", "Charlie", "Lucy", "Cooper", "Luna", "Buddy", "Daisy", "Rocky", "Zoe"];
    const suffixes = ["II", "III", "Jr", "Sr", "Alpha", "Beta", "Champion", "Star", "Ace", ""];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return suffix ? `${prefix} ${suffix}` : prefix;
}

// Generate market listings
function generateMarketListings() {
    gameState.marketListings = [];
    for (let i = 0; i < 5; i++) {
        const dog = createDog({
            breed: BREEDS[Math.floor(Math.random() * BREEDS.length)].name,
            age: Math.floor(Math.random() * 365 * 8), // Up to 8 years old
            gender: Math.random() > 0.5 ? "male" : "female"
        });
        
        // Adjust price based on genetics
        dog.geneticRating = calculateGeneticRating(dog);
        dog.price = calculateDogPrice(dog);
        
        gameState.marketListings.push(dog);
    }
    gameState.marketLastUpdate = gameState.day;
}

// Calculate genetic rating
function calculateGeneticRating(dog) {
    return Math.round((dog.conformation + dog.coat + dog.temperament + dog.stamina) / 4);
}

// Calculate dog price
function calculateDogPrice(dog) {
    const breedBase = BREEDS.find(b => b.name === dog.breed)?.basePrice || 600;
    const geneticMultiplier = 1 + (calculateGeneticRating(dog) / 100);
    
    // Color rarity multiplier
    let colorMultiplier = 1.0;
    if (dog.breed === "Australian Shepherd" && Math.random() < 0.1) {
        colorMultiplier = 1.8; // Merle pattern
    } else if (Math.random() < 0.01) {
        colorMultiplier = 3.0; // Albino mutation
    }
    
    let price = breedBase * geneticMultiplier * colorMultiplier;
    return Math.min(price, 10000); // Cap at $10,000 to prevent inflation
}

// Game loop - runs every game day
function gameLoop() {
    gameState.day++;
    
    // Age all dogs
    gameState.dogs.forEach(dog => {
        dog.age++;
        dog.lastFed++;
        dog.lastWalked++;
    });
    
    // Apply daily effects
    gameState.dogs.forEach(dog => {
        // Decrease stats if not properly cared for
        if (dog.lastFed >= 3) {
            dog.health -= 2;
        }
        
        if (dog.lastWalked >= 5) {
            dog.happiness = 0;
        }
        
        // Ensure values don't go below 0
        dog.satiety = Math.max(0, dog.satiety);
        dog.happiness = Math.max(0, dog.happiness);
        dog.health = Math.max(0, dog.health);
    });
    
    // Remove dead dogs (health <= 0)
    gameState.dogs = gameState.dogs.filter(dog => dog.health > 0);
    
    // Update UI
    updateUI();
}

// Update UI elements
function updateUI() {
    document.getElementById('day-counter').textContent = gameState.day;
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('prestige').textContent = gameState.prestige;
    document.getElementById('speed-btn').textContent = `Speed: x${gameState.speed}`;
    document.getElementById('market-last-update').textContent = gameState.marketLastUpdate;
    
    renderDogs();
    renderMarket();
}

// Render dogs in kennel
function renderDogs() {
    const container = document.getElementById('dogs-container');
    container.innerHTML = '';
    
    gameState.dogs.forEach(dog => {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';
        dogCard.innerHTML = `
            <h3>${dog.name} (${dog.gender}) - ${dog.breed}, ${Math.floor(dog.age/365)} years</h3>
            <p>Genetic Rating: ${calculateGeneticRating(dog)}</p>
            
            <div class="dog-stats">
                <div class="satiety">
                    <p>Satiety: ${dog.satiety}</p>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${dog.satiety}%"></div>
                    </div>
                </div>
                <div class="happiness">
                    <p>Happiness: ${dog.happiness}</p>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${dog.happiness}%"></div>
                    </div>
                </div>
                <div class="health">
                    <p>Health: ${dog.health}</p>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${dog.health}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="defects">
                ${renderDefects(dog)}
            </div>
        `;
        
        dogCard.addEventListener('click', () => showDogDetails(dog));
        container.appendChild(dogCard);
    });
}

// Render defects for a dog
function renderDefects(dog) {
    let html = '';
    
    // Check if dog is healthy
    const expressedDefects = dog.defects.filter(d => d.expressed);
    const carrierDefects = dog.defects.filter(d => !d.expressed && d.carrier);
    
    if (exposedDefects.length === 0 && carrierDefects.length === 0) {
        html += '<div class="defect-item defect-healthy">✅ Healthy</div>';
    }
    
    if (carrierDefects.length > 0) {
        html += `<div class="defect-item defect-carrier">⚠️ Carrier: ${carrierDefects.map(d => d.name).join(', ')}</div>`;
    }
    
    if (exposedDefects.length > 0) {
        html += `<div class="defect-item defect-expressed">❌ Expressed: ${exposedDefects.map(d => d.name).join(', ')}</div>`;
    }
    
    return html;
}

// Show dog details in modal
function showDogDetails(dog) {
    const modal = document.getElementById('dog-modal');
    const details = document.getElementById('dog-details');
    
    details.innerHTML = `
        <h2>${dog.name} - ${dog.breed}</h2>
        <p><strong>Gender:</strong> ${dog.gender}</p>
        <p><strong>Age:</strong> ${Math.floor(dog.age/365)} years, ${dog.age % 365} days</p>
        
        <h3>Vital Stats</h3>
        <p><strong>Satiety:</strong> ${dog.satiety}/100</p>
        <p><strong>Happiness:</strong> ${dog.happiness}/100</p>
        <p><strong>Health:</strong> ${dog.health}/100</p>
        
        <h3>Genetic Attributes</h3>
        <p><strong>Conformation:</strong> ${dog.conformation}</p>
        <p><strong>Coat Quality:</strong> ${dog.coat}</p>
        <p><strong>Temperament:</strong> ${dog.temperament}</p>
        <p><strong>Stamina:</strong> ${dog.stamina}</p>
        
        <h3>Defects</h3>
        ${renderDefects(dog)}
        
        <div class="dog-actions">
            <button onclick="feedDog(${dog.id}, 'standard')">Feed Standard ($10)</button>
            <button onclick="feedDog(${dog.id}, 'premium')">Feed Premium ($25)</button>
            <button onclick="walkDog(${dog.id})">Walk (Free)</button>
            <button onclick="treatDefect(${dog.id})">Treat Defect ($50-$200)</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Feed a dog
function feedDog(dogId, type) {
    const dog = gameState.dogs.find(d => d.id === dogId);
    if (!dog) return;
    
    const cost = type === 'standard' ? 10 : 25;
    if (gameState.money < cost) return;
    
    gameState.money -= cost;
    dog.satiety = Math.min(100, dog.satiety + (type === 'standard' ? 5 : 10));
    dog.health = Math.min(100, dog.health + (type === 'standard' ? 1 : 3));
    dog.lastFed = 0;
    
    if (type === 'premium') {
        // Premium food gives temporary beauty boost
        dog.beautyBoost = 5; // Will apply to next show
        setTimeout(() => { delete dog.beautyBoost; }, 300000); // 5 minutes
    }
    
    updateUI();
    closeModals();
}

// Walk a dog
function walkDog(dogId) {
    const dog = gameState.dogs.find(d => d.id === dogId);
    if (!dog) return;
    
    dog.happiness = Math.min(100, dog.happiness + 10);
    dog.lastWalked = 0;
    
    updateUI();
    closeModals();
}

// Treat defect
function treatDefect(dogId) {
    const dog = gameState.dogs.find(d => d.id === dogId);
    if (!dog) return;
    
    const cost = Math.floor(Math.random() * 151) + 50; // $50-$200
    if (gameState.money < cost) return;
    
    gameState.money -= cost;
    
    // Hide symptoms of defects for 3-7 days
    dog.defectTreatmentDays = Math.floor(Math.random() * 5) + 3;
    
    updateUI();
    closeModals();
}

// Close all modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Render market listings
function renderMarket() {
    const container = document.getElementById('market-listings');
    container.innerHTML = '';
    
    gameState.marketListings.forEach(dog => {
        const listing = document.createElement('div');
        listing.className = 'market-listing';
        listing.innerHTML = `
            <h3>${dog.name} - ${dog.breed}</h3>
            <p>Gender: ${dog.gender}, Age: ${Math.floor(dog.age/365)} years</p>
            <p>Genetic Rating: ${calculateGeneticRating(dog)}, Price: $${Math.round(dog.price)}</p>
            <p>Conformation: ${dog.conformation}, Coat: ${dog.coat}</p>
            <div class="defects">
                ${renderDefects(dog)}
            </div>
            <button onclick="buyDog(${dog.id})">Buy for $${Math.round(dog.price)}</button>
        `;
        container.appendChild(listing);
    });
}

// Buy a dog from market
function buyDog(dogId) {
    const index = gameState.marketListings.findIndex(d => d.id === dogId);
    if (index === -1) return;
    
    const dog = gameState.marketListings[index];
    if (gameState.money < dog.price) return;
    
    gameState.money -= Math.round(dog.price);
    gameState.dogs.push(dog);
    gameState.marketListings.splice(index, 1);
    
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('kennel-btn').addEventListener('click', () => switchScreen('kennel'));
    document.getElementById('breeding-btn').addEventListener('click', () => switchScreen('breeding'));
    document.getElementById('show-btn').addEventListener('click', () => switchScreen('show'));
    document.getElementById('market-btn').addEventListener('click', () => switchScreen('market'));
    
    // Speed button
    document.getElementById('speed-btn').addEventListener('click', toggleSpeed);
    
    // Daily action buttons
    document.getElementById('feed-standard').addEventListener('click', performBulkAction.bind(null, 'feed-standard'));
    document.getElementById('feed-premium').addEventListener('click', performBulkAction.bind(null, 'feed-premium'));
    document.getElementById('walk').addEventListener('click', performBulkAction.bind(null, 'walk'));
    document.getElementById('treat-defect').addEventListener('click', performBulkAction.bind(null, 'treat-defect'));
    
    // Breeding buttons
    document.getElementById('breed-btn').addEventListener('click', startBreeding);
    
    // Show ring buttons
    document.getElementById('enter-show-btn').addEventListener('click', enterShow);
    document.getElementById('skill-click-btn').addEventListener('click', recordSkillAttempt);
    document.getElementById('finish-show-btn').addEventListener('click', finishShow);
    
    // Market refresh
    document.getElementById('refresh-market').addEventListener('click', refreshMarket);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

// Switch between screens
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${screenName}-screen`).classList.add('active');
    document.getElementById(`${screenName}-btn`).classList.add('active');
    
    // Refresh data for certain screens
    if (screenName === 'breeding') {
        populateBreedingSelectors();
    } else if (screenName === 'show') {
        populateShowSelector();
    }
}

// Toggle game speed
function toggleSpeed() {
    const speeds = [1, 2, 5];
    const currentIndex = speeds.indexOf(gameState.speed);
    gameState.speed = speeds[(currentIndex + 1) % speeds.length];
    document.getElementById('speed-btn').textContent = `Speed: x${gameState.speed}`;
}

// Perform bulk action on all dogs
function performBulkAction(actionType) {
    gameState.dogs.forEach(dog => {
        switch(actionType) {
            case 'feed-standard':
                if (gameState.money >= 10) {
                    gameState.money -= 10;
                    dog.satiety = Math.min(100, dog.satiety + 5);
                    dog.health = Math.min(100, dog.health + 1);
                    dog.lastFed = 0;
                }
                break;
            case 'feed-premium':
                if (gameState.money >= 25) {
                    gameState.money -= 25;
                    dog.satiety = Math.min(100, dog.satiety + 10);
                    dog.health = Math.min(100, dog.health + 3);
                    dog.lastFed = 0;
                    dog.beautyBoost = 5;
                    setTimeout(() => { delete dog.beautyBoost; }, 300000);
                }
                break;
            case 'walk':
                dog.happiness = Math.min(100, dog.happiness + 10);
                dog.lastWalked = 0;
                break;
            case 'treat-defect':
                const cost = Math.floor(Math.random() * 151) + 50;
                if (gameState.money >= cost) {
                    gameState.money -= cost;
                    dog.defectTreatmentDays = Math.floor(Math.random() * 5) + 3;
                }
                break;
        }
    });
    updateUI();
}

// Populate breeding selectors
function populateBreedingSelectors() {
    const maleSelect = document.getElementById('male-select');
    const femaleSelect = document.getElementById('female-select');
    
    maleSelect.innerHTML = '';
    femaleSelect.innerHTML = '';
    
    gameState.dogs.forEach(dog => {
        // Only include mature dogs that haven't bred recently (for females)
        const isMature = dog.age >= 90; // 90 days = 1.5 years in game
        const isFemaleReady = dog.gender === 'female' && (dog.age >= 90) && (dog.lastBred >= 180 || dog.lastBred === undefined);
        
        if (dog.gender === 'male' && isMature) {
            const option = document.createElement('option');
            option.value = dog.id;
            option.textContent = `${dog.name} (${dog.breed}, Gen: ${calculateGeneticRating(dog)})`;
            maleSelect.appendChild(option);
        } else if (dog.gender === 'female' && isFemaleReady) {
            const option = document.createElement('option');
            option.value = dog.id;
            option.textContent = `${dog.name} (${dog.breed}, Gen: ${calculateGeneticRating(dog)})`;
            femaleSelect.appendChild(option);
        }
    });
}

// Start breeding process
function startBreeding() {
    const maleId = parseInt(document.getElementById('male-select').value);
    const femaleId = parseInt(document.getElementById('female-select').value);
    
    if (!maleId || !femaleId) {
        alert("Please select both a male and female dog.");
        return;
    }
    
    const male = gameState.dogs.find(d => d.id === maleId);
    const female = gameState.dogs.find(d => d.id === femaleId);
    
    if (!male || !female) {
        alert("Selected dogs not found.");
        return;
    }
    
    if (male.breed !== female.breed) {
        alert("Dogs must be of the same breed.");
        return;
    }
    
    // Create litter
    const litterSize = Math.floor(Math.random() * 6) + 1; // 1-6 puppies
    const litterContainer = document.getElementById('litter-container');
    litterContainer.innerHTML = `<h3>Litter (${litterSize} puppies)</h3>`;
    
    for (let i = 0; i < litterSize; i++) {
        const puppy = createPuppy(male, female);
        const puppyCard = document.createElement('div');
        puppyCard.className = 'puppy-card';
        puppyCard.innerHTML = `
            <h4>${puppy.name} - ${puppy.breed}</h4>
            <p>Genetic Rating: ${calculateGeneticRating(puppy)}</p>
            <p>Conformation: ${puppy.conformation}, Coat: ${puppy.coat}</p>
            <div class="defects">${renderDefects(puppy)}</div>
            <button onclick="addPuppyToKennel(${puppy.id})">Add to Kennel ($100)</button>
        `;
        litterContainer.appendChild(puppyCard);
    }
    
    // Update last bred for female
    female.lastBred = 0;
}

// Create a puppy from two parents
function createPuppy(male, female) {
    const puppy = createDog({
        breed: male.breed,
        gender: Math.random() > 0.5 ? "male" : "female",
        age: 0,
        // Genetic attributes based on parents + mutation
        conformation: inheritAttribute(male.conformation, female.conformation),
        coat: inheritAttribute(male.coat, female.coat),
        temperament: inheritAttribute(male.temperament, female.temperament),
        stamina: inheritAttribute(male.stamina, female.stamina),
        // Inherit defects
        defects: inheritDefects(male, female)
    });
    
    return puppy;
}

// Inherit attribute from parents with possible mutation
function inheritAttribute(maleVal, femaleVal) {
    let baseValue = (maleVal + femaleVal) / 2;
    baseValue += Math.floor(Math.random() * 11) - 5; // Random variation (-5 to +5)
    
    // 5% chance of mutation (+10 or -10)
    if (Math.random() < 0.05) {
        baseValue += Math.random() > 0.5 ? 10 : -10;
    }
    
    return Math.max(0, Math.min(100, Math.round(baseValue)));
}

// Inherit defects from parents
function inheritDefects(male, female) {
    const inheritedDefects = [];
    
    DEFECT_TYPES.forEach(defectType => {
        // Check if either parent carries or expresses the defect
        const maleCarries = male.defects.some(d => d.name === defectType.name);
        const femaleCarries = female.defects.some(d => d.name === defectType.name);
        
        // If both carry recessive or one expresses dominant, higher chance
        let expressionChance = defectType.expressionChance;
        if (defectType.inheritance === "recessive" && maleCarries && femaleCarries) {
            expressionChance = 0.25; // Higher chance if both carry
        } else if (defectType.inheritance === "dominant") {
            // If one parent expresses dominant trait
            expressionChance = 0.75;
        }
        
        // Calculate if offspring gets the defect
        if (Math.random() < defectType.transmissionChance) {
            const expressed = Math.random() < expressionChance;
            inheritedDefects.push({
                name: defectType.name,
                expressed: expressed,
                carrier: !expressed // If not expressed, then carrier
            });
        }
    });
    
    return inheritedDefects;
}

// Add puppy to kennel
function addPuppyToKennel(puppyId) {
    // Find the puppy in the temporary litter (we'll simulate this by recreating the puppy)
    // In a real implementation, we would store the litter temporarily
    
    // Since we can't actually store the puppy object in HTML, we'll just create a new one
    // In a real app, we'd have a temporary holding area for puppies
    alert("Puppy added to kennel! (In a full implementation, this would add the puppy to your kennel)");
}

// Populate show selector
function populateShowSelector() {
    const select = document.getElementById('show-dog-select');
    select.innerHTML = '';
    
    gameState.dogs.forEach(dog => {
        // Only include mature dogs
        if (dog.age >= 90) {
            const option = document.createElement('option');
            option.value = dog.id;
            option.textContent = `${dog.name} (${dog.breed}, Gen: ${calculateGeneticRating(dog)})`;
            select.appendChild(option);
        }
    });
}

// Enter a dog into show
function enterShow() {
    const dogId = parseInt(document.getElementById('show-dog-select').value);
    if (!dogId) {
        alert("Please select a dog.");
        return;
    }
    
    const dog = gameState.dogs.find(d => d.id === dogId);
    if (!dog) return;
    
    // Calculate beauty score
    const baseScore = (dog.conformation * 0.6) + (dog.coat * 0.4);
    
    // Count visible defects (not treated)
    const visibleDefects = dog.defects.filter(d => d.expressed && 
        (!dog.defectTreatmentDays || dog.defectTreatmentDays <= 0)).length;
    
    let beautyScore = baseScore - (visibleDefects * 15);
    beautyScore = Math.max(0, beautyScore);
    
    // Apply temporary beauty boost if applicable
    if (dog.beautyBoost) {
        beautyScore += dog.beautyBoost;
        beautyScore = Math.min(100, beautyScore);
    }
    
    document.getElementById('beauty-score').textContent = Math.round(beautyScore);
    document.getElementById('defect-count').textContent = visibleDefects;
    
    // Show the show content
    document.getElementById('show-content').style.display = 'block';
    
    // Reset skill challenge
    resetSkillChallenge();
}

// Reset skill challenge
let skillAttempts = 0;
let skillScoreTotal = 0;
let pointerInterval;

function resetSkillChallenge() {
    skillAttempts = 0;
    skillScoreTotal = 0;
    document.getElementById('attempt-count').textContent = '0';
    document.getElementById('current-skill').textContent = '0';
    document.getElementById('skill-click-btn').disabled = false;
    
    // Start the pointer movement
    clearInterval(pointerInterval);
    movePointer();
}

// Move the pointer for skill challenge
function movePointer() {
    const pointer = document.getElementById('pointer');
    let position = 50; // Start in the middle
    let direction = 1; // 1 for right, -1 for left
    
    clearInterval(pointerInterval);
    
    pointerInterval = setInterval(() => {
        position += direction * 0.5; // Move 0.5% per interval
        
        // Reverse direction at edges
        if (position >= 90 || position <= 10) {
            direction *= -1;
        }
        
        pointer.style.left = `${position}%`;
    }, 50); // Update every 50ms for smooth animation
}

// Record skill attempt
function recordSkillAttempt() {
    if (skillAttempts >= 3) return;
    
    const pointer = document.getElementById('pointer');
    const position = parseFloat(pointer.style.left);
    
    let attemptScore = 0;
    
    // Determine score based on position
    if (position >= 40 && position <= 60) { // Green zone (center 20%)
        attemptScore = 25;
    } else if ((position >= 30 && position < 40) || (position > 60 && position <= 70)) { // Yellow zones
        attemptScore = 10;
    } else { // Red zones
        attemptScore = 0;
    }
    
    skillScoreTotal += attemptScore;
    skillAttempts++;
    
    document.getElementById('attempt-count').textContent = skillAttempts;
    document.getElementById('current-skill').textContent = skillScoreTotal;
    
    if (skillAttempts >= 3) {
        document.getElementById('skill-click-btn').disabled = true;
        document.getElementById('finish-show-btn').style.display = 'inline-block';
    }
}

// Finish show and calculate results
function finishShow() {
    const dogId = parseInt(document.getElementById('show-dog-select').value);
    const dog = gameState.dogs.find(d => d.id === dogId);
    if (!dog) return;
    
    const beautyScore = parseInt(document.getElementById('beauty-score').textContent);
    const skillScore = skillScoreTotal;
    const totalScore = beautyScore + skillScore;
    
    // Determine show tier and results
    let tier = "";
    let reward = 0;
    let prestigeGain = 0;
    
    if (totalScore >= 155) {
        tier = "Tier 4";
        reward = 15000;
        prestigeGain = 100;
    } else if (totalScore >= 135) {
        tier = "Tier 3";
        reward = 4000;
        prestigeGain = 40;
    } else if (totalScore >= 110) {
        tier = "Tier 2";
        reward = 1200;
        prestigeGain = 15;
    } else if (totalScore >= 80) {
        tier = "Tier 1";
        reward = 300;
        prestigeGain = 5;
    } else {
        tier = "Did not place";
        reward = 0;
        prestigeGain = 0;
    }
    
    // Update game state
    if (reward > 0) {
        gameState.money += reward;
    }
    gameState.prestige += prestigeGain;
    
    // Show results
    alert(`Show Results:\nTier: ${tier}\nTotal Score: ${totalScore}\nReward: $${reward}\nPrestige Gained: ${prestigeGain}`);
    
    // Reset show interface
    document.getElementById('show-content').style.display = 'none';
    document.getElementById('finish-show-btn').style.display = 'none';
    
    clearInterval(pointerInterval);
    
    updateUI();
}

// Refresh market
function refreshMarket() {
    if (gameState.money < 100) {
        alert("Not enough money to refresh market ($100 required)");
        return;
    }
    
    gameState.money -= 100;
    generateMarketListings();
    updateUI();
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);