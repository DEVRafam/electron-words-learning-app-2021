import Word from "@/types/Word";
import { datasetToModify, isDatasetJustCreated } from "@/composable/datasets_manager/useModifier";
import { datasetCurrentWords } from "@/composable/datasets_manager/submodules/useWordsManager";
import { loadSingleGameplayFile } from "@/composable/datasets_loaders/useDatasetsLoader";
import CurrentWord from "@/classes/CurrentWord";
import loadCrucials from "./loadCrucialsButOtherApproach";
//
export default async () => {
    if (datasetCurrentWords.value == null && datasetToModify.value && !isDatasetJustCreated.value) {
        // LOAD CURRENT WORDS
        const { words } = await loadSingleGameplayFile(datasetToModify.value.fileName);
        // LOAD PROGRESS WORDS
        const { strong, weak, mastered } = await loadCrucials();
        datasetCurrentWords.value = words.map((word: Word): CurrentWord => {
            const currentWord = new CurrentWord(word);
            currentWord._determineProgress(mastered, strong, weak);
            return currentWord;
        });
    }
};
