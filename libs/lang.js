import { getText } from "@zos/i18n";
import { getLanguage } from "@zos/settings";

const maxNumber = 114;
let numbersMapping;
function mapNumbers() {
    numbersMapping = {};
    for (let i = 0; i <= maxNumber; i++) {
        const numText = i + "";

        let result = "";
        for (let i = 0; i < numText.length; i++) {
            result += getText(numText[i]);
        };

        numbersMapping[numText] = " "  + result;
    }
}

export function _(text) {
    if (isNaN(text)) return getText(text);
    if (!numbersMapping) mapNumbers();
    return numbersMapping[text];
}

const languages = ["zh-CN","zh-TW","en-US","es-ES","ru-RU","ko-KR","fr-FR","de-DE","id-ID","pl-PL","it-IT","ja-JP","th-TH","ar-EG","vi-VN","pt-PT","nl-NL","tr-TR","uk-UA","iw-IL","pt-BR","ro-RO","cs-CZ","el-GR","sr-RS","ca-ES","fi-FI","nb-NO","da-DK","sv-SE","hu-HU","ms-MY","sk-SK","hi-IN"];

export function getLanguageCode() {
    return languages[getLanguage()];
}
