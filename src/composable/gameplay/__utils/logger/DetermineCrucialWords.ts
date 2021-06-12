import fse from "fs-extra";
import path from "path";
import Word from "@/types/Word";
import { ProgressPoints } from "@/types/logger/Progress";
import { CrucialWordsDeterminationResult, CrucialWords, NewCrucialWords, RemovedCrucialWords, CrucialWordsFilesPaths } from "@/types/logger/CrucialWords";
import { originalData } from "@/composable/gameplay/data";
import { crucialWordsDirPath } from "@/composable/paths";
import { gameplayDataFileName } from "../../main";

class DetermineCrucialWords {
    paths: CrucialWordsFilesPaths = {
        weakWords: path.join(crucialWordsDirPath, "weak.json"),
        strongWords: path.join(crucialWordsDirPath, "strong.json"),
        masteredWords: path.join(crucialWordsDirPath, "mastered.json"),
    };
    crucialLevelsBorders = {
        strong: (process.env.VUE_APP_POINTS_TO_DEFINE_STRONG || 3) as number,
        weak: (process.env.VUE_APP_POINTS_TO_DEFINE_WEAK || -3) as number,
        mastered: (process.env.VUE_APP_POINTS_TO_DEFINE_MASTERED || 5) as number,
    };
    currentDeterminedCrucialWords: CrucialWordsDeterminationResult<string> = {
        weakWords: [],
        strongWords: [],
        masteredWords: [],
    };
    alreadySavedCrucialWords: CrucialWordsDeterminationResult<Word> = {
        weakWords: [],
        strongWords: [],
        masteredWords: [],
    };

    constructor(private points: ProgressPoints) {}

    transformEnglishKeyToWordType(english: string): Word | undefined {
        return originalData.find((target) => target.english === english);
    }

    determineAllCrucialWords() {
        const { points, crucialLevelsBorders, currentDeterminedCrucialWords } = this;
        const { masteredWords, weakWords, strongWords } = currentDeterminedCrucialWords;

        Object.keys(points).forEach((english) => {
            const val = points[english];
            //
            if (val >= crucialLevelsBorders.mastered) masteredWords.push(english);
            else if (val >= crucialLevelsBorders.strong) strongWords.push(english);
            else if (val <= crucialLevelsBorders.weak) weakWords.push(english);
        });
    }

    determineWhichCrucialWordIsNew(): NewCrucialWords {
        const newCrucialWords: CrucialWordsDeterminationResult<string | Word> = { weakWords: [], strongWords: [], masteredWords: [] };
        ["weakWords", "strongWords", "masteredWords"].forEach((propname) => {
            this.currentDeterminedCrucialWords[propname as keyof CrucialWordsDeterminationResult<string>].filter((target: string) => {
                if (!this.alreadySavedCrucialWords[propname as keyof CrucialWordsDeterminationResult<string>].find((word: Word) => target === word.english)) {
                    newCrucialWords[propname as keyof CrucialWordsDeterminationResult<string>].push(target);
                }
            });
            // eslint-disable-next-line
            newCrucialWords[propname as keyof CrucialWordsDeterminationResult<string>] = (newCrucialWords as any)[propname].map((target: string) => this.transformEnglishKeyToWordType(target));
        });
        return newCrucialWords as NewCrucialWords;
    }

    determineWhichCrucialWordWasRemoved(): RemovedCrucialWords {
        const removedCrucialWords: RemovedCrucialWords = { weakWords: [], strongWords: [] };
        ["weakWords", "strongWords"].forEach((propname) => {
            this.alreadySavedCrucialWords[propname as keyof CrucialWordsDeterminationResult<Word>].forEach((target: Word) => {
                if (!this.currentDeterminedCrucialWords[propname as keyof CrucialWordsDeterminationResult<string>].find((el) => el === target.english)) {
                    removedCrucialWords[propname as keyof RemovedCrucialWords].push(target);
                }
            });
        });
        return removedCrucialWords as RemovedCrucialWords;
    }

    async saveChanges() {
        const translateKeysToWords = (list: string[]): Word[] => {
            return list.map((word: string) => this.transformEnglishKeyToWordType(word)) as Word[];
        };
        await fse.writeJson(path.join(crucialWordsDirPath, gameplayDataFileName.value + ".json"), {
            strong: translateKeysToWords(this.currentDeterminedCrucialWords.strongWords),
            mastered: translateKeysToWords(this.currentDeterminedCrucialWords.masteredWords),
            weak: translateKeysToWords(this.currentDeterminedCrucialWords.weakWords),
        });
    }
    async loadAlreadySavedCrucialWords() {
        const loaded = await fse.readJson(path.join(crucialWordsDirPath, gameplayDataFileName.value + ".json"));
        this.alreadySavedCrucialWords = {
            weakWords: loaded.weak,
            strongWords: loaded.strong,
            masteredWords: loaded.mastered,
        };
    }
    async main(): Promise<CrucialWords> {
        await this.loadAlreadySavedCrucialWords();
        this.determineAllCrucialWords();
        const newCrucialWords: NewCrucialWords = this.determineWhichCrucialWordIsNew();
        const removedCrucialWords: RemovedCrucialWords = this.determineWhichCrucialWordWasRemoved();
        await this.saveChanges();
        // data for logging
        return {
            words_made_mastered: newCrucialWords.masteredWords,
            words_made_strong: newCrucialWords.strongWords,
            words_made_weak: newCrucialWords.weakWords,
            words_removed_from_strong: removedCrucialWords.strongWords,
            words_removed_from_weak: removedCrucialWords.weakWords,
        };
    }
}

export default (points: ProgressPoints) => new DetermineCrucialWords(points).main();
