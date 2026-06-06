# Contributing

Thank you for your interest in contributing!

## Development

Install dependencies:

```
npm install
```

Run the interface locally:

```
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

## Production build

```
npm run build
```

Serve the production build:

```
npm start
```

## Docker

Build and run with Docker Compose:

```
docker compose up --build
```

Navigate to [http://localhost:3013](http://localhost:3013).

## Guidelines

- **Security**: avoid adding unnecessary dependencies due to supply chain risk
- **Reproducibility**: anyone can build the interface — avoid adding steps to the build process
- **Decentralization**: anyone can run the interface
