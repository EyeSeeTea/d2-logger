import { D2Api, MetadataPick, D2TrackerEvent, DataValue } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { Id } from "../../domain/entities/Base";
import { DefaultLog } from "../../domain/entities/Log";
import { ProgramLoggerConfig } from "../../domain/entities/LoggerConfig";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

const IMPORT_STRATEGY_CREATE = "CREATE";
const TRACKER_IMPORT_JOB = "TRACKER_IMPORT_JOB";
const EVENT_PROGRAM_STATUS = "COMPLETED";

export class ProgramLoggerD2Repository implements LoggerRepository {
    api: D2Api;
    organisationUnitId: Id;
    programId: Id;
    messageId: Id;
    messageTypeId: Id;
    programStage: D2ProgramStage;

    constructor(config: ProgramLoggerConfig, d2ProgramStage: D2ProgramStage) {
        const { baseUrl, auth, programId, dataElements, organisationUnitId } = config;

        this.api = new D2Api({ baseUrl: baseUrl, auth: auth });
        this.programId = programId;
        this.messageId = dataElements.messageId;
        this.messageTypeId = dataElements.messageTypeId;
        this.organisationUnitId = organisationUnitId;
        this.programStage = d2ProgramStage;
    }

    static async init(config: ProgramLoggerConfig): Promise<ProgramLoggerD2Repository> {
        const api = new D2Api({ baseUrl: config.baseUrl, auth: config.auth });
        const d2ProgramStage = await ProgramLoggerD2Repository.getProgramStage(
            api,
            config.programId
        ).toPromise();
        return new ProgramLoggerD2Repository(config, d2ProgramStage);
    }

    static getProgramStage(api: D2Api, programId: Id): FutureData<D2ProgramStage> {
        return apiToFuture(
            api.models.programs.get({
                fields: programFields,
                filter: { id: { eq: programId } },
            })
        ).flatMap(response => {
            const programStage = response.objects[0]?.programStages[0];
            if (programStage) {
                return Future.success(programStage);
            } else {
                return Future.error(
                    new Error(`Program stage of program with id ${programId} not found`)
                );
            }
        });
    }

    log(log: DefaultLog): FutureData<void> {
        if (!this.programStage) {
            return Future.success(undefined);
        }

        const d2EventProgram = this.mapLogToD2EventProgam({
            ...this,
            log,
        });
        return this.postApiTracker([d2EventProgram]);
    }

    batchLog(logs: DefaultLog[]): FutureData<void> {
        const d2EventsProgram = logs.map(log =>
            this.mapLogToD2EventProgam({
                ...this,
                log,
            })
        );
        return this.postApiTracker(d2EventsProgram);
    }

    private postApiTracker(d2EventsProgram: D2TrackerEvent[]): FutureData<void> {
        return apiToFuture(
            this.api.tracker.postAsync(
                {
                    importStrategy: IMPORT_STRATEGY_CREATE,
                    skipRuleEngine: true,
                },
                { events: d2EventsProgram }
            )
        ).flatMap(response => {
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

    private mapLogToD2EventProgam(params: {
        log: DefaultLog;
        programId: Id;
        organisationUnitId: Id;
        messageId: Id;
        messageTypeId: Id;
        programStage: D2ProgramStage;
    }): D2TrackerEvent {
        const { log, programId, messageId, messageTypeId, organisationUnitId, programStage } =
            params;
        const dataValues = this.getDataValuesFromLog({
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

    private getDataValuesFromLog(params: {
        log: DefaultLog;
        messageId: Id;
        messageTypeId: Id;
        programStage: D2ProgramStage;
    }): DataValue[] {
        const { log, messageId, messageTypeId, programStage } = params;

        const messageTypeDataElement = programStage.programStageDataElements.find(
            ({ dataElement }) => dataElement.id === messageTypeId
        )?.dataElement;
        const messageTypeDataValue =
            messageTypeDataElement?.optionSet?.options.find(
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
