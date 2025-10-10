
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";

Vue.filter("date", (value: string) => HelperFormat.date(value));
