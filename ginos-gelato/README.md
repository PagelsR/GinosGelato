# Gino's Gelato

Welcome to Gino's Gelato, an ice cream shop application where users can customize their ice cream experience by selecting between cones or cups, choosing up to three flavors, and adding toppings. This project is built using React with TypeScript for the frontend and .NET for the backend.

## Features

- **Ice Cream Customization**: Users can select their preferred container (cone or cup), choose up to three flavors, and add various toppings.
- **Cart Functionality**: Users can add their customized ice cream to a cart, view cart items, and proceed to checkout.
- **Responsive Design**: The application is styled using Tailwind CSS for a modern and responsive user interface.

## Project Structure

```
ginos-gelato
├── client                # Frontend application
│   ├── src               # Source files for the React app
│   ├── public            # Public assets
│   ├── package.json      # NPM configuration
│   ├── tsconfig.json     # TypeScript configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── vite.config.ts    # Vite configuration
└── server                # Backend application
    ├── Controllers       # API controllers
    ├── Models            # Data models
    ├── Services          # Business logic services
    ├── Data              # Database context
    ├── Program.cs        # Entry point for the .NET application
    └── appsettings.json   # Configuration settings
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- .NET SDK (version 5.0 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ginos-gelato
   ```

2. Navigate to the client directory and install dependencies:
   ```
   cd client
   npm install
   ```

3. Navigate to the server directory and restore dependencies:
   ```
   cd server
   dotnet restore
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   dotnet run
   ```

2. In a new terminal, start the frontend application:
   ```
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.