import './style.css';

// Token data and prices
let tokenPrices = {};
let availableTokens = [];
let transactionHistory = [];

// DOM elements
let app;
let fromAmountInput, toAmountInput;
let swapButton, swapArrowButton;

// API endpoints
const PRICES_API = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

// Configuration
const MIN_TRADE_AMOUNT = 0.000001;

// Initialize the app
async function init() {
  app = document.querySelector('#app');

  // Show loading state
  app.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading tokens...</p></div>';

  try {
    await loadTokenPrices();
    renderSwapInterface();
    attachEventListeners();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.innerHTML = `
      <div class="error-container">
        <h2>Failed to Load</h2>
        <p>Unable to fetch token prices. Please try again later.</p>
        <button onclick="location.reload()" class="retry-btn">Retry</button>
      </div>
    `;
  }
}

// Load token prices from API
async function loadTokenPrices() {
  try {
    const response = await fetch(PRICES_API);
    if (!response.ok) throw new Error('Failed to fetch prices');

    const pricesData = await response.json();

    // Process prices data - get latest price for each currency
    const priceMap = new Map();

    pricesData.forEach((item) => {
      if (item.price && item.currency) {
        if (!priceMap.has(item.currency) || new Date(item.date) > new Date(priceMap.get(item.currency).date)) {
          priceMap.set(item.currency, item);
        }
      }
    });

    tokenPrices = Object.fromEntries(priceMap);
    availableTokens = Array.from(priceMap.keys()).sort();

    console.log(`Loaded ${availableTokens.length} tokens with prices`);
  } catch (error) {
    console.error('Error loading token prices:', error);
    throw error;
  }
}

// Render the swap interface
function renderSwapInterface() {
  app.innerHTML = `
    <div class="swap-container">
      <div class="swap-header">
        <h1>Currency Swap</h1>
        <p>Swap between different cryptocurrencies</p>
      </div>
      
      <div class="swap-form">
        <div class="swap-input-group">
          <div class="input-label">
            <span>From</span>
            <span class="balance">Balance: --</span>
          </div>
          <div class="swap-input">
            <input type="number" id="fromAmount" placeholder="0.0" min="0" step="any">
            <div class="token-selector" id="fromTokenSelector">
              <img id="fromTokenIcon" class="token-icon" alt="" style="display: none;">
              <span id="fromTokenSymbol">Select Token</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 8.5L2 4.5H10L6 8.5Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div class="input-validation" id="fromValidation" style="display: none;"></div>
        </div>
        
        <div class="swap-arrow-container">
          <button id="swapArrow" class="swap-arrow-btn" title="Switch tokens">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L10 2.5L12.5 5M10 2.5V17.5M12.5 15L10 17.5L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="swap-input-group">
          <div class="input-label">
            <span>To</span>
            <span class="balance">Balance: --</span>
          </div>
          <div class="swap-input">
            <input type="number" id="toAmount" placeholder="0.0" min="0" step="any" readonly>
            <div class="token-selector" id="toTokenSelector">
              <img id="toTokenIcon" class="token-icon" alt="" style="display: none;">
              <span id="toTokenSymbol">Select Token</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 8.5L2 4.5H10L6 8.5Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="swap-info" id="swapInfo" style="display: none;">
          <div class="info-row">
            <span>Exchange Rate</span>
            <span id="exchangeRate">--</span>
          </div>
          <div class="info-row">
            <span>Price Impact</span>
            <span id="priceImpact" class="price-impact">< 0.01%</span>
          </div>
          <div class="info-row">
            <span>Network Fee</span>
            <span id="networkFee">~$0.50</span>
          </div>
          <div class="info-row">
            <span>Minimum Received</span>
            <span id="minReceived">--</span>
          </div>
        </div>
        
        <div class="slippage-container" id="slippageContainer" style="display: none;">
          <div class="slippage-header">
            <span>Slippage Tolerance</span>
            <button id="slippageToggle" class="slippage-toggle">⚙️</button>
          </div>
          <div class="slippage-options" id="slippageOptions" style="display: none;">
            <button class="slippage-btn" data-slippage="0.005">0.5%</button>
            <button class="slippage-btn active" data-slippage="0.01">1%</button>
            <button class="slippage-btn" data-slippage="0.03">3%</button>
            <input type="number" id="customSlippage" placeholder="Custom" min="0" max="50" step="0.1" class="custom-slippage">
          </div>
        </div>
        
        <button id="swapButton" class="swap-btn" disabled>
          <span class="btn-text">Select Tokens</span>
          <div class="btn-spinner" style="display: none;"></div>
        </button>
        
        <div id="errorMessage" class="error-message" style="display: none;"></div>
        
        <!-- Transaction History Toggle -->
        <button id="historyToggle" class="history-toggle" style="display: none;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V8L11 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Transaction History
        </button>
      </div>
      
      <!-- Transaction History Panel -->
      <div id="historyPanel" class="history-panel" style="display: none;">
        <div class="history-header">
          <h3>Recent Transactions</h3>
          <button id="closeHistory" class="close-btn">&times;</button>
        </div>
        <div class="history-content">
          <div id="historyList" class="history-list">
            <div class="empty-history">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>No transactions yet</p>
              <span>Your swap history will appear here</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Token Selection Modal -->
      <div id="tokenModal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Select a Token</h3>
            <button id="closeModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <input type="text" id="tokenSearch" placeholder="Search tokens..." class="search-input">
            <div class="popular-tokens">
              <span class="section-title">Popular</span>
              <div class="popular-token-list" id="popularTokens"></div>
            </div>
            <div id="tokenList" class="token-list"></div>
          </div>
        </div>
        <div class="modal-overlay"></div>
      </div>
    </div>
  `;
}

// Attach event listeners
function attachEventListeners() {
  // Get DOM elements
  fromAmountInput = document.getElementById('fromAmount');
  toAmountInput = document.getElementById('toAmount');
  swapButton = document.getElementById('swapButton');
  swapArrowButton = document.getElementById('swapArrow');

  // Token selectors
  document.getElementById('fromTokenSelector').addEventListener('click', () => openTokenModal('from'));
  document.getElementById('toTokenSelector').addEventListener('click', () => openTokenModal('to'));

  // Amount input with validation
  fromAmountInput.addEventListener('input', handleAmountInput);
  fromAmountInput.addEventListener('blur', validateAmount);

  // Swap arrow
  swapArrowButton.addEventListener('click', switchTokens);

  // Swap button
  swapButton.addEventListener('click', handleSwap);

  // Modal events
  document.getElementById('closeModal').addEventListener('click', closeTokenModal);
  document.getElementById('tokenModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeTokenModal();
  });

  // Token search
  document.getElementById('tokenSearch').addEventListener('input', filterTokens);

  // Slippage settings
  document.getElementById('slippageToggle')?.addEventListener('click', toggleSlippageSettings);

  // Transaction history
  document.getElementById('historyToggle')?.addEventListener('click', showTransactionHistory);
  document.getElementById('closeHistory')?.addEventListener('click', hideTransactionHistory);

  // Add keyboard navigation
  document.addEventListener('keydown', handleKeyNavigation);
}

// Token selection state
let currentModalType = ''; // 'from' or 'to'
let selectedFromToken = null;
let selectedToToken = null;
let currentSlippage = 0.01; // 1% default

// Popular tokens for quick access
const POPULAR_TOKENS = ['ETH', 'USDC', 'USDT', 'WBTC', 'ATOM', 'OSMO'];

// Handle amount input with real-time validation
function handleAmountInput() {
  const value = fromAmountInput.value;
  const validation = document.getElementById('fromValidation');

  // Clear previous validation
  validation.style.display = 'none';
  validation.className = 'input-validation';

  if (value && selectedFromToken) {
    const amount = parseFloat(value);

    if (isNaN(amount)) {
      showValidationError('Please enter a valid number');
      return;
    }

    if (amount < MIN_TRADE_AMOUNT) {
      showValidationError(`Minimum trade amount is ${MIN_TRADE_AMOUNT}`);
      return;
    }

    if (amount < 0) {
      showValidationError('Amount must be positive');
      return;
    }
  }

  calculateToAmount();
  updateSwapButton();
}

// Show validation error
function showValidationError(message) {
  const validation = document.getElementById('fromValidation');
  validation.textContent = message;
  validation.className = 'input-validation error';
  validation.style.display = 'block';
}

// Validate amount on blur
function validateAmount() {
  const value = fromAmountInput.value;
  if (!value) return;

  const amount = parseFloat(value);
  if (amount && amount < MIN_TRADE_AMOUNT) {
    fromAmountInput.value = MIN_TRADE_AMOUNT;
    calculateToAmount();
  }
}

// Open token selection modal
function openTokenModal(type) {
  currentModalType = type;
  const modal = document.getElementById('tokenModal');
  const tokenList = document.getElementById('tokenList');
  const searchInput = document.getElementById('tokenSearch');

  // Clear search
  searchInput.value = '';

  // Show popular tokens
  renderPopularTokens();

  // Populate token list
  renderTokenList(availableTokens);

  modal.style.display = 'flex';
  searchInput.focus();
}

// Render popular tokens
function renderPopularTokens() {
  const popularContainer = document.getElementById('popularTokens');
  const popularTokensAvailable = POPULAR_TOKENS.filter((token) => availableTokens.includes(token));

  popularContainer.innerHTML = popularTokensAvailable
    .map((token) => {
      const isDisabled =
        (currentModalType === 'from' && token === selectedToToken) ||
        (currentModalType === 'to' && token === selectedFromToken);

      return `
      <button class="popular-token ${isDisabled ? 'disabled' : ''}" 
              data-token="${token}" 
              ${isDisabled ? 'disabled' : ''}>
        <img src="${TOKEN_ICONS_BASE}${token}.svg" 
             alt="${token}" 
             class="token-icon"
             onerror="this.style.display='none'">
        <span>${token}</span>
      </button>
    `;
    })
    .join('');

  // Add click handlers
  popularContainer.querySelectorAll('.popular-token:not(.disabled)').forEach((btn) => {
    btn.addEventListener('click', () => selectToken(btn.dataset.token));
  });
}

// Close token modal
function closeTokenModal() {
  document.getElementById('tokenModal').style.display = 'none';
}

// Render token list
function renderTokenList(tokens) {
  const tokenList = document.getElementById('tokenList');

  tokenList.innerHTML = tokens
    .map((token) => {
      const tokenData = tokenPrices[token];
      const isDisabled =
        (currentModalType === 'from' && token === selectedToToken) ||
        (currentModalType === 'to' && token === selectedFromToken);

      return `
      <div class="token-item ${isDisabled ? 'disabled' : ''}" data-token="${token}">
        <div class="token-info">
          <img src="${TOKEN_ICONS_BASE}${token}.svg" 
               alt="${token}" 
               class="token-icon"
               onerror="this.style.display='none'">
          <div class="token-details">
            <div class="token-symbol">${token}</div>
            <div class="token-price">$${tokenData.price.toFixed(6)}</div>
          </div>
        </div>
        <div class="token-balance">0.00</div>
      </div>
    `;
    })
    .join('');

  // Add click handlers
  tokenList.querySelectorAll('.token-item:not(.disabled)').forEach((item) => {
    item.addEventListener('click', () => selectToken(item.dataset.token));
  });
}

// Filter tokens based on search
function filterTokens() {
  const searchTerm = document.getElementById('tokenSearch').value.toLowerCase();
  const filteredTokens = availableTokens.filter((token) => token.toLowerCase().includes(searchTerm));
  renderTokenList(filteredTokens);
}

// Select a token
function selectToken(token) {
  if (currentModalType === 'from') {
    selectedFromToken = token;
    updateTokenDisplay('from', token);
  } else {
    selectedToToken = token;
    updateTokenDisplay('to', token);
  }

  closeTokenModal();
  calculateToAmount();
  updateSwapButton();
  showSlippageSettings();
}

// Update token display
function updateTokenDisplay(type, token) {
  const symbolElement = document.getElementById(`${type}TokenSymbol`);
  const iconElement = document.getElementById(`${type}TokenIcon`);

  symbolElement.textContent = token;
  iconElement.src = `${TOKEN_ICONS_BASE}${token}.svg`;
  iconElement.style.display = 'block';
  iconElement.onerror = () => {
    iconElement.style.display = 'none';
  };
}

// Calculate output amount with slippage
function calculateToAmount() {
  if (!selectedFromToken || !selectedToToken || !fromAmountInput.value) {
    toAmountInput.value = '';
    hideSwapInfo();
    return;
  }

  const fromAmount = parseFloat(fromAmountInput.value);
  if (isNaN(fromAmount) || fromAmount <= 0) {
    toAmountInput.value = '';
    hideSwapInfo();
    return;
  }

  const fromPrice = tokenPrices[selectedFromToken].price;
  const toPrice = tokenPrices[selectedToToken].price;

  // Calculate ideal amount (without slippage)
  const idealAmount = (fromAmount * fromPrice) / toPrice;

  // Apply slippage to get realistic estimated output
  // In real DEXs, higher slippage tolerance often means you get a worse rate
  const slippageImpact = currentSlippage * 0.5; // 50% of slippage affects the rate
  const estimatedAmount = idealAmount * (1 - slippageImpact);

  // Minimum received is the worst-case scenario
  const minReceived = estimatedAmount * (1 - currentSlippage);

  toAmountInput.value = estimatedAmount.toFixed(8);

  // Show swap info
  showSwapInfo(fromPrice, toPrice, idealAmount, estimatedAmount, minReceived);
}

// Show swap information
function showSwapInfo(fromPrice, toPrice, idealAmount, estimatedAmount, minReceived) {
  const swapInfo = document.getElementById('swapInfo');
  const exchangeRate = document.getElementById('exchangeRate');
  const minReceivedElement = document.getElementById('minReceived');
  const priceImpactElement = document.getElementById('priceImpact');

  const idealRate = fromPrice / toPrice;
  const actualRate = estimatedAmount / parseFloat(fromAmountInput.value);
  const priceImpact = ((idealAmount - estimatedAmount) / idealAmount) * 100;

  exchangeRate.textContent = `1 ${selectedFromToken} = ${actualRate.toFixed(8)} ${selectedToToken}`;
  minReceivedElement.textContent = `${minReceived.toFixed(8)} ${selectedToToken}`;

  // Update price impact with realistic calculation
  if (priceImpact > 0.01) {
    priceImpactElement.textContent = `${priceImpact.toFixed(2)}%`;
    priceImpactElement.className = priceImpact > 3 ? 'price-impact high' : 'price-impact medium';
  } else {
    priceImpactElement.textContent = '< 0.01%';
    priceImpactElement.className = 'price-impact';
  }

  swapInfo.style.display = 'block';
}

// Hide swap information
function hideSwapInfo() {
  document.getElementById('swapInfo').style.display = 'none';
}

// Show slippage settings
function showSlippageSettings() {
  if (selectedFromToken && selectedToToken) {
    document.getElementById('slippageContainer').style.display = 'block';
  }
}

// Toggle slippage settings
function toggleSlippageSettings() {
  const options = document.getElementById('slippageOptions');
  options.style.display = options.style.display === 'none' ? 'block' : 'none';

  // Add event listeners for slippage buttons if not already added
  if (!options.dataset.listenersAdded) {
    options.querySelectorAll('.slippage-btn').forEach((btn) => {
      btn.addEventListener('click', () => setSlippage(parseFloat(btn.dataset.slippage)));
    });

    document.getElementById('customSlippage').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= 0 && value <= 50) {
        setSlippage(value / 100); // Convert percentage to decimal
      }
    });

    options.dataset.listenersAdded = 'true';
  }
}

// Set slippage tolerance
function setSlippage(slippage) {
  currentSlippage = slippage;

  // Update active button
  document.querySelectorAll('.slippage-btn').forEach((btn) => {
    btn.classList.remove('active');
    if (parseFloat(btn.dataset.slippage) === slippage) {
      btn.classList.add('active');
    }
  });

  // Recalculate amounts
  calculateToAmount();
}

// Switch tokens
function switchTokens() {
  if (!selectedFromToken || !selectedToToken) return;

  // Swap tokens
  const tempToken = selectedFromToken;
  selectedFromToken = selectedToToken;
  selectedToToken = tempToken;

  // Update display
  updateTokenDisplay('from', selectedFromToken);
  updateTokenDisplay('to', selectedToToken);

  // Recalculate
  calculateToAmount();
}

// Update swap button state
function updateSwapButton() {
  const hasTokens = selectedFromToken && selectedToToken;
  const hasValidAmount = fromAmountInput.value && parseFloat(fromAmountInput.value) >= MIN_TRADE_AMOUNT;
  const hasValidation = !document.getElementById('fromValidation').classList.contains('error');

  if (!hasTokens) {
    swapButton.disabled = true;
    swapButton.querySelector('.btn-text').textContent = 'Select Tokens';
  } else if (!hasValidAmount) {
    swapButton.disabled = true;
    swapButton.querySelector('.btn-text').textContent = 'Enter Amount';
  } else if (!hasValidation) {
    swapButton.disabled = true;
    swapButton.querySelector('.btn-text').textContent = 'Invalid Amount';
  } else {
    swapButton.disabled = false;
    swapButton.querySelector('.btn-text').textContent = `Swap ${selectedFromToken} for ${selectedToToken}`;
  }
}

// Handle swap execution
async function handleSwap() {
  if (!selectedFromToken || !selectedToToken || !fromAmountInput.value) return;

  const amount = parseFloat(fromAmountInput.value);
  if (isNaN(amount) || amount <= 0) return;

  // Show loading state
  const btnText = swapButton.querySelector('.btn-text');
  const btnSpinner = swapButton.querySelector('.btn-spinner');

  swapButton.disabled = true;
  btnText.style.display = 'none';
  btnSpinner.style.display = 'block';

  try {
    // Simulate network delay and potential errors
    await simulateSwapTransaction(amount);

    // Record transaction
    recordTransaction(amount);

    // Show success message
    showSuccessMessage();

    // Reset form
    resetForm();
  } catch (error) {
    showErrorMessage(error.message || 'Swap failed. Please try again.');
    console.error('Swap error:', error);
  } finally {
    // Reset button state
    btnText.style.display = 'block';
    btnSpinner.style.display = 'none';
    updateSwapButton();
  }
}

// Simulate swap transaction
async function simulateSwapTransaction(amount) {
  const delay = Math.random() * 2000 + 1000; // 1-3 second delay

  await new Promise((resolve) => setTimeout(resolve, delay));

  // Simulate potential failures (5% chance)
  if (Math.random() < 0.05) {
    const errors = ['Insufficient liquidity', 'Price impact too high', 'Network congestion', 'Transaction timeout'];
    throw new Error(errors[Math.floor(Math.random() * errors.length)]);
  }

  return true;
}

// Record transaction for history
function recordTransaction(amount) {
  const transaction = {
    id: Date.now(),
    fromToken: selectedFromToken,
    toToken: selectedToToken,
    fromAmount: amount,
    toAmount: parseFloat(toAmountInput.value),
    timestamp: new Date(),
    status: 'completed',
  };

  transactionHistory.unshift(transaction);
  if (transactionHistory.length > 10) {
    transactionHistory = transactionHistory.slice(0, 10);
  }

  // Show history toggle button after first transaction
  document.getElementById('historyToggle').style.display = 'flex';

  // Update history display if panel is open
  if (document.getElementById('historyPanel').style.display === 'block') {
    renderTransactionHistory();
  }
}

// Show success message
function showSuccessMessage() {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.className = 'success-message';
  errorDiv.textContent = `Successfully swapped ${fromAmountInput.value} ${selectedFromToken} for ${toAmountInput.value} ${selectedToToken}!`;
  errorDiv.style.display = 'block';

  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Show error message
function showErrorMessage(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Reset form
function resetForm() {
  fromAmountInput.value = '';
  toAmountInput.value = '';
  document.getElementById('fromValidation').style.display = 'none';
  hideSwapInfo();
  document.getElementById('slippageContainer').style.display = 'none';
}

// Show transaction history
function showTransactionHistory() {
  const historyPanel = document.getElementById('historyPanel');
  historyPanel.style.display = 'block';
  renderTransactionHistory();
}

// Hide transaction history
function hideTransactionHistory() {
  document.getElementById('historyPanel').style.display = 'none';
}

// Render transaction history
function renderTransactionHistory() {
  const historyList = document.getElementById('historyList');

  if (transactionHistory.length === 0) {
    historyList.innerHTML = `
      <div class="empty-history">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>No transactions yet</p>
        <span>Your swap history will appear here</span>
      </div>
    `;
    return;
  }

  historyList.innerHTML = transactionHistory
    .map((tx) => {
      const timeAgo = getTimeAgo(tx.timestamp);
      return `
      <div class="history-item">
        <div class="history-item-header">
          <div class="history-tokens">
            <img src="${TOKEN_ICONS_BASE}${tx.fromToken}.svg" 
                 alt="${tx.fromToken}" 
                 class="history-token-icon"
                 onerror="this.style.display='none'">
            <span class="history-arrow">→</span>
            <img src="${TOKEN_ICONS_BASE}${tx.toToken}.svg" 
                 alt="${tx.toToken}" 
                 class="history-token-icon"
                 onerror="this.style.display='none'">
          </div>
          <div class="history-status ${tx.status}">
            <div class="status-dot"></div>
            ${tx.status}
          </div>
        </div>
        <div class="history-item-details">
          <div class="history-amounts">
            <span class="from-amount">-${tx.fromAmount} ${tx.fromToken}</span>
            <span class="to-amount">+${tx.toAmount} ${tx.toToken}</span>
          </div>
          <div class="history-time">${timeAgo}</div>
        </div>
      </div>
    `;
    })
    .join('');
}

// Get time ago string
function getTimeAgo(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Handle keyboard navigation
function handleKeyNavigation(e) {
  if (e.key === 'Escape') {
    closeTokenModal();
    hideTransactionHistory();
  }

  if (e.key === 'Tab' && document.getElementById('tokenModal').style.display === 'flex') {
    e.preventDefault();
  }
}

// Add input validation and update button on amount change
fromAmountInput?.addEventListener('input', updateSwapButton);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
