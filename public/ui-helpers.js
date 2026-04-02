// Show/Hide Loading
function showLoading() {
    const loader = document.getElementById('loader') || createLoader();
    loader.style.display = 'flex';
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
    return loader;
}

// Show Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';

    // Style based on type
    const colors = {
        success: { bg: '#4caf50', text: '#fff' },
        error: { bg: '#f44336', text: '#fff' },
        warning: { bg: '#ff9800', text: '#fff' },
        info: { bg: '#2196f3', text: '#fff' }
    };

    const style = colors[type] || colors.info;
    notification.style.backgroundColor = style.bg;
    notification.style.color = style.text;

    document.body.appendChild(notification);

    const duration = type === 'error'
        ? NOTIFY_CONFIG.ERROR_DURATION
        : type === 'info'
            ? NOTIFY_CONFIG.INFO_DURATION
            : NOTIFY_CONFIG.SUCCESS_DURATION;
    setTimeout(() => notification.remove(), duration);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format percentage
function formatPercentage(percentage) {
    if (percentage === null || percentage === undefined) return '-';
    return percentage.toFixed(2) + '%';
}

// Get grade color
function getGradeColor(grade) {
    const colors = {
        'A': '#4caf50',
        'B': '#8bc34a',
        'C': '#ffc107',
        'D': '#ff9800',
        'F': '#f44336'
    };
    return colors[grade] || '#999';
}

// Create table row
function createTableRow(data, columns) {
    const row = document.createElement('tr');
    columns.forEach(col => {
        const cell = document.createElement('td');
        cell.textContent = data[col.key] || '-';
        row.appendChild(cell);
    });
    return row;
}

// Clear form
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}

// Disable button during submission
function setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = loading;
        button.textContent = loading ? 'Loading...' : button.dataset.originalText || 'Submit';
    }
}
