## [1.0.0] - 2024-04-18

### Added
- `BOT_QR_PATH` in `.env`. Absolute path to the bot.qr.png.

### Changed
- Moved bot server out into its own project

## [1.0.0] - 2024-04-16

### Added
- `AgentApiError` as a wrapper around `CustomError` with code "agent_api_error".
- Ensure value of `CashoutRequest.amount` is between 0 and 2**32 in request validator.

### Changed
- Fetch token duration from `.env`.
- Improve `HttpService` typing.
- Error code `error_transferencia` is now `agent_api_error`.
- Remove `expressPinoLogger` (middleware that logged errors to console).
- Truncate TOKENS table on token creation.

## [1.0.0] - 2024-04-16

### Changed
- Fetch token duration from `.env`

## [1.0.0] - 2024-04-15

### Changed
- Add `detail: response.data` to external API errors to ensure original response is included in error logs.
- Normalize API responses: 
    + All API responses and errors now return `{ status: number, code: string, data: any }`
    + All errors now extend `CustomError`

## [1.0.0] - 2024-04-12

### Added
- GET `/agent/balance/alquimia` endpoint to retrieve alquimia balance

### Changed
- `/agent/balance` => `agent/balance/casino`
- Check for file existence on AgentController.qr before attempting to open `bot.qr.png`

## [1.0.0] - 2024-04-09

### Added
- GET `/agent/on-call` endpoint to fetch on call status

## [1.0.0] - 2024-04-08

### Added
- `/agent/on-call` endpoint to activate/deactivate on call bot flow.

### Changed
- Renamed table `BOT_MESSAGES` to `BOT_FLOWS`.
- Added `on_call` and `active` columns to `BOT_FLOWS`.
    + Revert by undoing commit 6a02ea4.
- `seed.ts` now tries to find users on db before requesting details.
- `seed.ts` now inserts bot flows into db.


## [1.0.0] - 2024-04-05

### Added
- `logtailLogger` sends logs to logtail if ENV == 'production'.
- External API error codes
    + `agent_api_error` indicates something is not working on the casino's agent API
- Token misuse error codes
    + `wrong_token_type` someone is trying to use an access token on the `/auth/refresh` endpoint

### Changed
- Added optional `detail` field to `CustomError` for extra details relating to the original error
- Verify token signature in `AuthServices.refresh`

## [1.0.0] - 2024-04-04

### Added
- Test case to expect status code 429 on POST `/transactions/cashout`
- LOGTAIL_TOKEN to .env

### Changed
- Restrict Deposits to 1 every 24 hours in `PaymentsDAO.authorizeCreation`
- Upgrade express to 4.19.2
- Upgrade nodemon to 3.1.0
- Moved `TransactionsDAO.authorizeTransaction` into `PaymentsDAO.authorizeCreation`


## [1.0.0] - 2024-04-03

### Added
- Throw if Deposit with given `tracking_number` already exists in `DepositDAO.authorizeConfirmation`

### Changed
- Gave agent permission to confirm deposit in `DepositDAO.authorizeTransaction`.
- Added `Player` to `Deposit` object of `DepositResult`.
- Removed `TransactionsController.deleteDeposit`.
- Fixed `FinanceServices.finalizeDeposit` to stop it transfering coins on "confirmed" deposits
- GET `/agent/deposits/complete` is now GET `/agent/pending/depoists`

## [1.0.0] - 2024-04-02

### Added
- Option to pass id to `/agent/deposits` route te retrieve individual deposit.
- POST `/agent/deposits/:id` route to update deposit's `tracking_number`.

## [1.0.0] - 2024-04-01

### Added
- CHANGELOG.md.
- Deposit rate limiter (1 request with same `tracking_number` every 10 seconds).

### Changed
- Added .vscode/settings.json to .gitignore