# Contributing

Thank you for your interest in contributing!

## Development

Install dependencies:

```
pnpm install
```

Run the interface locally:

```
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

## Production build

```
pnpm build
```

Serve the production build:

```
pnpm start
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

## Release

Build and push a multi-platform image (`linux/amd64` for Linux servers,
`linux/arm64` for Apple Silicon Macs) to Docker Hub:

```
./build.sh 0.1.3
```

Then bump the image tag in `docker-compose.yml`.
