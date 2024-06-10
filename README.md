# d2-logger

DHIS2 library that allows a certain application to register logs as events in a DHIS2 event program, tracker program or simply display logs on the console.

## Usage

There are three types of logger output:

1. Using a DHIS2 events program to register the logs as events:

    You will need to have and existing event program in DHIS2 with the following data elements with value type Text: Message and MessageType. MessageType would be and option set with the following options: "Error", "Warn", "Success", "Info" and "Debug".

    Therefore, the following configuration will be passed to the logger:

    ```typescript
    import { initLogger, ProgramLogger } from "@eyeseetea/d2-logger";

    const logger: ProgramLogger = await initLogger({
        type: "program",
        debug: true,
        baseUrl: "https://play.dhis2.org/40.2.2",
        auth: {
            username: "admin",
            password: "district",
        },
        organisationUnitId: "", // Organisation unit Id where the program is registered
        programId: "", // Event program Id where register the logs as events
        dataElements: {
            messageId: "", // Id of the data element which is the message
            messageTypeId: "", // Id of the data element which is the types of message
        },
    });
    ```

    Notice:

    - Please note that `auth` is not mandatory if it's used in the DHIS2 app instead of in a script.
    - If `debug` is `true`, then in addition to registering the logs in the DHIS2 program, they will also be displayed on the console.

    To log messages:

    ```typescript
    logger.debug("This is a Debug message");
    logger.info("This is an Info message");
    logger.success("This is a Success message");
    logger.warn("This is a Warn message");
    logger.error("This is an Error message");
    ```

2. Displaying the logs only in the console:

    ```typescript
    import { initLogger, ConsoleLogger } from "@eyeseetea/d2-logger";

    const logger: ConsoleLogger = await initLogger({
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

3. Using a DHIS2 tracker program to register the logs as events:

    You will need to have and existing tracker program in DHIS2. In order to be able to log the log type (Error", "Warn", "Success", "Info" and "Debug") in the event, it would be necessary to create a data element and assign it to the program stages, and then add this data element id to the configuration.

    Therefore, the following configuration will be passed to the logger:

    ```typescript
    import { initLogger, TrackerProgramLogger } from "@eyeseetea/d2-logger";

    const logger: TrackerProgramLogger = await initLogger({
        type: "trackerProgram",
        debug: true,
        baseUrl: "https://play.dhis2.org/40.2.2",
        auth: {
            username: "admin",
            password: "district",
        },
        trackerProgramId: "", // Tracker program Id where register the logs as events
        messageTypeId: "", // Id of the data element which is the types of log
    });
    ```

    Notice:

    - Please note that `auth` is not mandatory if it's used in the DHIS2 app instead of in a script.
    - If `debug` is `true`, then in addition to registering the logs in the DHIS2 program, they will also be displayed on the console.
    - `messageTypeId` is not mandatory. If the log type is not provided, "Error", "Warn", "Success", "Info" and "Debug" will not be logged in the event.

    To log messages:

    ```typescript
    logger.debug({
        config: {
            trackedEntityId: "", // Tracked entity Id where register the logs as events
            programStageId: "", // Program Stage Id where register the logs as events
            enrollmentId: "", // Enrollment Id where register the logs as events
            eventStatus: "", // event status by default is "ACTIVE" if not specified, but it can also be "COMPLETED", "VISITED", "SCHEDULE", "OVERDUE" or "SKIPPED"
        },
        messages: [
            {
                id: "", // Data Element Id of the Data Value of the event to be logged
                value: "This is a Debug message",
            },
        ],
    });

    logger.info({
        config: {
            trackedEntityId: "", // Tracked entity Id where register the logs as events
            programStageId: "", // Program Stage Id where register the logs as events
            enrollmentId: "", // Enrollment Id where register the logs as events
            eventStatus: "", // event status by default is "ACTIVE" if not specified, but it can also be "COMPLETED", "VISITED", "SCHEDULE", "OVERDUE" or "SKIPPED"
        },
        messages: [
            {
                id: "", // Data Element Id of the Data Value of the event to be logged
                value: "This is an Info message",
            },
        ],
    });

    logger.success({
        config: {
            trackedEntityId: "", // Tracked entity Id where register the logs as events
            programStageId: "", // Program Stage Id where register the logs as events
            enrollmentId: "", // Enrollment Id where register the logs as events
            eventStatus: "", // event status by default is "ACTIVE" if not specified, but it can also be "COMPLETED", "VISITED", "SCHEDULE", "OVERDUE" or "SKIPPED"
        },
        messages: [
            {
                id: "", // Data Element Id of the Data Value of the event to be logged
                value: "This is a Success message",
            },
        ],
    });

    logger.warn({
        config: {
            trackedEntityId: "", // Tracked entity Id where register the logs as events
            programStageId: "", // Program Stage Id where register the logs as events
            enrollmentId: "", // Enrollment Id where register the logs as events
            eventStatus: "", // event status by default is "ACTIVE" if not specified, but it can also be "COMPLETED", "VISITED", "SCHEDULE", "OVERDUE" or "SKIPPED"
        },
        messages: [
            {
                id: "", // Data Element Id of the Data Value of the event to be logged
                value: "This is a Warn message",
            },
        ],
    });

    logger.error({
        config: {
            trackedEntityId: "", // Tracked entity Id where register the logs as events
            programStageId: "", // Program Stage Id where register the logs as events
            enrollmentId: "", // Enrollment Id where register the logs as events
            eventStatus: "", // event status by default is "ACTIVE" if not specified, but it can also be "COMPLETED", "VISITED", "SCHEDULE", "OVERDUE" or "SKIPPED"
        },
        messages: [
            {
                id: "", // Data Element Id of the Data Value of the event to be logged
                value: "This is an Error message",
            },
        ],
    });
    ```

    Notice:

    - `messages` is an array of objects with the id of the Data Element and a string value. These would be created as Data Values in the event.
    - `eventStatus` is not mandatory. By deafult "ACTIVE" will be the default status of the event.

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
