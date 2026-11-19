import {useQuery} from "@tanstack/react-query";
import {logKeys, LOGS_LIMIT} from "@/config";
import {readLogs} from "@/services";

export function useLogs() {
    return useQuery({
        queryKey: logKeys.all,
        queryFn: () => readLogs(LOGS_LIMIT),
        staleTime: 60 * 1000
    })
}
