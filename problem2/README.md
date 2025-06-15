# Currency Swap Application

A modern, intuitive cryptocurrency swap interface built with Vite and vanilla JavaScript. This application provides a seamless user experience for swapping between different cryptocurrencies with real-time price data and comprehensive validation.

## 🚀 Features

### Core Functionality

- **Real-time Token Prices**: Fetches live cryptocurrency prices from the Switcheo API
- **Token Selection**: Interactive modal with search functionality and popular token shortcuts
- **Swap Calculation**: Real-time calculation of exchange rates and output amounts
- **Token Switching**: One-click token pair reversal with smooth animations

### User Experience Enhancements

- **Input Validation**: Real-time validation with helpful error messages
- **Slippage Protection**: Configurable slippage tolerance settings
- **Loading States**: Smooth loading animations and progress indicators
- **Transaction Simulation**: Realistic swap execution with potential error scenarios
- **Success/Error Feedback**: Clear feedback messages for all user actions

### Design & Accessibility

- **Modern UI**: Dark theme with gradient backgrounds and glassmorphism effects
- **Responsive Design**: Optimized for desktop and mobile devices
- **Smooth Animations**: Carefully crafted animations and transitions
- **Keyboard Navigation**: Full keyboard accessibility support
- **Visual Feedback**: Hover states, focus indicators, and interactive elements

### Technical Features

- **Token Icons**: Integration with Switcheo token icon repository
- **Popular Tokens**: Quick access to commonly used cryptocurrencies
- **Transaction History**: Simulated transaction recording (in-memory)
- **Error Handling**: Robust error handling with user-friendly messages
- **Performance**: Optimized API calls and efficient state management

## 🛠️ Technology Stack

- **Build Tool**: Vite (for fast development and optimized builds)
- **JavaScript**: Modern ES6+ features with async/await
- **CSS**: Custom CSS with CSS variables and advanced animations
- **Fonts**: Inter font family for modern typography
- **Icons**: SVG icons and token images from external sources

## 📦 Installation & Setup

1. **Clone or navigate to the project directory**:

   ```bash
   cd problem2
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Start the development server**:

   ```bash
   yarn dev
   ```

4. **Build for production**:

   ```bash
   yarn build
   ```

5. **Preview production build**:
   ```bash
   yarn preview
   ```

## 🎯 Usage

### Basic Swap Flow

1. **Select From Token**: Click on the "From" token selector to choose your source currency
2. **Enter Amount**: Input the amount you want to swap
3. **Select To Token**: Choose your destination currency
4. **Review Details**: Check exchange rate, slippage, and minimum received amount
5. **Execute Swap**: Click the swap button to simulate the transaction

### Advanced Features

- **Search Tokens**: Use the search functionality in the token selection modal
- **Quick Selection**: Choose from popular tokens for faster selection
- **Adjust Slippage**: Customize slippage tolerance using the settings gear icon
- **Switch Tokens**: Use the arrow button to quickly reverse token pairs

## 🎨 Design Highlights

### Visual Design

- **Color Scheme**: Modern dark theme with purple/blue primary colors
- **Typography**: Inter font family for excellent readability
- **Spacing**: Consistent spacing system using CSS custom properties
- **Shadows**: Layered shadows for depth and visual hierarchy

### Interactive Elements

- **Hover Effects**: Subtle hover animations on interactive elements
- **Focus States**: Clear focus indicators for keyboard navigation
- **Loading States**: Smooth loading spinners and skeleton screens
- **Micro-interactions**: Small animations that enhance user experience

### Mobile Optimization

- **Responsive Layout**: Adapts to different screen sizes
- **Touch-friendly**: Appropriately sized touch targets
- **Performance**: Optimized for mobile performance

## 🔧 Configuration

### API Configuration

The application fetches token prices from:

```javascript
const PRICES_API = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';
```

### Swap Configuration

```javascript
const MAX_SLIPPAGE = 0.01; // 1%
const MIN_TRADE_AMOUNT = 0.000001;
```

### Popular Tokens

```javascript
const POPULAR_TOKENS = ['ETH', 'USDC', 'USDT', 'WBTC', 'ATOM', 'OSMO'];
```

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **CSS Features**: CSS Grid, Flexbox, Custom Properties, Backdrop Filter

## 🚨 Error Handling

The application includes comprehensive error handling for:

- **Network Issues**: Failed API requests with retry options
- **Invalid Input**: Real-time validation with helpful error messages
- **Token Selection**: Prevention of invalid token pair selections
- **Transaction Failures**: Simulated transaction errors with appropriate feedback

## 🔮 Future Enhancements

Potential improvements for production use:

- **Wallet Integration**: Connect to Web3 wallets for real transactions
- **Price Charts**: Integration with charting libraries for price history
- **Order History**: Persistent transaction history with database storage
- **Multi-chain Support**: Support for multiple blockchain networks
- **Advanced Orders**: Limit orders and stop-loss functionality

## 📝 Development Notes

### Code Organization

- **main.js**: Core application logic and state management
- **style.css**: Complete styling with CSS custom properties
- **index.html**: HTML structure with meta tags and font imports

### State Management

- **Token Selection**: Managed through global variables and event handlers
- **Validation**: Real-time validation with immediate user feedback
- **UI Updates**: Reactive updates based on user interactions

### Performance Considerations

- **API Calls**: Efficient token price fetching with error handling
- **DOM Updates**: Minimal DOM manipulation for smooth performance
- **Animations**: Hardware-accelerated CSS animations

---

## 🏆 Bonus Features Implemented

✅ **Vite Integration**: Built with Vite for optimal development experience  
✅ **Modern UI/UX**: Attractive, intuitive interface with smooth animations  
✅ **Input Validation**: Comprehensive validation with real-time feedback  
✅ **Loading Indicators**: Professional loading states throughout the app  
✅ **Error Handling**: Robust error handling with user-friendly messages  
✅ **Token Icons**: Integration with Switcheo token icon repository  
✅ **Popular Tokens**: Quick access shortcuts for common cryptocurrencies  
✅ **Slippage Protection**: Configurable slippage tolerance settings  
✅ **Transaction Simulation**: Realistic swap execution with potential failures  
✅ **Responsive Design**: Optimized for all device sizes  
✅ **Keyboard Navigation**: Full accessibility support

This application demonstrates modern frontend development practices with a focus on user experience, performance, and maintainability.
