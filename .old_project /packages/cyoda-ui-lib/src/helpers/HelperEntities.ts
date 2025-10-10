import HelperFeatureFlags from "./HelperFeatureFlags";

export default class HelperEntities {
    static entityTypeMapper(value: any) {
        const map = {
            BUSINESS: "Business",
            PERSISTENCE: "Technical"
        };

        return map[value];
    }

    static getOptionsFromData(data, type = null) {
        return data.map((el: string) => {
            if (HelperFeatureFlags.isUseModelsInfo()) {
                if (type && el.type !== type) return null;
                return {
                    value: el.name,
                    label: HelperEntities.getLabel(el)
                };
            } else {
                return {
                    value: el,
                    label: el
                };
            }
        }).filter((el) => el);
    }

    static getLabel(el) {
        let type = "(Missing)"
        if (el.type === "PERSISTENCE") type = "(Technical)";
        if (el.type === "BUSINESS") type = "(Business)";
        return `${el.name} ${type}`;
    }

    static getShortNameOfEntity(el) {
        if (el.startsWith("com.cyoda.") || el.startsWith("net.cyoda.") || el.includes(".cyoda.")) {
            return el.split(".").pop();
        }
        return el;
    }
}
