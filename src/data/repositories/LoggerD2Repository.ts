import { D2Api, MetadataPick } from "@eyeseetea/d2-api/2.36";
import { D2TrackerEvent, DataValue } from "@eyeseetea/d2-api/api/trackerEvents";
// import { D2Api, MetadataPick, D2TrackerEvent, DataValue } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../../data/api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { Log } from "../../domain/entities/Log";
import { LoggerConfig, LoggerDataElements } from "../../domain/entities/LoggerConfig";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";
import { Id } from "../../domain/entities/Base";

const GLOBAL_ORGANISATION_UNIT_ID = "H8RixfF8ugH";
const IMPORT_STRATEGY_CREATE = "CREATE";
const TRACKER_IMPORT_JOB = "TRACKER_IMPORT_JOB";
const EVENT_PROGRAM_STATUS = "COMPLETED";

export class LoggerD2Repository implements LoggerRepository {
    api: D2Api | null = null;
    organisationUnitId: Id | null = null;
    programId: Id | null = null;
    messageId: Id | null = null;
    messageTypeId: Id | null = null;

    init(config: LoggerConfig): FutureData<void> {
        const {
            baseUrl,
            auth,
            programId,
            loggerDataElements,
            organisationUnitId = GLOBAL_ORGANISATION_UNIT_ID,
        } = config;

        const d2Api = new D2Api({ baseUrl: baseUrl, auth: auth });

        return checkProgramExists(d2Api, programId, loggerDataElements).flatMap(programExists => {
            if (programExists) {
                this.api = d2Api;
                this.programId = programId;
                this.messageId = loggerDataElements.messageId;
                this.messageTypeId = loggerDataElements.messageTypeId;
                this.organisationUnitId = organisationUnitId;
                return Future.success(undefined);
            } else {
                return Future.error(
                    new Error(`Logger not initialized properly. Please check configuration.`)
                );
            }
        });
    }

    log(log: Log): FutureData<void> {
        return this.getProgramStage().flatMap(programStage => {
            if (
                !this.programId ||
                !this.organisationUnitId ||
                !this.messageId ||
                !this.messageTypeId
            ) {
                return Future.error(
                    new Error(`Logger not initialized properly. Please check configuration.`)
                );
            }
            const d2EventProgram = mapLogToD2EventProgam({
                log,
                programId: this.programId,
                organisationUnitId: this.organisationUnitId,
                messageId: this.messageId,
                messageTypeId: this.messageTypeId,
                programStage,
            });
            return this.postApiTracker(d2EventProgram);
        });
    }

    private getProgramStage(): FutureData<D2ProgramStage> {
        if (!this.api || !this.programId) {
            return Future.error(
                new Error(`Logger not initialized properly. Please check configuration.`)
            );
        }
        return apiToFuture(
            this.api.models.programs.get({
                fields: programFields,
                filter: { id: { eq: this.programId } },
            })
        ).flatMap(response => {
            if (response.objects[0]?.programStages[0]) {
                return Future.success(response.objects[0]?.programStages[0]);
            } else {
                return Future.error(
                    new Error(`Program stage of program with id ${this.programId} not found`)
                );
            }
        });
    }

    private postApiTracker(d2EventProgram: D2TrackerEvent): FutureData<void> {
        if (!this.api) {
            return Future.error(
                new Error(`Logger not initialized properly. Please check configuration.`)
            );
        }
        return apiToFuture(
            this.api.tracker.postAsync(
                {
                    importStrategy: IMPORT_STRATEGY_CREATE,
                    skipRuleEngine: true,
                },
                { events: [d2EventProgram] }
            )
        ).flatMap(response => {
            if (!this.api) {
                return Future.error(
                    new Error(`Logger not initialized properly. Please check configuration.`)
                );
            }
            return apiToFuture(
                this.api.system.waitFor(TRACKER_IMPORT_JOB, response.response.id)
            ).flatMap(result => {
                if (result && result.status !== "ERROR") {
                    return Future.success(undefined);
                } else {
                    return Future.error(
                        new Error(
                            `Error: ${result?.validationReport?.errorReports?.at(0)?.message} `
                        )
                    );
                }
            });
        });
    }
}

function checkProgramExists(
    api: D2Api,
    programId: Id,
    loggerDataElements: LoggerDataElements
): FutureData<boolean> {
    return apiToFuture(
        api.models.programs.get({
            fields: programFields,
            filter: { id: { eq: programId } },
        })
    ).flatMap(response => {
        if (response.objects[0]?.programStages[0]) {
            const programStageDataElements =
                response.objects[0].programStages[0].programStageDataElements;
            const messageDataElement = programStageDataElements.find(
                ({ dataElement }) => dataElement.id === loggerDataElements?.messageId
            )?.dataElement;
            const messageTypeDataElement = programStageDataElements.find(
                ({ dataElement }) => dataElement.id === loggerDataElements?.messageTypeId
            )?.dataElement;

            const isMessageDataElementOk =
                messageDataElement?.valueType === "TEXT" ||
                messageDataElement?.valueType === "LONG_TEXT";

            const isMessageTypeDataElementOk = !!messageTypeDataElement?.optionSetValue;

            return Future.success(
                response.objects[0]?.id === programId &&
                    isMessageDataElementOk &&
                    isMessageTypeDataElementOk
            );
        } else {
            return Future.error(
                new Error(`Program with id ${programId} not found. Logger not initialized`)
            );
        }
    });
}

function mapLogToD2EventProgam(params: {
    log: Log;
    programId: Id;
    organisationUnitId: Id;
    messageId: Id;
    messageTypeId: Id;
    programStage: D2ProgramStage;
}): D2TrackerEvent {
    const { log, programId, messageId, messageTypeId, organisationUnitId, programStage } = params;
    const dataValues = getDataValuesFromLog({
        log,
        messageId,
        messageTypeId,
        programStage,
    });
    return {
        event: "",
        occurredAt: new Date().toISOString(),
        status: EVENT_PROGRAM_STATUS,
        program: programId,
        programStage: programStage.id,
        orgUnit: organisationUnitId,
        dataValues: dataValues,
    };
}

function getDataValuesFromLog(params: {
    log: Log;
    messageId: Id;
    messageTypeId: Id;
    programStage: D2ProgramStage;
}): DataValue[] {
    const { log, messageId, messageTypeId, programStage } = params;

    const messageTypeDataElement = programStage.programStageDataElements.find(
        ({ dataElement }) => dataElement.id === messageTypeId
    )?.dataElement;
    const messageTypeDataValue =
        messageTypeDataElement?.optionSet.options.find(
            option => option.name === log.messageType || option.code === log.messageType
        )?.code || log.messageType;

    return [
        {
            dataElement: messageId,
            value: log.message,
        },
        {
            dataElement: messageTypeId,
            value: messageTypeDataValue,
        },
    ];
}

const programFields = {
    id: true,
    programStages: {
        id: true,
        programStageDataElements: {
            dataElement: {
                id: true,
                code: true,
                valueType: true,
                optionSetValue: true,
                optionSet: { options: { name: true, code: true } },
            },
        },
    },
} as const;

type D2ProgramStage = MetadataPick<{
    programStages: {
        fields: typeof programFields.programStages;
    };
}>["programStages"][number];
