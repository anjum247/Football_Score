/**
 * ⚠️ UNOFFICIAL ESPN API USAGE DISCLAIMER ⚠️
 * 
 * This script uses UNOFFICIAL ESPN API endpoints that are NOT officially
 * supported by ESPN. These endpoints may change or become unavailable without notice.
 * 
 * This is for EDUCATIONAL and DEMONSTRATION purposes ONLY.
 * ESPN® is a registered trademark. This project is not affiliated with ESPN.
 * 
 * For production use, obtain official API access with proper authentication.
 */

// API Configuration with CORS Proxy
const API_CONFIG = {
    // Using AllOrigins as a reliable CORS proxy
    PROXY: 'https://api.allorigins.win/raw?url=',
    BASE_URL: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    ENDPOINTS: {
        SCOREBOARD: '/scoreboard',
        SUMMARY: '/summary'
    }
};

// DOM Elements
const elements = {
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    noMatchesState: document.getElementById('noMatchesState'),
    noMatchesMessage: document.getElementById('noMatchesMessage'),
    matchesContainer: document.getElementById('matchesContainer'),
    refreshBtn: document.getElementById('refreshBtn'),
    liveCount: document.getElementById('liveCount'),
    datePicker: document.getElementById('datePicker'),
    loadBtn: document.getElementById('loadBtn'),
    headerActions: document.getElementById('headerActions')
};

// State Management
let currentMatchData = null;
let selectedDate = null;

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Initializing Live Soccer Scoreboard...');
    console.log('🔧 API Config:', API_CONFIG);
    
    // Set today's date as default in date picker
    const today = new Date();
    elements.datePicker.value = formatDateForInput(today);
    
    // Setup event listeners
    setupEventListeners();
    
    // Test API connection
    testAPIConnection();
    
    console.log('✅ Ready! Please select a date and click "Load Matches"');
}

/**
 * Test API connection
 */
async function testAPIConnection() {
    console.log('🧪 Testing API connection...');
    try {
        const testUrl = `${API_CONFIG.PROXY}${encodeURIComponent('https://site.api.espn.com/apis/site/v2/sports/soccer/scoreboard')}`;
        console.log('🧪 Test URL:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('🧪 Test Response Status:', response.status);
        
        if (response.ok) {
            console.log('✅ API connection working!');
        } else {
            console.log('⚠️ API returned status:', response.status);
        }
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date for API (YYYYMMDD)
 */
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Load button click
    if (elements.loadBtn) {
        elements.loadBtn.addEventListener('click', () => {
            const dateValue = elements.datePicker.value;
            if (!dateValue) {
                alert('Please select a date first!');
                return;
            }
            selectedDate = new Date(dateValue + 'T12:00:00'); // Use noon to avoid timezone issues
            console.log('📅 Loading matches for:', selectedDate.toDateString());
            fetchScheduleData();
        });
    }
    
    // Refresh button
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', () => {
            console.log('🔄 Manual refresh triggered');
            if (selectedDate) {
                fetchScheduleData();
            } else {
                alert('Please select a date first!');
            }
        });
    }
    
    // Enter key on date picker
    if (elements.datePicker) {
        elements.datePicker.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && elements.loadBtn) {
                elements.loadBtn.click();
            }
        });
    } else {
        console.error('❌ Date picker element not found!');
    }
}

/**
 * Fetch today's schedule data from ESPN API
 */
async function fetchScheduleData() {
    if (!selectedDate) {
        alert('Please select a date first!');
        return;
    }
    
    console.log('📡 Fetching schedule data...');
    showLoading();
    
    try {
        const dateParam = formatDateForAPI(selectedDate);
        const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCOREBOARD}?dates=${dateParam}`;
        const proxyUrl = `${API_CONFIG.PROXY}${encodeURIComponent(apiUrl)}`;
        
        console.log('📅 Date:', selectedDate.toDateString());
        console.log('🔗 API URL:', apiUrl);
        console.log('🔗 Proxy URL:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📊 Response Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data fetched successfully!');
        console.log('📦 Events found:', data.events?.length || 0);
        
        currentMatchData = data;
        
        // Show refresh button and live indicator after first successful load
        elements.headerActions.style.display = 'flex';
        
        processAndDisplayMatches(data);
        
    } catch (error) {
        console.error('❌ Error details:', error);
        showError(`Failed to load matches. Error: ${error.message}`);
    }
}

/**
 * Process and display matches grouped by league
 */
function processAndDisplayMatches(data) {
    const events = data.events || [];
    
    if (events.length === 0) {
        showNoMatches();
        return;
    }
    
    // Group matches by league
    const groupedMatches = groupMatchesByLeague(events);
    
    // Count live matches
    const liveMatches = events.filter(event => 
        event.status.type.state === 'in'
    ).length;
    
    updateLiveCount(liveMatches);
    
    // Render grouped matches
    renderMatchGroups(groupedMatches);
    
    showMatches();
}

/**
 * Group matches by their league/competition
 */
function groupMatchesByLeague(events) {
    const grouped = {};
    
    events.forEach(event => {
        const league = event.league || { name: 'Unknown League', logo: '' };
        const leagueName = league.name;
        
        if (!grouped[leagueName]) {
            grouped[leagueName] = {
                league: league,
                matches: []
            };
        }
        
        grouped[leagueName].matches.push(event);
    });
    
    return grouped;
}

/**
 * Render all match groups
 */
function renderMatchGroups(groupedMatches) {
    elements.matchesContainer.innerHTML = '';
    
    // Sort leagues alphabetically
    const sortedLeagues = Object.keys(groupedMatches).sort();
    
    sortedLeagues.forEach(leagueName => {
        const group = groupedMatches[leagueName];
        const leagueSection = createLeagueSection(group);
        elements.matchesContainer.appendChild(leagueSection);
    });
}

/**
 * Create a league section with all its matches
 */
function createLeagueSection(group) {
    const section = document.createElement('section');
    section.className = 'league-group';
    
    // League Header (H2 for SEO)
    const header = document.createElement('h2');
    header.className = 'league-header';
    
    if (group.league.logo) {
        const logo = document.createElement('img');
        logo.src = group.league.logo;
        logo.alt = `${group.league.name} logo`;
        logo.loading = 'lazy';
        header.appendChild(logo);
    }
    
    const leagueName = document.createElement('span');
    leagueName.textContent = group.league.name;
    header.appendChild(leagueName);
    
    section.appendChild(header);
    
    // Matches Grid
    const matchesGrid = document.createElement('div');
    matchesGrid.className = 'matches-grid';
    
    group.matches.forEach(match => {
        const matchCard = createMatchCard(match);
        matchesGrid.appendChild(matchCard);
    });
    
    section.appendChild(matchesGrid);
    
    return section;
}

/**
 * Create a match card element
 */
function createMatchCard(match) {
    const article = document.createElement('article');
    article.className = 'match-card';
    
    const status = match.status.type.state;
    const isLive = status === 'in';
    
    if (isLive) {
        article.classList.add('live');
    }
    
    // Make card clickable - redirect to detail page
    article.addEventListener('click', () => {
        const gameId = match.id;
        window.location.href = `game.html?id=${gameId}`;
    });
    
    // Match Status Badge
    const statusBadge = createStatusBadge(match.status);
    article.appendChild(statusBadge);
    
    // Teams Container
    const teamsContainer = createTeamsContainer(match.competitions[0]);
    article.appendChild(teamsContainer);
    
    // Match Details
    const matchDetails = createMatchDetails(match);
    article.appendChild(matchDetails);
    
    // Odds Display (if available)
    const odds = match.competitions[0]?.odds?.[0];
    if (odds) {
        const oddsContainer = createOddsDisplay(odds);
        article.appendChild(oddsContainer);
    }
    
    return article;
}

/**
 * Create status badge
 */
function createStatusBadge(status) {
    const badge = document.createElement('div');
    const state = status.type.state;
    
    if (state === 'in') {
        badge.className = 'match-status live';
        badge.innerHTML = `
            <span class="pulse-dot"></span>
            <span>LIVE - ${status.displayClock || status.type.shortDetail}</span>
        `;
    } else if (state === 'pre') {
        badge.className = 'match-status scheduled';
        badge.textContent = status.type.shortDetail;
    } else {
        badge.className = 'match-status finished';
        badge.textContent = 'FT';
    }
    
    return badge;
}

/**
 * Create teams container with scores
 */
function createTeamsContainer(competition) {
    const container = document.createElement('div');
    container.className = 'teams-container';
    
    const competitors = competition.competitors || [];
    
    competitors.forEach(competitor => {
        const teamRow = document.createElement('div');
        teamRow.className = 'team-row';
        
        const teamInfo = document.createElement('div');
        teamInfo.className = 'team-info';
        
        if (competitor.team.logo) {
            const logo = document.createElement('img');
            logo.src = competitor.team.logo;
            logo.alt = `${competitor.team.displayName} logo`;
            logo.className = 'team-logo';
            logo.loading = 'lazy';
            teamInfo.appendChild(logo);
        }
        
        const teamName = document.createElement('span');
        teamName.className = 'team-name';
        teamName.textContent = competitor.team.displayName || competitor.team.name;
        teamInfo.appendChild(teamName);
        
        teamRow.appendChild(teamInfo);
        
        const score = document.createElement('span');
        score.className = 'team-score';
        score.textContent = competitor.score || '-';
        teamRow.appendChild(score);
        
        container.appendChild(teamRow);
    });
    
    return container;
}

/**
 * Create match details section
 */
function createMatchDetails(match) {
    const details = document.createElement('div');
    details.className = 'match-details';
    
    const time = document.createElement('div');
    time.className = 'match-time';
    time.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${match.status.type.shortDetail}</span>
    `;
    details.appendChild(time);
    
    if (match.competitions[0]?.venue?.fullName) {
        const venue = document.createElement('div');
        venue.className = 'match-venue';
        venue.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${match.competitions[0].venue.fullName}</span>
        `;
        details.appendChild(venue);
    }
    
    return details;
}

/**
 * Create odds display
 */
function createOddsDisplay(odds) {
    const container = document.createElement('div');
    container.className = 'odds-container';
    
    const oddsData = [
        { label: 'Home', value: odds.homeTeamOdds?.moneyLine },
        { label: 'Draw', value: odds.drawOdds?.moneyLine },
        { label: 'Away', value: odds.awayTeamOdds?.moneyLine }
    ];
    
    oddsData.forEach(odd => {
        if (odd.value) {
            const item = document.createElement('div');
            item.className = 'odds-item';
            
            const label = document.createElement('span');
            label.className = 'odds-label';
            label.textContent = odd.label;
            
            const value = document.createElement('span');
            value.className = 'odds-value';
            value.textContent = formatOdds(odd.value);
            
            item.appendChild(label);
            item.appendChild(value);
            container.appendChild(item);
        }
    });
    
    return container;
}

/**
 * Format odds value
 */
function formatOdds(value) {
    if (value > 0) {
        return `+${value}`;
    }
    return value.toString();
}

/**
 * Update live match count
 */
function updateLiveCount(count) {
    elements.liveCount.textContent = `${count} Live`;
}

/**
 * Show loading state
 */
function showLoading() {
    elements.loadingState.style.display = 'block';
    elements.errorState.style.display = 'none';
    elements.noMatchesState.style.display = 'none';
    elements.matchesContainer.style.display = 'none';
}

/**
 * Show error state
 */
function showError(message) {
    elements.errorMessage.textContent = message || 'Unable to load matches. Please try again later.';
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'block';
    elements.noMatchesState.style.display = 'none';
    elements.matchesContainer.style.display = 'none';
}

/**
 * Show no matches state
 */
function showNoMatches() {
    const dateStr = selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    elements.noMatchesMessage.textContent = `No matches scheduled for ${dateStr}. Try selecting a different date!`;
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.noMatchesState.style.display = 'block';
    elements.matchesContainer.style.display = 'none';
    updateLiveCount(0);
}

/**
 * Show matches container
 */
function showMatches() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.noMatchesState.style.display = 'none';
    elements.matchesContainer.style.display = 'block';
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('✅ Script loaded successfully');
