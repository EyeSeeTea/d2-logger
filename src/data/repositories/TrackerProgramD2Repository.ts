import { D2Api } from "../../types/d2-api";
import { apiToFuture, FutureData } from "../../data/api-futures";
import { Future } from "../../domain/entities/generic/Future";
import { TrackerProgramLoggerConfig } from "../../domain/entities/LoggerConfig";
import { ProgramRepository } from "../../domain/repositories/ProgramRepository";

export class TrackerProgramD2Repository implements ProgramRepository {
    checkConfig(config: TrackerProgramLoggerConfig): FutureData<boolean> {
        const { baseUrl, auth, trackerProgramId } = config;

        const d2Api = new D2Api({ baseUrl: baseUrl, auth: auth });

        return apiToFuture(
            d2Api.models.programs.get({
                fields: trackerProgramFields,
                filter: { id: { eq: trackerProgramId } },
            })
        ).flatMap(response => {
            if (response?.objects[0]?.id) {
                return Future.success(response.objects[0]?.id === trackerProgramId);
            } else {
                return Future.error(
                    new Error(
                        `Tracker program with id ${trackerProgramId} not found. Logger not initialized`
                    )
                );
            }
        });
    }
}

const trackerProgramFields = {
    id: true,
} as const;
