import { EventStatus } from "@eyeseetea/d2-api";
import { D2Api, MetadataPick, D2TrackerEvent, DataValue } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { Id } from "../../domain/entities/Base";
import { TrackerProgramLog, MessageType, TrackerProgramMessages } from "../../domain/entities/Log";
import { TrackerProgramLoggerConfig } from "../../domain/entities/LoggerConfig";
import { LoggerRepository } from "../../domain/repositories/LoggerRepository";

const IMPORT_STRATEGY_CREATE = "CREATE";
const TRACKER_IMPORT_JOB = "TRACKER_IMPORT_JOB";
const TRACKER_EVENT_DEFAULT_STATUS = "ACTIVE";
const TRACKER_ORG_UNIT_ALL_MODE = "ALL";

export class TrackerProgramLoggerD2Repository implements LoggerRepository {
    api: D2Api;
    trackerProgramId: Id;
    messageTypeId: Id | undefined;

    constructor(config: TrackerProgramLoggerConfig) {
        const { baseUrl, auth, trackerProgramId, messageTypeId } = config;

        this.api = new D2Api({ baseUrl: baseUrl, auth: auth });
        this.trackerProgramId = trackerProgramId;
        this.messageTypeId = messageTypeId;
    }

    log(log: TrackerProgramLog): FutureData<void> {
        const { programStageId, trackedEntityId, enrollmentId } = log.config;
        return Future.joinObj({
            programStage: this.getProgramStage(programStageId),
            organisationUnitId: this.getOrganisationUnitId(trackedEntityId, enrollmentId),
        }).flatMap(({ programStage, organisationUnitId }) => {
            const d2TrackerEvent = this.mapLogToD2TrackerEvent(
                log,
                programStage,
                organisationUnitId
            );
            return this.postApiTracker(d2TrackerEvent);
        });
    }

    private getProgramStage(programStageId: Id): FutureData<D2ProgramStage> {
        return apiToFuture(
            this.api.models.programStages.get({
                fields: programStageFields,
                filter: { id: { eq: programStageId } },
            })
        ).flatMap(response => {
            const programStage = response.objects[0];
            if (programStage) {
                return Future.success(programStage);
            } else {
                return Future.error(
                    new Error(
                        `Program stage with id ${programStageId} from program id ${this.trackerProgramId} not found`
                    )
                );
            }
        });
    }

    private getOrganisationUnitId(trackedEntity: Id, enrollmentId: Id): FutureData<Id> {
        return apiToFuture(
            this.api.tracker.enrollments.get({
                ouMode: TRACKER_ORG_UNIT_ALL_MODE,
                fields: { orgUnit: true },
                program: this.trackerProgramId,
                trackedEntity: trackedEntity,
                enrollment: enrollmentId,
            })
        ).flatMap(response => {
            const orgUnitId = response.instances[0]?.orgUnit;
            if (orgUnitId) {
                return Future.success(orgUnitId);
            } else {
                return Future.error(
                    new Error(
                        `Organisation unit id in enrollment id ${enrollmentId} in trackedEntity id ${trackedEntity} from program id ${this.trackerProgramId} not found`
                    )
                );
            }
        });
    }

    private mapLogToD2TrackerEvent(
        log: TrackerProgramLog,
        programStage: D2ProgramStage,
        organisationUnitId: Id
    ): D2TrackerEvent {
        const { programStageId, trackedEntityId, enrollmentId, eventStatus } = log.config;
        const dataValues = this.getDataValuesFromLog(programStage, log.messages, log.messageType);
        const event = {
            event: "",
            status: (eventStatus as EventStatus) || (TRACKER_EVENT_DEFAULT_STATUS as EventStatus), // TODO: remove once d2-api EventStatus has SCHEDULE
            program: this.trackerProgramId,
            programStage: programStageId,
            enrollment: enrollmentId,
            trackedEntity: trackedEntityId,
            orgUnit: organisationUnitId,
            occurredAt: new Date().toISOString(),
            dataValues: dataValues,
        };
        return eventStatus === "SCHEDULE"
            ? {
                  ...event,
                  scheduledAt: new Date().toISOString(),
              }
            : event;
    }

    private getDataValuesFromLog(
        programStage: D2ProgramStage,
        messages: TrackerProgramMessages[],
        messageType: MessageType
    ): DataValue[] {
        const messageTypeDataElement = programStage.programStageDataElements.find(
            ({ dataElement }) => dataElement.id === this.messageTypeId
        )?.dataElement;

        const messageTypeDataValue =
            messageTypeDataElement?.optionSet?.options.find(
                option => option.name === messageType || option.code === messageType
            )?.code || messageType;

        const dataValues: DataValue[] =
            this.messageTypeId && messageTypeDataElement
                ? [
                      {
                          dataElement: this.messageTypeId,
                          value: messageTypeDataValue,
                      },
                  ]
                : [];

        return messages.reduce(
            (acc: DataValue[], message: TrackerProgramMessages): DataValue[] => [
                ...acc,
                {
                    dataElement: message.id,
                    value: message.value,
                },
            ],
            dataValues
        );
    }

    private postApiTracker(d2TrackerEvent: D2TrackerEvent): FutureData<void> {
        return apiToFuture(
            this.api.tracker.postAsync(
                {
                    importStrategy: IMPORT_STRATEGY_CREATE,
                    skipRuleEngine: true,
                },
                { events: [d2TrackerEvent] }
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
}

const programStageFields = {
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
} as const;

type D2ProgramStage = MetadataPick<{
    programStages: {
        fields: typeof programStageFields;
    };
}>["programStages"][number];
