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

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    ENDPOINTS: {
        SUMMARY: '/summary'
    }
};

// DOM Elements
const elements = {
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    matchContent: document.getElementById('matchContent'),
    
    // Scoreboard elements
    matchTitle: document.getElementById('matchTitle'),
    homeLogo: document.getElementById('homeLogo'),
    homeName: document.getElementById('homeName'),
    homeScore: document.getElementById('homeScore'),
    awayLogo: document.getElementById('awayLogo'),
    awayName: document.getElementById('awayName'),
    awayScore: document.getElementById('awayScore'),
    matchStatus: document.getElementById('matchStatus'),
    matchTime: document.getElementById('matchTime'),
    
    // Content sections
    matchInfo: document.getElementById('matchInfo'),
    eventsSection: document.getElementById('eventsSection'),
    eventsContainer: document.getElementById('eventsContainer'),
    statsSection: document.getElementById('statsSection'),
    statsContainer: document.getElementById('statsContainer'),
    lineupsSection: document.getElementById('lineupsSection'),
    lineupsContainer: document.getElementById('lineupsContainer'),
    venueSection: document.getElementById('venueSection'),
    venueInfo: document.getElementById('venueInfo')
};

// State
let currentMatchData = null;
let gameId = null;

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Initializing Match Detail Page...');
    
    // Get game ID from URL parameter
    gameId = getGameIdFromURL();
    
    if (!gameId) {
        showError('No match ID provided. Please return to the schedule.');
        return;
    }
    
    console.log('🎮 Game ID:', gameId);
    fetchMatchDetails(gameId);
}

/**
 * Get game ID from URL parameter
 */
function getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Fetch match details from ESPN API
 */
async function fetchMatchDetails(id) {
    console.log('📡 Fetching match details for ID:', id);
    showLoading();
    
    try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUMMARY}?event=${id}`;
        console.log('API Request:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Match data fetched successfully:', data);
        
        currentMatchData = data;
        displayMatchDetails(data);
        
    } catch (error) {
        console.error('❌ Error fetching match details:', error);
        showError(error.message);
    }
}

/**
 * Display all match details
 */
function displayMatchDetails(data) {
    try {
        // Update page title and meta
        updatePageMeta(data);
        
        // Display scoreboard
        displayScoreboard(data);
        
        // Display match information
        displayMatchInfo(data);
        
        // Display events (goals, cards, substitutions)
        if (data.plays && data.plays.length > 0) {
            displayEvents(data.plays);
        }
        
        // Display statistics
        if (data.boxscore && data.boxscore.teams) {
            displayStatistics(data.boxscore);
        }
        
        // Display lineups
        if (data.boxscore && data.boxscore.players) {
            displayLineups(data.boxscore.players);
        }
        
        // Display venue information
        displayVenueInfo(data);
        
        showMatchContent();
        
    } catch (error) {
        console.error('❌ Error displaying match details:', error);
        showError('Error displaying match information. Some data may be incomplete.');
    }
}

/**
 * Update page title and meta tags
 */
function updatePageMeta(data) {
    const header = data.header || {};
    const competitions = header.competitions || [];
    const competition = competitions[0] || {};
    const competitors = competition.competitors || [];
    
    if (competitors.length >= 2) {
        const homeTeam = competitors.find(c => c.homeAway === 'home') || competitors[0];
        const awayTeam = competitors.find(c => c.homeAway === 'away') || competitors[1];
        
        const matchTitle = `${homeTeam.team.displayName} vs ${awayTeam.team.displayName}`;
        const leagueName = header.league?.name || 'Soccer';
        
        // Update document title
        document.title = `${matchTitle} - Live Match Details | ${leagueName}`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `Watch ${matchTitle} live with real-time updates, lineups, statistics, and match events from ${leagueName}.`;
        }
    }
}

/**
 * Display scoreboard
 */
function displayScoreboard(data) {
    const header = data.header || {};
    const competitions = header.competitions || [];
    const competition = competitions[0] || {};
    const competitors = competition.competitors || [];
    const status = competition.status || {};
    
    if (competitors.length >= 2) {
        const homeTeam = competitors.find(c => c.homeAway === 'home') || competitors[0];
        const awayTeam = competitors.find(c => c.homeAway === 'away') || competitors[1];
        
        // Home Team
        elements.homeLogo.src = homeTeam.team.logo || '';
        elements.homeLogo.alt = `${homeTeam.team.displayName} logo`;
        elements.homeName.textContent = homeTeam.team.displayName;
        elements.homeScore.textContent = homeTeam.score || '0';
        
        // Away Team
        elements.awayLogo.src = awayTeam.team.logo || '';
        elements.awayLogo.alt = `${awayTeam.team.displayName} logo`;
        elements.awayName.textContent = awayTeam.team.displayName;
        elements.awayScore.textContent = awayTeam.score || '0';
        
        // Match Title (H1)
        elements.matchTitle.textContent = `${homeTeam.team.displayName} vs ${awayTeam.team.displayName}`;
    }
    
    // Match Status
    const state = status.type?.state;
    if (state === 'in') {
        elements.matchStatus.innerHTML = `
            <span class="pulse-dot"></span>
            <span style="color: var(--live-color); font-weight: 700;">LIVE</span>
        `;
        elements.matchTime.textContent = status.displayClock || status.type?.shortDetail || '';
    } else if (state === 'pre') {
        elements.matchStatus.textContent = 'VS';
        elements.matchTime.textContent = status.type?.shortDetail || '';
    } else {
        elements.matchStatus.textContent = 'FT';
        elements.matchTime.textContent = status.type?.shortDetail || 'Full Time';
    }
}

/**
 * Display match information
 */
function displayMatchInfo(data) {
    const header = data.header || {};
    const gameInfo = data.gameInfo || {};
    
    const infoItems = [];
    
    // League
    if (header.league) {
        infoItems.push({
            label: 'Competition',
            value: header.league.name,
            icon: '🏆'
        });
    }
    
    // Venue
    if (gameInfo.venue) {
        infoItems.push({
            label: 'Venue',
            value: gameInfo.venue.fullName,
            icon: '🏟️'
        });
    }
    
    // Attendance
    if (gameInfo.attendance) {
        infoItems.push({
            label: 'Attendance',
            value: gameInfo.attendance.toLocaleString(),
            icon: '👥'
        });
    }
    
    // Referee
    if (gameInfo.officials && gameInfo.officials.length > 0) {
        const referee = gameInfo.officials.find(o => o.position === 'Referee');
        if (referee) {
            infoItems.push({
                label: 'Referee',
                value: referee.displayName,
                icon: '👨‍⚖️'
            });
        }
    }
    
    // Weather (if available)
    if (gameInfo.weather) {
        infoItems.push({
            label: 'Weather',
            value: `${gameInfo.weather.displayValue}, ${gameInfo.weather.temperature}°`,
            icon: '🌤️'
        });
    }
    
    // Broadcast
    if (gameInfo.broadcasts && gameInfo.broadcasts.length > 0) {
        const broadcast = gameInfo.broadcasts[0];
        if (broadcast.names && broadcast.names.length > 0) {
            infoItems.push({
                label: 'Broadcast',
                value: broadcast.names.join(', '),
                icon: '📺'
            });
        }
    }
    
    // Render info items
    elements.matchInfo.innerHTML = infoItems.map(item => `
        <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${item.icon}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${item.label}</div>
            <div style="font-weight: 600; color: var(--text-primary);">${item.value}</div>
        </div>
    `).join('');
}

/**
 * Display match events (goals, cards, substitutions)
 */
function displayEvents(plays) {
    const importantEvents = plays.filter(play => 
        play.scoringPlay || 
        play.typeText === 'Yellow Card' || 
        play.typeText === 'Red Card' ||
        play.typeText === 'Substitution'
    );
    
    if (importantEvents.length === 0) {
        return;
    }
    
    elements.eventsSection.style.display = 'block';
    
    elements.eventsContainer.innerHTML = importantEvents.map(event => {
        const eventClass = event.scoringPlay ? 'goal' : 'card';
        const time = event.clock?.displayValue || event.period?.displayValue || '';
        const team = event.team?.displayName || '';
        const description = event.text || event.typeText || '';
        
        return `
            <div class="timeline-event ${eventClass}">
                <div class="event-time">${time}'</div>
                <div class="event-description">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${team}</div>
                    <div style="color: var(--text-secondary);">${description}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Display match statistics
 */
function displayStatistics(boxscore) {
    const teams = boxscore.teams || [];
    
    if (teams.length < 2) {
        return;
    }
    
    const homeTeam = teams[0];
    const awayTeam = teams[1];
    
    const homeStats = homeTeam.statistics || [];
    const awayStats = awayTeam.statistics || [];
    
    if (homeStats.length === 0 && awayStats.length === 0) {
        return;
    }
    
    elements.statsSection.style.display = 'block';
    
    // Create stat items
    const statNames = [...new Set([
        ...homeStats.map(s => s.name),
        ...awayStats.map(s => s.name)
    ])];
    
    elements.statsContainer.innerHTML = statNames.map(statName => {
        const homeStat = homeStats.find(s => s.name === statName);
        const awayStat = awayStats.find(s => s.name === statName);
        
        const homeValue = parseFloat(homeStat?.displayValue || 0);
        const awayValue = parseFloat(awayStat?.displayValue || 0);
        const total = homeValue + awayValue;
        
        const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
        const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;
        
        return `
            <div class="stat-bar">
                <div class="stat-label">
                    <span>${homeStat?.displayValue || '0'}</span>
                    <span style="font-weight: 600;">${statName}</span>
                    <span>${awayStat?.displayValue || '0'}</span>
                </div>
                <div class="stat-visual">
                    <div class="stat-fill-home" style="width: ${homePercent}%"></div>
                    <div class="stat-fill-away" style="width: ${awayPercent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Display team lineups
 */
function displayLineups(players) {
    if (!players || players.length < 2) {
        return;
    }
    
    elements.lineupsSection.style.display = 'block';
    
    elements.lineupsContainer.innerHTML = players.map(team => {
        const starters = team.statistics?.[0]?.athletes || [];
        
        if (starters.length === 0) {
            return '';
        }
        
        return `
            <div class="lineup-team">
                <h3>${team.team.displayName}</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${starters.map(player => {
                        const position = player.position?.abbreviation || '';
                        return `
                            <div class="player-item">
                                <span class="player-number">${player.jersey || ''}</span>
                                <span style="font-weight: 600;">${player.athlete?.displayName || 'Unknown'}</span>
                                ${position ? `<span style="margin-left: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">${position}</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Display venue and additional information
 */
function displayVenueInfo(data) {
    const gameInfo = data.gameInfo || {};
    const venue = gameInfo.venue;
    
    if (!venue && !gameInfo.attendance && !gameInfo.weather) {
        return;
    }
    
    elements.venueSection.style.display = 'block';
    
    let venueHTML = '';
    
    if (venue) {
        venueHTML += `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary);">Stadium</h3>
                <div style="display: grid; gap: 1rem;">
                    <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">${venue.fullName || venue.name || 'Unknown Venue'}</div>
                        ${venue.address ? `
                            <div style="color: var(--text-secondary); font-size: 0.875rem;">
                                ${venue.address.city ? venue.address.city + ', ' : ''}${venue.address.country || ''}
                            </div>
                        ` : ''}
                        ${venue.capacity ? `
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                                Capacity: ${venue.capacity.toLocaleString()}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    if (gameInfo.weather) {
        venueHTML += `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary);">Weather Conditions</h3>
                <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">
                        ${gameInfo.weather.displayValue || 'N/A'}
                    </div>
                    ${gameInfo.weather.temperature ? `
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">
                            Temperature: ${gameInfo.weather.temperature}°F
                        </div>
                    ` : ''}
                    ${gameInfo.weather.conditionId ? `
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">
                            Condition: ${gameInfo.weather.conditionId}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    if (gameInfo.officials && gameInfo.officials.length > 0) {
        venueHTML += `
            <div>
                <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary);">Match Officials</h3>
                <div style="display: grid; gap: 0.5rem;">
                    ${gameInfo.officials.map(official => `
                        <div style="padding: 0.75rem; background: var(--bg-color); border-radius: 8px; display: flex; justify-content: space-between;">
                            <span style="font-weight: 600;">${official.displayName}</span>
                            <span style="color: var(--text-secondary);">${official.position || 'Official'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    elements.venueInfo.innerHTML = venueHTML;
}

/**
 * Show loading state
 */
function showLoading() {
    elements.loadingState.style.display = 'block';
    elements.errorState.style.display = 'none';
    elements.matchContent.style.display = 'none';
}

/**
 * Show error state
 */
function showError(message) {
    elements.errorMessage.textContent = message || 'Unable to load match details. Please try again later.';
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'block';
    elements.matchContent.style.display = 'none';
}

/**
 * Show match content
 */
function showMatchContent() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.matchContent.style.display = 'block';
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('✅ Game script loaded successfully');
