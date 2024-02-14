# d2-logger

DHIS2 library that allows a certain application to register logs as events in a DHIS2 event program, tracker program or simply display logs on the console.

## Usage

There are three types of logger output:

1. Using a DHIS2 events program to register the logs as events:

    You will need to have and existing event program in DHIS2 with the following data elements with value type Text: Message and MessageType. MessageType would be and option set with the following options: "Error", "Warn", "Success", "Info" and "Debug".

    Therefore, the following configuration will be passed to the logger:

    ```typescript
    import { initLogger } from "@eyeseetea/d2-logger";

    const logger = await initLogger<string>({
        type: "program",
        debug: true,
        baseUrl: "https://play.dhis2.org/40.2.2",
        auth: "admin:district",
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
    import { initLogger } from "@eyeseetea/d2-logger";

    const logger = await initLogger<string>({
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

    You will need to have and existing tracker program in DHIS2 with the following data elements with value type Text: Message and MessageType. MessageType would be and option set with the following options: "Error", "Warn", "Success", "Info" and "Debug".

    Therefore, the following configuration will be passed to the logger:

    ```typescript
    import { initLogger, TrackerProgramContent } from "@eyeseetea/d2-logger";

    const logger = await initLogger<TrackerProgramContent>({
        type: "trackerProgram",
        debug: true,
        baseUrl: "https://play.dhis2.org/40.2.2",
        auth: "admin:district",
        trackerProgramId: "", // Tracker program Id where register the logs as events
        messageTypeId: "", // Id of the data element which is the types of message
    });
    ```

    Notice:

    - Please note that `auth` is not mandatory if it's used in the DHIS2 app instead of in a script.
    - If `debug` is `true`, then in addition to registering the logs in the DHIS2 program, they will also be displayed on the console.
    - `messageTypeId` is not mandatory. If the message type is not provided, "Error", "Warn", "Success", "Info" and "Debug" will not be logged in the tracker program.

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
