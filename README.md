# Rafflebox Logger

Standard JSON logger for Node services, wraps the Winston library.

## Usage

### Installation

1. `yarn add @rafflebox-technologies-inc/rafflebox-logger`

## Development

1. Clone this repo
2. `yarn`
3. `yarn link`
4. In the package you want to test in run `yarn link @rafflebox-technologies-inc/rafflebox-logger`
5. Build package with `yarn build` or turn on watch mode with `yarn watch`

## Testing

### `yarn test`

## Building

### `yarn build`

If you need to clear the build cache run `yarn clean`

## Publishing

1. Generate a Github PAT with access to package write + read + repo functions.
2. `./publish.sh`
3. Enter your Github PAT instead of the password when prompted.
