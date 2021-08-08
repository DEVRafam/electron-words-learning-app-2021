import path from "path";
import fse from "fs-extra";
import { archivePath } from "@/composable/paths";
import { datasetToModify, isDatasetJustCreated } from "@/composable/datasets_manager/useModifier";
import { datasetArchivedWords } from "@/composable/datasets_manager/submodules/useWordsManager";

export default async () => {
    if (datasetArchivedWords.value === null && datasetToModify.value !== null && !isDatasetJustCreated.value) {
        const p = path.join(archivePath, datasetToModify.value?.fileName + ".json");
        datasetArchivedWords.value = await fse.readJSON(p);
    }
};
