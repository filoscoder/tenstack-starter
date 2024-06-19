## [1.0.0] - 2024-06-13

### Added
- GET `/analytics/summary`

## [1.0.0] - 2024-06-11

### Changed
- Paginate `/analytics`
- Add Player to GET `/deposit/:id` response
- Normalize output of resource listing endpoints to `{ result, total }`

## [1.0.0] - 2024-05-29

### Added
- GET `/transactions/deposit/pending-coin-transfers`

## [1.0.0] - 2024-05-28

### Added
- `/agent/reset-player-password` for the agent to reset players' passwords.

### Changed
- Split GET `/agent/deposits/:id?` into GET `/transactions/deposit/:id` and GET `/transactions/deposit`.
- Move POST `/agent/deposits/:id` into `/transactions/deposit/:id`.
- Return `{ deposits, totalDeposits }` from GET `/transactions/deposit`.
- Move GET `/agent/payments` to GET `/transactions/payment`
- Return `{ payments, totalPayments }` from GET `/transactions/payment`.

## [1.0.0] - 2024-05-27

### Changed
- Improve `movile_number` validator: must be a numerical string of up to 20 characters

## [1.0.0] - 2024-05-15

### Changed
- GET `/players?page=1&items_per_page=20&search=<string>&sort_column=<string>&sort_direction=<asc|desc>` now returns a list of players. Requires agent role.
- Mock call to `PlayerServices.createCasinoPlayer` to avoid creating players on casino on every test run.

### Added
- GET `/players/:id` returns player details.
- POST `/players/:id` to update a player. Requires agent role.

## [1.0.0] - 2024-05-07

### Changed
- Stop sending email to casino on player creation.

## [1.0.0] - 2024-05-06

### Added
- Rate limiter on POST `/payments/:id/release` (1 every 10 seconds per payment ID).
- `dirty` column to `PAYMENTS` table.

### Changed
- Replace `agent/payments/:id/paid` with `agent/payments/:id/release`.

## [1.0.0] - 2024-05-04

### Added
- Bank account number (CLABE) structure validator.

## [1.0.0] - 2024-05-03

### Changed 
- `invalid_credentials` login response is now 400 instead of 404.
- Split `transactionsRouter` into `paymentsRouter` and `depositsRouter`.
- Split `TransactionsController` into `PaymentController` and `DepositController`.
- Split `FinanceServices` into `PaymentServices` and `DepositServices`.


## [1.0.0] - 2024-05-02

### Changed
- Improve `FinanceServices.alquimiaDepositLookup` by including `clave_rastreo` in query parameters. Reducing the search to a single query.
- Drop ALQ_DEPOSITS table.

## [1.0.0] - 2024-04-29

### Added
- Installed nodemailer npm package

### Changed
- Make PLAYER.email a non null field in Prisma model

## [1.0.0] - 2024-04-26

### Added
- POST `/auth/reset` to reset password. Requires player role.

## [1.0.0] - 2024-04-24

### Changed
- Moved `/agent/qr/:name` to `/bot/:name?`.
- Return bot names from `/bot` when `:name` param is omitted.

## [1.0.0] - 2024-04-23

### Added
- GET and POST `/agent/support` to view and update support telephone numbers. 

### Changed
- Improve `seed.ts` to allow updating credentials
- Move bot seeding logic into bot repo

## [1.0.0] - 2024-04-20

### Changed
- Remove `owner_id` from BANK_ACCOUNT
- Remove unique index from BANK_ACCOUNT.bankName and BANK_ACCOUNT.bankAlias

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