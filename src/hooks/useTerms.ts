import {useQuery} from "@tanstack/react-query";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "@/services/firebase.ts";
import {Term} from "@/model";

const TERMS_COLLECTION = 'terms';

const fetchTermsOfCategory = async (categoryIds: string[]) => {
    const terms: Term[] = [];

    for (const categoryId of categoryIds) {
        const termsQuery = query(collection(db, TERMS_COLLECTION), where("categoryId", "==", categoryId));
        const querySnapshot = await getDocs(termsQuery);

        terms.push(...(
            querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })) as Term[]
        ));
    }

    return terms
}

export const useTerms = (categoryIds: string[]) => {
    return useQuery({
        queryKey: ["terms", categoryIds],
        queryFn: ({queryKey}) => {
            const [, categoryIds] = queryKey;
            return fetchTermsOfCategory(categoryIds as string[]);
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!categoryIds
    })
}