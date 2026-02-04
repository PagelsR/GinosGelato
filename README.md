# 🍨 Gino's Gelato

A full-stack ice cream shop application for building custom gelato creations, managing a cart, and placing orders.

## Features

- **Build Your Gelato**: Choose cone or cup, up to 3 flavors, and toppings
- **Cart Management**: Add, update, and remove creations from the cart
- **Checkout Flow**: Collect order details and submit to the API
- **Responsive UI**: Polished, mobile-friendly layout with a gelato-themed design

## Technology Stack

### Backend
- .NET 8 ASP.NET Core Web API
- Entity Framework Core (In-Memory)
- RESTful API architecture

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS with custom gelato theme
- React Context API for state management

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- PowerShell (Windows) or Bash (Linux/Mac)

## Quick Start

### 1. Clone and Navigate

```powershell
cd c:\Users\RandyPagels\Repos\GinosGelato
```

### 2. Backend Setup

```powershell
# Navigate to API folder
cd ginos-gelato\server

# Run the API (default port: 5000)
dotnet run
```

The API will be available at: `http://localhost:5000`
Swagger UI will be available at: `http://localhost:5000/swagger`

### 3. Frontend Setup

Open a **new terminal** and run:

```powershell
# Navigate to client folder
cd c:\Users\RandyPagels\Repos\GinosGelato\ginos-gelato\client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Usage

1. **Build a Gelato**:
  - Choose a container (cone or cup)
  - Select up to three flavors
  - Add toppings
  - Add the creation to your cart

2. **Manage Your Cart**:
  - Review items in the cart
  - Update quantities or remove items

3. **Checkout**:
  - Enter order details
  - Submit your order

## API Endpoints

### Flavors
- `GET /api/flavors` - Get all flavors

### Toppings
- `GET /api/toppings` - Get all toppings

### Orders
- `POST /api/orders` - Create a new order

## Project Structure

```
ginos-gelato/
  client/   # React + Vite frontend
  server/   # .NET 8 Web API backend
```

## License

This project is for demonstration purposes.

## Contributing

This is a prototype application. Feel free to fork and extend!

---

**Built with ❤️ for gelato lovers**
