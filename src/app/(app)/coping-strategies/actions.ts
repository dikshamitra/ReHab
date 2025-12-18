"use server";

import { revalidatePath } from "next/cache";
import { suggestCopingStrategies, type CopingStrategyInput } from "@/ai/flows/coping-strategy-suggestions";

export async function getCopingStrategiesAction(input: CopingStrategyInput) {
    try {
        const result = await suggestCopingStrategies(input);
        revalidatePath("/coping-strategies");
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to generate coping strategies: ${errorMessage}` };
    }
}
