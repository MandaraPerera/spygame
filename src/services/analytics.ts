import {type Analytics, getAnalytics, isSupported, setAnalyticsCollectionEnabled} from "firebase/analytics";
import {app} from "./firebase";

let analytics: Analytics | null = null

// Analytics (and its cookies) only start after the visitor agreed to it (see ConsentBanner).
export async function startAnalytics() {
    if (!(await isSupported())) return

    analytics = analytics ?? getAnalytics(app)
    setAnalyticsCollectionEnabled(analytics, true)
}

// Never initialises Analytics just to switch it off.
export async function stopAnalytics() {
    if (analytics) {
        setAnalyticsCollectionEnabled(analytics, false)
    }
}
