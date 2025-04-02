// Connection check functionality
class ConnectionCheck {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionStatus = document.createElement('div');
        this.connectionStatus.className = 'connection-status';
        this.setupConnectionStatus();
        this.setupEventListeners();
    }

    setupConnectionStatus() {
        this.connectionStatus.innerHTML = `
            <div class="connection-content">
                <div class="connection-icon">
                    <i class="fas fa-wifi"></i>
                </div>
                <h2>No Internet Connection</h2>
                <p>Please check your internet connection and try again</p>
                <button class="retry-button">Retry</button>
            </div>
        `;
        this.connectionStatus.style.display = 'none';
        document.body.appendChild(this.connectionStatus);
    }

    setupEventListeners() {
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        
        const retryButton = this.connectionStatus.querySelector('.retry-button');
        retryButton.addEventListener('click', () => this.checkConnection());
    }

    handleConnectionChange(isOnline) {
        this.isOnline = isOnline;
        if (isOnline) {
            this.connectionStatus.style.display = 'none';
            this.onConnectionRestored();
        } else {
            this.connectionStatus.style.display = 'flex';
        }
    }

    checkConnection() {
        if (navigator.onLine) {
            this.connectionStatus.style.display = 'none';
            this.onConnectionRestored();
        }
    }

    onConnectionRestored() {
        // This will be overridden by the main app and admin app
        console.log('Connection restored');
    }
}

// Add styles for connection status
const style = document.createElement('style');
style.textContent = `
    .connection-status {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f8f9fa;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .connection-content {
        text-align: center;
        padding: 2rem;
    }

    .connection-icon {
        font-size: 4rem;
        color: #dc3545;
        margin-bottom: 1rem;
    }

    .connection-content h2 {
        color: #343a40;
        margin-bottom: 0.5rem;
    }

    .connection-content p {
        color: #6c757d;
        margin-bottom: 1.5rem;
    }

    .retry-button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .retry-button:hover {
        background-color: #0056b3;
    }
`;
document.head.appendChild(style); 