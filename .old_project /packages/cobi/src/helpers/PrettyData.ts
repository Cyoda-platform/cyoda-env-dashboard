/**
 * pretty-data - nodejs plugin to pretty-print or minify data in XML, JSON and CSS formats.
 *
 *  pd.xml(data ) - pretty print XML;
 *  pd.json(data) - pretty print JSON;
 *  pd.css(data ) - pretty print CSS;
 *  pd.sql(data)  - pretty print SQL;
 *
 *  pd.xmlmin(data [, preserveComments] ) - minify XML;
 *  pd.jsonmin(data)                      - minify JSON;
 *  pd.cssmin(data [, preserveComments] ) - minify CSS;
 *  pd.sqlmin(data)                       - minify SQL;
 *
 * PARAMETERS:
 *
 *  @data        - String; XML, JSON, CSS or SQL text to beautify;
 *  @preserveComments  - Bool (optional, used in minxml and mincss only);
 *          Set this flag to true to prevent removing comments from @text;
 *  @Return    - String;
 *
 * USAGE:
 *
 *  var pd  = require('pretty-data').pd;
 *
 *  var xml_pp   = pd.xml(xml_text);
 *  var xml_min  = pd.xmlmin(xml_text [,true]);
 *  var json_pp  = pd.json(json_text);
 *  var json_min = pd.jsonmin(json_text);
 *  var css_pp   = pd.css(css_text);
 *  var css_min  = pd.cssmin(css_text [, true]);
 *  var sql_pp   = pd.sql(sql_text);
 *  var sql_min  = pd.sqlmin(sql_text);
 *
 * TEST:
 *  comp-name:pretty-data$ node ./test/test_xml
 *  comp-name:pretty-data$ node ./test/test_json
 *  comp-name:pretty-data$ node ./test/test_css
 *  comp-name:pretty-data$ node ./test/test_sql
 */

class PrettyData {
  shift: string[];
  step: string;

  constructor() {
    this.shift = ['\n']; // array of shifts
    this.step = '  '; // 2 spaces

    // initialize array with shifts; nesting level == 100 //
    for (let ix = 0; ix < 100; ix++) {
      this.shift.push(this.shift[ix] + this.step);
    }
  }

  xml(text: string): string {
    const ar = text.replace(/>\s{0,}</g, "><")
      .replace(/</g, "~::~<")
      .replace(/xmlns\:/g, "~::~xmlns:")
      .replace(/xmlns\=/g, "~::~xmlns=")
      .split('~::~');
    let str = '';
    let inComment = false;
    let deep = 0;

    for (let ix = 0; ix < ar.length; ix++) {
      if (ar[ix].search(/<!/) > -1) {
        str += this.shift[deep] + ar[ix];
        inComment = true;
        if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
          inComment = false;
        }
      } else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
        str += ar[ix];
        inComment = false;
      } else if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) &&
        /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')) {
        str += ar[ix];
        if (!inComment) deep--;
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
        str = !inComment ? str += this.shift[deep++] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += this.shift[deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += this.shift[--deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/\/>/) > -1) {
        str = !inComment ? str += this.shift[deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\?/) > -1) {
        str += this.shift[deep] + ar[ix];
      } else if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
        str += this.shift[deep] + ar[ix];
      } else {
        str += ar[ix];
      }
    }

    return (str[0] == '\n') ? str.slice(1) : str;
  }

  json(text: string | object): string | null {
    if (typeof text === "string") {
      return JSON.stringify(JSON.parse(text), null, this.step);
    }
    if (typeof text === "object") {
      return JSON.stringify(text, null, this.step);
    }
    return null;
  }

  css(text: string): string {
    const ar = text.replace(/\s{1,}/g, ' ')
      .replace(/\{/g, "{~::~")
      .replace(/\}/g, "~::~}~::~")
      .replace(/\;/g, ";~::~")
      .replace(/\/\*/g, "~::~/*")
      .replace(/\*\//g, "*/~::~")
      .replace(/~::~\s{0,}~::~/g, "~::~")
      .split('~::~');
    let str = '';
    let deep = 0;

    for (let ix = 0; ix < ar.length; ix++) {
      if (/\{/.exec(ar[ix])) {
        str += this.shift[deep++] + ar[ix];
      } else if (/\}/.exec(ar[ix])) {
        str += this.shift[--deep] + ar[ix];
      } else if (/\*\\/.exec(ar[ix])) {
        str += this.shift[deep] + ar[ix];
      } else {
        str += this.shift[deep] + ar[ix];
      }
    }
    return str.replace(/^\n{1,}/, '');
  }

  sql(text: string): string {
    function isSubquery(str: string, parenthesisLevel: number): number {
      return parenthesisLevel - (str.replace(/\(/g, '').length - str.replace(/\)/g, '').length);
    }

    function split_sql(str: string, tab: string): string[] {
      return str.replace(/\s{1,}/g, " ")
        .replace(/ AND /ig, "~::~" + tab + tab + "AND ")
        .replace(/ BETWEEN /ig, "~::~" + tab + "BETWEEN ")
        .replace(/ CASE /ig, "~::~" + tab + "CASE ")
        .replace(/ ELSE /ig, "~::~" + tab + "ELSE ")
        .replace(/ END /ig, "~::~" + tab + "END ")
        .replace(/ FROM /ig, "~::~FROM ")
        .replace(/ GROUP\s{1,}BY/ig, "~::~GROUP BY ")
        .replace(/ HAVING /ig, "~::~HAVING ")
        .replace(/ IN /ig, " IN ")
        .replace(/ JOIN /ig, "~::~JOIN ")
        .replace(/ CROSS~::~{1,}JOIN /ig, "~::~CROSS JOIN ")
        .replace(/ INNER~::~{1,}JOIN /ig, "~::~INNER JOIN ")
        .replace(/ LEFT~::~{1,}JOIN /ig, "~::~LEFT JOIN ")
        .replace(/ RIGHT~::~{1,}JOIN /ig, "~::~RIGHT JOIN ")
        .replace(/ ON /ig, "~::~" + tab + "ON ")
        .replace(/ OR /ig, "~::~" + tab + tab + "OR ")
        .replace(/ ORDER\s{1,}BY/ig, "~::~ORDER BY ")
        .replace(/ OVER /ig, "~::~" + tab + "OVER ")
        .replace(/\(\s{0,}SELECT /ig, "~::~(SELECT ")
        .replace(/\)\s{0,}SELECT /ig, ")~::~SELECT ")
        .replace(/ THEN /ig, " THEN~::~" + tab + "")
        .replace(/ UNION /ig, "~::~UNION~::~")
        .replace(/ USING /ig, "~::~USING ")
        .replace(/ WHEN /ig, "~::~" + tab + "WHEN ")
        .replace(/ WHERE /ig, "~::~WHERE ")
        .replace(/ WITH /ig, "~::~WITH ")
        .replace(/ ALL /ig, " ALL ")
        .replace(/ AS /ig, " AS ")
        .replace(/ ASC /ig, " ASC ")
        .replace(/ DESC /ig, " DESC ")
        .replace(/ DISTINCT /ig, " DISTINCT ")
        .replace(/ EXISTS /ig, " EXISTS ")
        .replace(/ NOT /ig, " NOT ")
        .replace(/ NULL /ig, " NULL ")
        .replace(/ LIKE /ig, " LIKE ")
        .replace(/\s{0,}SELECT /ig, "SELECT ")
        .replace(/~::~{1,}/g, "~::~")
        .split('~::~');
    }

    let ar_by_quote = text.replace(/\s{1,}/g, " ")
      .replace(/\'/ig, "~::~\'")
      .split('~::~');
    let ar: string[] = [];
    let deep = 0;
    let tab = this.step;
    let parenthesisLevel = 0;
    let str = '';

    for (let ix = 0; ix < ar_by_quote.length; ix++) {
      if (ix % 2) {
        ar = ar.concat(ar_by_quote[ix]);
      } else {
        ar = ar.concat(split_sql(ar_by_quote[ix], tab));
      }
    }

    for (let ix = 0; ix < ar.length; ix++) {
      parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);

      if (/\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix])) {
        ar[ix] = ar[ix].replace(/\,/g, ",\n" + tab + tab + "");
      }

      if (/\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix])) {
        deep++;
        str += this.shift[deep] + ar[ix];
      } else if (/\'/.exec(ar[ix])) {
        if (parenthesisLevel < 1 && deep) {
          deep--;
        }
        str += ar[ix];
      } else {
        str += this.shift[deep] + ar[ix];
        if (parenthesisLevel < 1 && deep) {
          deep--;
        }
      }
    }

    str = str.replace(/^\n{1,}/, '').replace(/\n{1,}/g, "\n");
    return str;
  }

  xmlmin(text: string, preserveComments: boolean = false): string {
    const str = preserveComments ? text
      : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "");
    return str.replace(/>\s{0,}</g, "><");
  }

  jsonmin(text: string): string {
    return text.replace(/\s{0,}\{\s{1,}/g, "{")
      .replace(/\s{0,}\[$/g, "[")
      .replace(/\[\s{0,}/g, "[")
      .replace(/:\s{0,}\[/g, ":[")
      .replace(/\s{1,}\}\s{0,}/g, "}")
      .replace(/\s{0,}\]\s{0,}/g, "]")
      .replace(/\"\s{0,}\,/g, '",')
      .replace(/\,\s{0,}\"/g, ',"')
      .replace(/\"\s{0,}:/g, '":')
      .replace(/:\s{0,}\"/g, '":"')
      .replace(/:\s{0,}\[/g, ":[")
      .replace(/\,\s{0,}\[/g, ",[")
      .replace(/\,\s{2,}/g, ', ')
      .replace(/\]\s{0,},\s{0,}\[/g, "],[");
  }

  cssmin(text: string, preserveComments: boolean): string {
    const str = preserveComments ? text
      : text.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g, "");
    return str.replace(/\s{1,}/g, ' ')
      .replace(/\{\s{1,}/g, "{")
      .replace(/\}\s{1,}/g, "}")
      .replace(/\;\s{1,}/g, ";")
      .replace(/\/\*\s{1,}/g, "/*")
      .replace(/\*\/\s{1,}/g, "*/");
  }

  sqlmin(text: string): string {
    return text.replace(/\s{1,}/g, " ").replace(/\s{1,}\(/, "(").replace(/\s{1,}\)/, ")");
  }
}

export default new PrettyData();

