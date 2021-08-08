import { computed } from "vue";
import { wordsToDelete, newWords, wordsToRestore } from "@/composable/datasets_manager/submodules/useWordsManager";
import { iconName, customIcon, fancyLetters, title, description, restrictions } from "@/composable/datasets_manager/submodules/useGeneralInformations";
import { datasetToModify } from "@/composable/datasets_manager/useModifier";

export default computed<boolean>(() => {
    const wordsToDeleteAreEmpty = wordsToDelete.value.length === 0;
    const wordsToRestoreAreEmpty = wordsToRestore.value.length === 0;
    const thereAreNoNewWords = newWords.value.length === 0;
    const iconHasNotChanged = customIcon.value === null && iconName.value === datasetToModify.value?.icon;
    const fancyLettersHaveNotChanged = JSON.stringify(datasetToModify.value?.fancyLetters) === JSON.stringify(fancyLetters.value);
    const titleHasNotChanged = title.value === datasetToModify.value?.title;
    const descriptionHasNotChanged = description.value === datasetToModify.value?.description;

    const titleDoesNotMatchRestrictions = title.value.length < restrictions.title.min || title.value.length > restrictions.title.max;
    const descriptionDoesNotMatchRestrictions = description.value.length < restrictions.description.min || description.value.length > restrictions.description.max;
    return (
        // NOTHING HAS BEEN CHANGED
        (wordsToDeleteAreEmpty && //
            wordsToRestoreAreEmpty &&
            thereAreNoNewWords &&
            iconHasNotChanged &&
            fancyLettersHaveNotChanged &&
            titleHasNotChanged &&
            descriptionHasNotChanged) ||
        // SOMETHING HAS BEEN INCORRECTLY CHANGED
        titleDoesNotMatchRestrictions ||
        descriptionDoesNotMatchRestrictions
    );
});
