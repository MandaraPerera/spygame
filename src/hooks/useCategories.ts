import {db} from "@/services/firebase.ts";
import {collection, getDocs} from "firebase/firestore";
import {Category} from "@/model";
import {useQuery} from "@tanstack/react-query";

const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Category[];
}

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 5
    })
}