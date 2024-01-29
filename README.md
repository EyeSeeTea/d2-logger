# d2-logger

DHIS2 library that allows a certain application to register logs as events in a DHIS2 program or display logs on the console.

## Usage

There are two types of logger output:

1. Using a DHIS2 events program to register the logs:

    You will need to have and existing event program in DHIS2 with the following data elements with value type Text: Message and MessageType. MessageType would be and option set with the following options: "Error", "Warn", "Success", "Info" and "Debug".

    Therefore, the following configuration will be passed to the logger:

    ```typescript
    import { Logger } from "@eyeseetea/d2-logger";

    const logger = new Logger();

    await logger.init({
        type: "program",
        debug: true,
        baseUrl: "https://play.dhis2.org/40.2.2",
        auth: "admin:district",
        organisationUnitId: "H8RixfF8ugH",
        programId: "zARxYmOD18Z",
        dataElements: {
            messageId: "BjUzF5E4eR8",
            messageTypeId: "NpS5LoLuhgS",
        },
    });
    ```

    Notice:

    - Please note that `auth` is not mandatory if it's used in the DHIS2 app instead of in a script.
    - If `debug` is `true`, then in addition to registering the logs in the DHIS2 program, they will also be displayed on the console.

2. Displaying the logs only in the console:

    ```typescript
    import { Logger } from "@eyeseetea/d2-logger";

    const logger = new Logger();

    logger.init({
        type: "console",
    });
    ```

To log messages:

```typescript
logger.debug("This is a Debug message");
logger.info("This is an Info message");
logger.success("This is a Success message");
logger.warn("This is a Warn message");
logger.error("This is an Error message");
```

## Development

```bash
$ nvm use # Selects node in .nvmrc
$ yarn install
$ yarn build
$ cd build
$ yarn link
```

On another app:

```bash
$ yarn link "@eyeseetea/d2-logger"
```

## Tests

```bash
$ yarn test
```

## Code quality

```bash
$ yarn code-quality
```

## Publish

First, change in package.json the new version and then run:

```bash
$ yarn release
```
