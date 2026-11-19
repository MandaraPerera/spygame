import {useEffect} from "react";
import {useLocalStorage} from "usehooks-ts";
import {startAnalytics, stopAnalytics} from "@/services";

export type AnalyticsConsent = "granted" | "denied" | null

export function useAnalyticsConsent() {
    const [consent, setConsent] = useLocalStorage<AnalyticsConsent>('analyticsConsent', null)

    useEffect(() => {
        if (consent === "granted") {
            void startAnalytics()
        } else if (consent === "denied") {
            void stopAnalytics()
        }
    }, [consent]);

    return {consent, setConsent}
}
