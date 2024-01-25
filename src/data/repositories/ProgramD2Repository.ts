import { D2Api } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../../data/api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { Id } from "../../domain/entities/Base";
import { ProgramLoggerConfig, LoggerDataElements } from "../../domain/entities/LoggerConfig";
import { ProgramRepository } from "../../domain/repositories/ProgramRepository";

export class ProgramD2Repository implements ProgramRepository {
    checkConfig(config: ProgramLoggerConfig): FutureData<boolean> {
        const { baseUrl, auth, programId, loggerDataElements } = config;

        const d2Api = new D2Api({ baseUrl: baseUrl, auth: auth });

        return this.checkProgramIsOk(d2Api, programId, loggerDataElements).flatMap(programIsOk => {
            if (programIsOk) {
                return Future.success(programIsOk);
            } else {
                return Future.error(
                    new Error(
                        `Logger not initialized properly. Please check configuration of program ${programId}, message data element ${loggerDataElements.messageId} and message type data element ${loggerDataElements.messageTypeId}.`
                    )
                );
            }
        });
    }

    private checkProgramIsOk(
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
            if (response?.objects[0]?.programStages[0]) {
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
                    new Error(
                        `Program with id ${programId} and its program stage not found. Logger not initialized`
                    )
                );
            }
        });
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
