
// State Management
const store = {
    getCouples: () => JSON.parse(localStorage.getItem('datejar_couples') || '[]'),
    setCouples: (couples) => localStorage.setItem('datejar_couples', JSON.stringify(couples)),

    getIdeas: () => JSON.parse(localStorage.getItem('datejar_ideas') || '[]'),
    setIdeas: (ideas) => localStorage.setItem('datejar_ideas', JSON.stringify(ideas)),

    getSession: () => JSON.parse(localStorage.getItem('datejar_session') || 'null'),
    setSession: (session) => localStorage.setItem('datejar_session', JSON.stringify(session)),

    clearSession: () => localStorage.removeItem('datejar_session')
};

// Auth Logic
const auth = {
    currentUser: null,
    currentCouple: null,

    init: () => {
        const session = store.getSession();
        if (session) {
            const couples = store.getCouples();
            const couple = couples.find(c => c.id === session.coupleId);
            if (couple) {
                const user = couple.users.find(u => u.id === session.userId);
                if (user) {
                    auth.currentUser = user;
                    auth.currentCouple = couple;
                    ui.updateNav();
                    router.navigate('dashboard');
                    return;
                }
            }
        }
        router.navigate('login');
    },

    handleLogin: (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        const couples = store.getCouples();
        let foundUser = null;
        let foundCouple = null;

        for (const couple of couples) {
            const user = couple.users.find(u => u.email === email);
            if (user) {
                // Check user specific password or couple default
                const validPass = user.password ? user.password === password : couple.sharedPassword === password;
                if (validPass) {
                    foundUser = user;
                    foundCouple = couple;
                    break;
                }
            }
        }

        if (foundUser) {
            auth.currentUser = foundUser;
            auth.currentCouple = foundCouple;
            store.setSession({ userId: foundUser.id, coupleId: foundCouple.id });

            if (!foundUser.password) {
                // First time login, force password change
                router.navigate('change-password');
            } else {
                ui.updateNav();
                router.navigate('dashboard');
            }
        } else {
            alert('Invalid credentials');
        }
    },

    handleRegister: (e) => {
        e.preventDefault();
        const form = e.target;
        const couples = store.getCouples();

        if (couples.find(c => c.refCode === form.refCode.value)) {
            alert('Reference code already exists!');
            return;
        }

        const newCouple = {
            id: Date.now().toString(),
            refCode: form.refCode.value,
            sharedPassword: form.sharedPassword.value,
            users: [
                { id: 'u1_' + Date.now(), name: form.name1.value, email: form.email1.value, password: null },
                { id: 'u2_' + Date.now(), name: form.name2.value, email: form.email2.value, password: null }
            ]
        };

        couples.push(newCouple);
        store.setCouples(couples);

        alert('Registration successful! Please login.');
        ui.switchAuthTab('login');
    },

    handleChangePassword: (e) => {
        e.preventDefault();
        const newPass = e.target.newPassword.value;

        const couples = store.getCouples();
        const couple = couples.find(c => c.id === auth.currentCouple.id);
        const user = couple.users.find(u => u.id === auth.currentUser.id);

        user.password = newPass;
        store.setCouples(couples);

        // Update local state
        auth.currentUser.password = newPass;

        alert('Password updated!');
        ui.updateNav();
        router.navigate('dashboard');
    },

    logout: () => {
        store.clearSession();
        auth.currentUser = null;
        auth.currentCouple = null;
        window.location.reload();
    },

    requestDeleteAccount: () => {
        if (confirm('Are you sure? This will send a confirmation email to both partners. (Mocked)')) {
            alert('Confirmation emails sent to ' + auth.currentCouple.users.map(u => u.email).join(' and '));
            // In a real app, this would trigger a backend process
        }
    }
};

// Router
const router = {
    navigate: (pageId) => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + pageId).classList.add('active');

        if (pageId === 'dashboard') ideas.renderMyIdeas();
        if (pageId === 'jar') jar.init();
        if (pageId === 'history') historyPage.render();
    }
};

// UI Helpers
const ui = {
    switchAuthTab: (tab) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');

        if (tab === 'login') {
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('register-form').classList.add('hidden');
        } else {
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
        }
    },

    updateNav: () => {
        document.getElementById('navbar').classList.remove('hidden');
    },

    showModal: (id) => document.getElementById(id).classList.remove('hidden'),
    hideModal: (id) => document.getElementById(id).classList.add('hidden'),

    sortHistory: (key) => {
        historyPage.sortKey = key;
        historyPage.render();
    },

    showToast: (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        document.body.appendChild(toast);

        // Trigger reflow
        void toast.offsetWidth;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Ideas Logic
const ideas = {
    add: (e) => {
        e.preventDefault();
        const form = e.target;

        const newIdea = {
            id: Date.now().toString(),
            description: form.description.value,
            type: form.type.value,
            duration: parseFloat(form.duration.value),
            activity: form.activity.value,
            cost: form.cost.value,
            createdBy: auth.currentUser.id,
            createdByName: auth.currentUser.name,
            coupleId: auth.currentCouple.id,
            createdAt: new Date().toISOString(),
            selectedAt: null
        };

        const allIdeas = store.getIdeas();
        allIdeas.push(newIdea);
        store.setIdeas(allIdeas);

        ui.hideModal('add-idea-modal');
        form.reset();
        ideas.renderMyIdeas();
    },

    renderMyIdeas: () => {
        const allIdeas = store.getIdeas();
        const myIdeas = allIdeas.filter(i => i.createdBy === auth.currentUser.id && i.coupleId === auth.currentCouple.id);

        const container = document.getElementById('my-ideas-list');
        container.innerHTML = myIdeas.map(idea => `
            <div class="idea-card">
                <button class="delete-btn" onclick="ideas.delete('${idea.id}')">&times;</button>
                <h3>${idea.description}</h3>
                <div class="idea-meta">
                    <span>${idea.type}</span> • 
                    <span>${idea.duration} days</span> • 
                    <span>${idea.cost}</span>
                </div>
                ${idea.selectedAt ? '<div style="color:var(--accent); margin-top:5px;">Selected on ' + new Date(idea.selectedAt).toLocaleDateString() + '</div>' : ''}
            </div>
        `).join('');
    },

    delete: (id) => {
        if (!confirm('Delete this idea?')) return;
        const allIdeas = store.getIdeas();
        const newIdeas = allIdeas.filter(i => i.id !== id);
        store.setIdeas(newIdeas);
        ideas.renderMyIdeas();
    }
};

// Jar Logic
const jar = {
    init: () => {
        // Fill jar with papers visually
        const allIdeas = store.getIdeas();
        // Only unselected ideas from this couple
        const availableIdeas = allIdeas.filter(i => i.coupleId === auth.currentCouple.id && !i.selectedAt);

        const container = document.getElementById('papers-container');
        container.innerHTML = '';

        // Add visual papers
        availableIdeas.forEach(() => {
            const paper = document.createElement('div');
            paper.className = 'paper-fold';
            // Random position
            const x = Math.random() * 140 + 10;
            const y = Math.random() * 100 + 10;
            const r = Math.random() * 360;
            paper.style.setProperty('--x', x + 'px');
            paper.style.setProperty('--y', y + 'px');
            paper.style.setProperty('--r', r + 'deg');
            container.appendChild(paper);
        });
    },

    shakeAndPick: () => {
        const jarEl = document.getElementById('glass-jar');
        jarEl.classList.add('shaking');

        // Filter logic
        const indoor = document.getElementById('filter-indoor').checked;
        const outdoor = document.getElementById('filter-outdoor').checked;
        const maxDuration = parseFloat(document.getElementById('filter-duration').value);
        const maxCost = document.getElementById('filter-cost').value; // Logic needed for cost comparison

        setTimeout(() => {
            jarEl.classList.remove('shaking');

            const allIdeas = store.getIdeas();
            let candidates = allIdeas.filter(i => i.coupleId === auth.currentCouple.id && !i.selectedAt);

            // Apply filters
            if (indoor && !outdoor) candidates = candidates.filter(i => i.type === 'indoor');
            if (outdoor && !indoor) candidates = candidates.filter(i => i.type === 'outdoor');
            candidates = candidates.filter(i => i.duration <= maxDuration);
            // Simple cost filter (exact match or lower would be better, but for now simple)
            // Let's assume cost hierarchy: FREE < $ < $$ < $$$
            const costMap = { 'FREE': 0, '$': 1, '$$': 2, '$$$': 3 };
            if (maxCost !== '$$$') {
                candidates = candidates.filter(i => costMap[i.cost] <= costMap[maxCost]);
            }

            if (candidates.length === 0) {
                alert('No ideas match your criteria! Add more ideas or relax the filters.');
                return;
            }

            const winner = candidates[Math.floor(Math.random() * candidates.length)];
            jar.reveal(winner);

        }, 1000);
    },

    reveal: (idea) => {
        // Mark as selected
        const allIdeas = store.getIdeas();
        const idx = allIdeas.findIndex(i => i.id === idea.id);
        allIdeas[idx].selectedAt = new Date().toISOString();
        allIdeas[idx].selectedDate = new Date().toISOString();
        store.setIdeas(allIdeas);

        // Show overlay
        const overlay = document.getElementById('result-overlay');
        overlay.classList.remove('hidden');

        document.getElementById('result-title').innerText = idea.description;
        document.getElementById('result-duration').innerText = idea.duration + ' days';
        document.getElementById('result-activity').innerText = idea.activity;
        document.getElementById('result-cost').innerText = idea.cost;

        // Mock AI
        const aiSuggestions = [
            "Bring a camera to capture the moment!",
            "Wear comfortable shoes.",
            "Check for local events happening nearby.",
            "Maybe grab a coffee beforehand?",
            "This is a great chance to disconnect and talk."
        ];
        // Pick 2 random
        const suggestions = aiSuggestions.sort(() => 0.5 - Math.random()).slice(0, 2);
        document.getElementById('result-ai').innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');

        // Mock Email Construction
        const recipients = auth.currentCouple.users.map(u => u.email).join(', ');
        const emailBody = `
Subject: Date Jar Selection: ${idea.description}

Hi ${auth.currentCouple.users.map(u => u.name).join(' and ')},

The Date Jar has spoken! Here is your selected date for ${new Date().toLocaleDateString()}:

**${idea.description}**

Details:
- Type: ${idea.type}
- Duration: ${idea.duration} days
- Activity Level: ${idea.activity}
- Cost: ${idea.cost}

AI Suggestions:
${suggestions.map(s => '- ' + s).join('\n')}

Have fun!
The Date Jar
        `;

        console.log(`%c EMAIL SIMULATION \nTo: ${recipients}\n${emailBody}`, 'background: #222; color: #bada55; padding: 10px;');

        ui.showToast(`Confirmation emails sent to ${recipients}!`);
    }
};

// History Logic
const historyPage = {
    sortKey: 'date',
    render: () => {
        const allIdeas = store.getIdeas();
        let history = allIdeas.filter(i => i.coupleId === auth.currentCouple.id && i.selectedAt);

        // Sort
        history.sort((a, b) => {
            if (historyPage.sortKey === 'date') return new Date(b.selectedAt) - new Date(a.selectedAt);
            if (historyPage.sortKey === 'idea') return a.description.localeCompare(b.description);
            if (historyPage.sortKey === 'creator') return a.createdByName.localeCompare(b.createdByName);
            return 0;
        });

        const tbody = document.getElementById('history-list');
        tbody.innerHTML = history.map(h => `
            <tr>
                <td>${new Date(h.selectedAt).toLocaleDateString()}</td>
                <td>${h.description}</td>
                <td>${h.createdByName}</td>
            </tr>
        `).join('');
    }
};

// Init
window.addEventListener('load', () => {
    auth.init();
});
